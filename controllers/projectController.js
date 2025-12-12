const { Op } = require("sequelize");
const {
  Project,
  Participant,
  ProjectDocument,
  Client,
  User,
  Notification,
  Author,
  sequelize,
} = require("../models");
const { validateQueryParams } = require("../utils/validateQueryParams");
const {
  CLIENT,
  CLIENT_VENDOR,
  PROJECT_COORDINATOR,
  ADMIN,
} = require("../utils/constants");
const { sendNotification } = require("../websocket");
const { convertToIST } = require("../utils/dateConverter");
const { createNotifications } = require("../services/notificationService");

exports.createProject = async (req, res) => {
  const { projectName, clientType, clientId } = req.body;
  try {
    const project = await Project.create({
      projectName,
      clientType,
      clientId: clientType === "CLIENT" ? clientId : null,
      clientVendorId: clientType === "CLIENT_VENDOR" ? clientId : null,
    });

    res.status(201).json({
      success: true,
      data: project,
      message: "Project created successfully.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateInfo = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      projectTitle,
      clientName,
      clientEmail,
      university,
      degreeLevel,
      researchArea,
      typeOfAssistanceNeeded,
      projectDetails,
      expectedOutcome,
      deadline,
      additionalNote,
      authors,
    } = req.body;

    const role = req.user.role;
    const clientId = req.user.id;

    const project = await Project.findOne({
      where: {
        id: req.params.projectId,
        clientId: role === "CLIENT" ? clientId : null,
        clientVendorId: role === "CLIENT_VENDOR" ? clientId : null,
      },
    });

    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found." });
    }

    if (project.isBlock && (role === CLIENT || role === CLIENT_VENDOR)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to perform action on stop project.",
      });
    }

    project.projectTitle = projectTitle;
    project.clientName = clientName;
    project.clientEmail = clientEmail;
    project.university = university;
    project.degreeLevel = degreeLevel;
    project.researchArea = researchArea;
    project.typeOfAssistanceNeeded = typeOfAssistanceNeeded;
    project.projectDetails = projectDetails;
    project.expectedOutcome = expectedOutcome;
    project.deadline = deadline;
    project.additionalNote = additionalNote;
    project.updatedAt = new Date();

    let authorsData = [];
    if (authors && authors.length > 0) {
      authorsData = authors.map((author) => ({
        projectId: project.id,
        name: author.name,
        email: author.email,
        orcidId: author.orcidId,
        scholarLink: author.scholarLink,
        collegeAffiliation: author.collegeAffiliation,
        designation: author.designation,
      }));
    }

    if (authorsData?.length > 0) {
      await Author.bulkCreate(authorsData, {
        transaction,
      });
    }

    await project.save({ transaction });

    await transaction.commit();

    res.status(200).json({
      success: true,
      data: project,
      message: "Information collected successfully.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addParticipants = async (req, res) => {
  try {
    const participants = req.body.participants;
    const projectId = req.params.projectId;

    if (
      !participants ||
      !Array.isArray(participants) ||
      participants.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Participants array is required and cannot be empty.",
      });
    }

    const project = await Project.findByPk(projectId);

    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found." });
    }

    for (let participant of participants) {
      await Participant.findOrCreate({
        where: {
          projectId,
          employeeId: participant,
        },
        defaults: {
          projectId,
          employeeId: participant,
        },
      });
    }

    project.assignedDate = new Date();
    project.updatedAt = new Date();
    await project.save();

    res.status(200).json({
      success: true,
      data: participants,
      message: "Employee's assigned successfully.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getParticipants = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const participants = await Participant.findAll({
      where: {
        projectId,
      },
      include: {
        model: User,
        as: "employee",
        attributes: ["id", "name", "email", "mobileNumber"],
      },
    });

    const data = participants.map((item) => ({
      ...item.toJSON().employee,
      participantId: item.id,
    }));

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.uploadDocument = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide document." });
    }
    const { documentName, documentType } = req.body;
    if (!documentName || documentName.trim().length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }
    if (!["reference", "important", "final"].includes(documentType)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid document type." });
    }

    const role = req.user.role;
    const id = req.user.id;
    const name = req.user.name;

    const project = req.project;

    if (project.isBlock && (role === CLIENT || role === CLIENT_VENDOR)) {
      return res.status(403).json({
        success: false,
        message:
          "Access is restricted. Please contact your administrator for assistance.",
      });
    }

    const document = `data:${
      req.file.mimetype
    };base64,${req.file.buffer.toString("base64")}`;

    const uploadBy =
      role === CLIENT || role === CLIENT_VENDOR ? "CLIENT" : "MRR";

    const projectDocument = await ProjectDocument.create(
      {
        projectId: project.id,
        documentName: documentName,
        documentType: documentType,
        document,
        fileName: req.file.originalname,
        uploadDate: new Date(),
        uploadBy,
        clientId: role === CLIENT ? id : null,
        userId: role === CLIENT ? null : id,
      },
      {
        transaction,
      }
    );

    const notificationPayload = {
      projectId: project.id,
      type: "document",
      message: `${req.user.name} uploaded ${documentName} document for project ${project.projectName}(${project.id}).`,
    };

    // const participants = await Participant.findAll({
    //   where: {
    //     projectId: project.id,
    //     ...(role === PROJECT_COORDINATOR
    //       ? {
    //           employeeId: {
    //             [Op.ne]: id,
    //           },
    //         }
    //       : {}),
    //   },
    // });

    // if (role === CLIENT || role === CLIENT_VENDOR) {
    //   await Notification.create(
    //     {
    //       ...notificationPayload,
    //       clientId: role === CLIENT ? null : project.clientId,
    //       userId: role === CLIENT_VENDOR ? null : project.clientVendorId,
    //     },
    //     {
    //       transaction,
    //     }
    //   );
    // } else {
    //   await Notification.create(
    //     {
    //       ...notificationPayload,
    //       clientId: project.clientId,
    //       userId: null,
    //     },
    //     {
    //       transaction,
    //     }
    //   );
    //   await Notification.create(
    //     {
    //       ...notificationPayload,
    //       clientId: null,
    //       userId: project.clientVendorId,
    //     },
    //     {
    //       transaction,
    //     }
    //   );
    // }

    // let notificationData = [];

    // const admin = await User.findAll({
    //   attributes: ["id"],
    //   where: {
    //     role: ADMIN,
    //   },
    // });

    // for (let i = 0; i < admin.length; i++) {
    //   notificationData.push({
    //     ...notificationPayload,
    //     clientId: null,
    //     userId: admin[i].id,
    //   });
    // }

    // for (let i = 0; i < participants.length; i++) {
    //   notificationData.push({
    //     ...notificationPayload,
    //     clientId: null,
    //     userId: participants[i].employeeId,
    //   });
    // }

    // await Notification.bulkCreate(notificationData, {
    //   transaction,
    // });

    await createNotifications(
      project,
      notificationPayload,
      id,
      role,
      transaction
    );

    project.updatedAt = new Date();
    await project.save({ transaction });

    sendNotification(
      {
        ...notificationPayload,
        type: "notification",
        type2: "document",
        uploadBy,
        document: {
          id: projectDocument.id,
          documentName: projectDocument.documentName,
          fileName: projectDocument.fileName,
          uploadDate: convertToIST(projectDocument.uploadDate),
          uploadBy: name,
        },
      },
      project.id,
      id,
      role
    );

    await transaction.commit();

    res.status(200).json({
      success: true,
      data: {
        ...projectDocument.toJSON(),
        uploadBy: req.user.name,
        uploadDate: convertToIST(projectDocument.uploadDate),
      },
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const { page, limit, searchTerm, offset } = validateQueryParams({
      ...req.query,
    });
    let { employeeId, clientVendorId, clientType, status, priority } =
      req.query;

    const role = req.user.role;
    const id = req.user.id;

    const whereClause = {};
    if (searchTerm) {
      whereClause[Op.or] = [
        { id: { [Op.like]: `%${searchTerm}%` } },
        { projectName: { [Op.like]: `%${searchTerm}%` } },
        { clientName: { [Op.like]: `%${searchTerm}%` } },
        { clientEmail: { [Op.like]: `%${searchTerm}%` } },
        { "$client.mobileNumber$": { [Op.like]: `%${searchTerm}%` } },
        { "$clientVendor.mobileNumber$": { [Op.like]: `%${searchTerm}%` } },
      ];
    }

    if (clientType === CLIENT || clientType === CLIENT_VENDOR) {
      whereClause.clientType = clientType;
    }

    if (["low", "medium", "high", "on-hold", "active"].includes(priority)) {
      whereClause.priority = priority;
    }

    if (["pending", "in-progress", "on-hold", "completed"].includes(status)) {
      whereClause.status = status;
    }

    const includes = [
      {
        model: Client,
        attributes: ["id", "name", "email", "mobileNumber"],
        as: "client",
      },
      {
        model: User,
        attributes: ["id", "name", "email", "mobileNumber"],
        as: "clientVendor",
      },
    ];
    if (role === "CLIENT") {
      whereClause.clientId = id;
    } else if (role === "CLIENT_VENDOR" || clientVendorId) {
      whereClause.clientVendorId = clientVendorId || id;
    } else if (role === "PROJECT_COORDINATOR" || employeeId) {
      includes.push({
        model: Participant,
        attributes: ["employeeId"],
        as: "employee",
      });
      whereClause["$employee.employeeId$"] = employeeId || id;
    }

    const { count, rows } = await Project.findAndCountAll({
      where: whereClause,
      attributes: [
        "id",
        "projectName",
        "clientType",
        "clientName",
        "clientId",
        "clientVendorId",
        "assignedDate",
        "status",
        "priority",
        "isBlock",
      ],
      include: includes,
      offset: offset,
      limit: limit,
      order: [["updatedAt", "DESC"]],
    });

    const data = rows.map((project) => ({
      id: project.id,
      projectName: project.projectName,
      vendorClientName: project.clientName,
      projectTitle: project.projectTitle,
      clientType: project.clientType,
      isBlock: project.isBlock,
      clientName:
        project.clientType === "CLIENT"
          ? project.client.name
          : project.clientVendor.name,
      clientEmail:
        project.clientType === "CLIENT"
          ? project.client.email
          : project.clientVendor.email,
      clientMobileNumber:
        project.clientType === "CLIENT"
          ? project.client.mobileNumber
          : project.clientVendor.mobileNumber,
      assignedDate: project.assignedDate
        ? convertToIST(project.assignedDate)
        : "NA",
      status: project.status,
      priority: project.priority,
    }));

    res.status(200).json({
      success: true,
      data: {
        data,
        pagination: {
          totalItems: count,
          totalPages: Math.ceil(count / limit),
          currentPage: page,
          itemsPerPage: limit,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const role = req.user.role;
    const id = req.user.id;
    const whereClause = {
      id: req.params.projectId,
    };
    if (role === "CLIENT") {
      whereClause.clientId = id;
    } else if (role === "CLIENT_VENDOR") {
      whereClause.clientVendorId = id;
    } else if (role === "PROJECT_COORDINATOR") {
      const isAssigned = await Participant.findOne({
        where: { projectId: req.params.projectId, employeeId: id },
      });
      if (!isAssigned) {
        return res
          .status(403)
          .json({ success: false, message: "Access denied." });
      }
    }

    const project = await Project.findOne({
      where: whereClause,
      include: [
        {
          model: Client,
          attributes: [
            "id",
            "name",
            "email",
            "mobileNumber",
            "address",
            "pinCode",
          ],
          as: "client",
        },
        {
          model: User,
          attributes: [
            "id",
            "name",
            "email",
            "mobileNumber",
            "address",
            "pinCode",
          ],
          as: "clientVendor",
        },
        {
          model: Author,
          as: "authors",
          attributes: [
            "id",
            "name",
            "email",
            "orcidId",
            "scholarLink",
            "collegeAffiliation",
            "designation",
          ],
        },
      ],
    });

    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found." });
    }

    if (project.isBlock && (role === CLIENT || role === CLIENT_VENDOR)) {
      return res.status(403).json({
        success: false,
        message:
          "Access is restricted. Please contact your administrator for assistance.",
      });
    }

    const data = {
      id: project.id,
      projectName: project.projectName,
      projectTitle: project.projectTitle,
      clientType: project.clientType,
      clientName: project.clientName,
      clientEmail: project.clientEmail,
      // clientName:
      //   project.clientType === "CLIENT"
      //     ? project.client.name
      //     : project.clientVendor.name,
      // clientEmail:
      //   project.clientType === "CLIENT"
      //     ? project.client.email
      //     : project.clientVendor.email,
      clientMobileNumber:
        project.clientType === CLIENT
          ? project.client.mobileNumber
          : project.clientVendor.mobileNumber,
      address:
        project.clientType === CLIENT
          ? project.client.address
          : project.clientVendor.address,
      pinCode:
        project.clientType === CLIENT
          ? project.client.pinCode
          : project.clientVendor.pinCode,
      assignedDate: convertToIST(project.assignedDate),
      status: project.status,
      priority: project.priority,
      university: project.university,
      degreeLevel: project.degreeLevel,
      researchArea: project.researchArea,
      typeOfAssistanceNeeded: project.typeOfAssistanceNeeded,
      projectDetails: project.projectDetails,
      expectedOutcome: project.expectedOutcome,
      deadline: convertToIST(project.deadline),
      additionalNote: project.additionalNote,
      authors: project.authors,
    };
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProjectDocuments = async (req, res) => {
  try {
    const { page, limit, offset, searchTerm } = validateQueryParams({
      ...req.query,
    });
    const { documentType } = req.query;

    const whereClause = {
      projectId: req.params.projectId,
      uploadBy: req.query.uploadBy || "CLIENT",
    };

    if (searchTerm) {
      whereClause.documentName = {
        [Op.like]: `%${searchTerm}%`,
      };
    }

    if (["reference", "important", "final"].includes(documentType)) {
      whereClause.documentType = documentType;
    }

    const project = req.project;
    if (
      project.isBlock &&
      (req.user.role === CLIENT || req.user.role === CLIENT_VENDOR)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Access is restricted. Please contact your administrator for assistance.",
      });
    }

    const { count, rows } = await ProjectDocument.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Client,
          attributes: ["id", "name"],
          as: "client",
        },
        {
          model: User,
          attributes: ["id", "name"],
          as: "vendorClient",
        },
        {
          model: Project,
          attributes: ["id"],
          as: "project",
        },
      ],
      order: [["uploadDate", "DESC"]],
      offset,
      limit,
    });

    const data = rows.map((doc) => ({
      id: doc.id,
      documentName: doc.documentName,
      documentType: doc.documentType,
      fileName: doc.fileName,
      uploadDate: convertToIST(doc.uploadDate),
      uploadBy: doc.client ? doc.client.name : doc.vendorClient.name,
    }));

    res.status(200).json({
      success: true,
      data: {
        data,
        pagination: {
          totalItems: count,
          totalPages: Math.ceil(count / limit),
          currentPage: page,
          itemsPerPage: limit,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDocumentById = async (req, res) => {
  try {
    const document = await ProjectDocument.findByPk(req.params.documentId, {
      include: {
        model: Project,
        as: "project",
      },
    });
    if (!document) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found." });
    }

    if (
      document.project.isBlock &&
      (req.user.role === CLIENT || req.user.role === CLIENT_VENDOR)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Access is restricted. Please contact your administrator for assistance.",
      });
    }

    const file = document.document.toString("utf8");
    const mimeType = file.match(/^data:(.*);base64,/)[1];

    res.status(200).json({
      success: true,
      data: document.document.toString("utf8"),
      type: mimeType,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateDocument = async (req, res) => {
  try {
    const document = await ProjectDocument.findOne({
      where: {
        id: req.params.documentId,
      },
    });

    if (!document) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found." });
    }

    if (document.uploadBy === CLIENT) {
      return res.status(400).json({
        success: false,
        message: "Client document cannot be updated.",
      });
    }

    if (req.file) {
      document.document = `data:${
        req.file.mimetype
      };base64,${req.file.buffer.toString("base64")}`;
      document.documentName = req.body.documentName || req.file.originalname;
      document.fileName = req.file.originalname;
    } else {
      document.document = document.document.toString("utf8");
    }
    if (req.body.documentName) {
      document.documentName = req.body.documentName;
    }
    if (["reference", "important", "final"].includes(req.body.documentType)) {
      document.documentType = req.body.documentType;
    }

    await Project.update(
      {
        updatedAt: new Date(),
      },
      {
        where: {
          id: req.params.documentId,
        },
        transaction,
      }
    );

    await document.save();
    res.status(200).json({
      success: true,
      data: {
        ...document.toJSON(),
        uploadBy: req.user.name,
        uploadDate: convertToIST(document.uploadDate),
      },
      message: "Document updated successfully.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const document = await ProjectDocument.findOne({
      where: {
        id: req.params.documentId,
      },
    });
    if (!document) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found." });
    }

    await document.destroy();
    res.status(200).json({
      success: true,
      message: "Document deleted successfully.",
      data: document.id,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.changeProjectStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const projectId = req.params.projectId;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required.",
      });
    }

    const project = await Project.findByPk(projectId);
    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found." });
    }

    project.status = status;
    project.updatedAt = new Date();
    await project.save();

    res.status(200).json({
      success: true,
      data: {
        id: project.id,
        status: project.status,
      },
      message: "Project status updated successfully.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.changeProjectPriority = async (req, res) => {
  try {
    const { priority } = req.body;
    const projectId = req.params.projectId;

    if (!priority) {
      return res.status(400).json({
        success: false,
        message: "Priority is required.",
      });
    }

    const project = await Project.findByPk(projectId);
    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found." });
    }

    project.priority = priority;
    project.updatedAt = new Date();
    await project.save();

    res.status(200).json({
      success: true,
      data: {
        id: project.id,
        priority: project.priority,
      },
      message: "Project priority updated successfully.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getClientProjects = async (req, res) => {
  try {
    const role = req.user.role;
    const id = req.user.id;

    const whereClause = {};
    if (role === CLIENT) {
      whereClause.clientId = id;
      whereClause.clientVendorId = null;
    } else {
      whereClause.clientVendorId = id;
      whereClause.clientId = null;
    }

    const data = await Project.findAll({
      where: whereClause,
      attributes: ["id", "projectName"],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ success: true, data: data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.blockAction = async (req, res) => {
  try {
    const project = await Project.findOne({
      where: {
        id: req.params.projectId,
      },
    });

    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found." });
    }

    project.isBlock = !project.isBlock;
    project.updatedAt = new Date();
    await project.save();
    res.status(200).json({
      success: true,
      message: "Project block status updated successfully.",
      data: project.isBlock,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.removeParticipant = async (req, res) => {
  try {
    const participantId = req.params.participantId;
    await Participant.destroy({
      where: {
        id: participantId,
      },
    });
    res
      .status(200)
      .json({ success: true, message: "Participant removed successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
