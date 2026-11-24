"use strict";

const { Op, Sequelize, where } = require("sequelize");
const { validateQueryParams } = require("../utils/validateQueryParams");

const {
  sequelize,
  ProjectDocumentJournal,
  ProjectDocument,
  Project,
  User,
  ProjectJournalArticle,
  JournalArticleStatusHistory,
  Journal,
} = require("../models");

const VALID_STATUSES = [
  "PENDING",
  "SUBMITTED_TO_JOURNAL",
  "TECHNICAL_CHECK",
  "EDITOR_ASSIGNED",
  "UNDER_REVIEW",
  "REQUIRED_REVIEWS_COMPLETED",
  "DECISION_IN_PROCESS",
  "ACCEPTED",
  "REVISION",
  "REJECTED",
  "PRODUCTION_AND_PUBLICATION",
];

exports.addDocumentJournal = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      documentId,
      projectId,
      journalName,
      link,
      quartile,
    } = req.body;

    if (!documentId || !projectId || !journalName || !quartile || !link) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          "documentId, projectId, journalName, link and quartile are required.",
      });
    }

    const parsedDocumentId = Number(documentId);
    const parsedProjectId = projectId;

    if (
      !Number.isInteger(parsedDocumentId) ||
      parsedDocumentId <= 0
    ) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Valid documentId are required.",
      });
    }

    const normalizedJournalName = journalName.trim();

    if (!normalizedJournalName) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Journal name cannot be empty.",
      });
    }

    const validQuartiles = ["Q1", "Q2", "Q3", "Q4"];

    if (!validQuartiles.includes(quartile)) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Quartile must be Q1, Q2, Q3, or Q4.",
      });
    }

    const document = await ProjectDocument.findOne({
    where: {
        id: parsedDocumentId,
        projectId: parsedProjectId,
        documentType:"submissionReady",
    },
    transaction,
    });

    if (!document) {
    await transaction.rollback();

    return res.status(404).json({
        success: false,
        message: "Document not found for the specified project.",
    });
    }

    const existingJournals = await ProjectDocumentJournal.findAll({
      where: {
        documentId: parsedDocumentId,
        projectId: parsedProjectId,
      },
      attributes: ["journalCode"],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    const maxNumber = existingJournals.reduce((max, journal) => {
      const match = journal.journalCode.match(/^G(\d+)$/i);

      return match ? Math.max(max, Number(match[1])) : max;
    }, 0);

    const journalCode = `G${maxNumber + 1}`;

    const journal = await ProjectDocumentJournal.create(
      {
        documentId: parsedDocumentId,
        projectId: parsedProjectId,
        journalCode,
        journalName: normalizedJournalName,
        link: link?.trim() || null,
        quartile,
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: "Journal added successfully.",
      data: journal,
    });
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }

    console.error("Add document journal error:", error);

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        success: false,
        message: "Journal code conflict. Please try again.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to add journal.",
    });
  }
};

//new
exports.addDocumentJournal = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { documentId, projectId, journalId } = req.body;
    if (!documentId || !projectId || !journalId
    ) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "documentId, projectId and journalId are required.",
      });
    }

    const parsedDocumentId = Number(documentId);
    const parsedJournalId = Number(journalId);

    if (
      !Number.isInteger(parsedDocumentId) ||
      parsedDocumentId <= 0
    ) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "A valid documentId is required.",
      });
    }

    if (
      !Number.isInteger(parsedJournalId) ||
      parsedJournalId <= 0
    ) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "A valid journalId is required.",
      });
    }

    const document = await ProjectDocument.findOne({
      where: {
        id: parsedDocumentId,
        projectId,
        documentType: "submissionReady",
      },
      transaction,
    });

    if (!document) {
      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message: "Submission-ready document not found for this project.",
      });
    }

    const masterJournal = await Journal.findByPk(parsedJournalId, {
      transaction,
    });

    if (!masterJournal) {
      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message: "Master journal not found.",
      });
    }

    const existingAssignment = await ProjectDocumentJournal.findOne({
      where: {
        documentId: parsedDocumentId,
        projectId,
        journalId: parsedJournalId,
      },
      transaction,
    });

    if (existingAssignment) {
      await transaction.rollback();

      return res.status(409).json({
        success: false,
        message: "This journal is already assigned to this document.",
      });
    }

    const assignment = await ProjectDocumentJournal.create(
      {
        documentId: parsedDocumentId,
        projectId,
        journalId: masterJournal.id,
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: "Journal assigned to article document successfully.",
      data: assignment,
    });
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }

    console.error("Assign journal to document error:", error);

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        success: false,
        message:
          "This journal assignment or journal code already exists. Please retry.",
      });
    }

    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        success: false,
        message: error.errors.map((item) => item.message).join(", "),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to assign journal to document.",
    });
  }
};

//new
exports.getAllDocumentJournals = async (req, res) => {
  try {
    const {
      projectId,
      documentId,
      quartile,
    } = req.query;

    const { searchTerm } = validateQueryParams({
          ...req.query,
    });

    const whereClause = {};

    if (projectId) {
      whereClause.projectId = projectId;
    }

    if (documentId !== undefined && documentId !== "") {
      const parsedDocumentId = Number(documentId);

      if (!Number.isInteger(parsedDocumentId) || parsedDocumentId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid documentId.",
        });
      }

      whereClause.documentId = parsedDocumentId;
    }

    if (quartile && quartile.trim() !== "") {
      const validQuartiles = ["Q1", "Q2", "Q3", "Q4"];

      if (!validQuartiles.includes(quartile)) {
        return res.status(400).json({
          success: false,
          message: "Quartile must be Q1, Q2, Q3, or Q4.",
        });
      }

      whereClause.quartile = quartile;
    }

    const search = searchTerm.trim();

    if (search) {
      const searchConditions = [
        { journalCode: { [Op.like]: `%${search}%` } },
        { journalName: { [Op.like]: `%${search}%` } },
        { link: { [Op.like]: `%${search}%` } },
      ];

      if (["Q1", "Q2", "Q3", "Q4"].includes(search.toUpperCase())) {
        searchConditions.push({
          quartile: search.toUpperCase(),
        });
      }

      whereClause[Op.or] = searchConditions;
    }

    const rows  =
      await ProjectDocumentJournal.findAll({
        where: whereClause,
        include: [
          {
            model: ProjectDocument,
            as: "document",
            attributes: [
              "id",
              "documentName",
              "fileName",
              "title",
              "abstract",
              "projectId",
            ],
            required: false,
          },
          {
            model: Project,
            as: "project",
            attributes: ["id", "projectName"],
            required: false,
          },

          {
            model: Journal,
            as: "masterJournal",
            attributes: ["id", "journalCode","journalName","link","quartile","category"],
            required: true,
          },
          {
            model:ProjectJournalArticle,
            as:"articleDetails",
            attributes: ["id"],
          }
        ],
        order: [["createdAt", "DESC"]],
      });

    const data = rows.map((journal) => ({
      id: journal.id,
      documentId: journal.documentId,
      documentName: journal.document?.documentName ?? null,
      documentTitle: journal.document?.title ?? null,
      documentAbstract: journal.document?.abstract ?? null,
      projectId: journal.projectId,
      projectName: journal.project?.projectName ?? null,
      journalId: journal?.masterJournal?.id,
      journalCode: journal?.masterJournal?.journalCode,
      journalName: journal?.masterJournal?.journalName,
      link:  journal?.masterJournal.link,
      quartile:  journal?.masterJournal.quartile,
      createdAt: journal.createdAt,
      updatedAt: journal.updatedAt,
      isArticleAdded : journal?.articleDetails?.id ? true : false,
    }));

    return res.status(200).json({
      success: true,
      message: "Journals retrieved successfully.",
      data,
    });
  } catch (error) {
    console.error("Get all document journals error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve journals.",
    });
  }
};

//new
exports.removeJournalFromDocumementJournal = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const assignmentId = Number(req.params.id);

    if (!Number.isInteger(assignmentId) || assignmentId <= 0) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "A valid journal assignment ID is required.",
      });
    }

    const assignment = await ProjectDocumentJournal.findByPk(
      assignmentId,
      {
        transaction,
        lock: transaction.LOCK.UPDATE,
      }
    );

    if (!assignment) {
      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message: "Journal assignment not found.",
      });
    }

    const article = await ProjectJournalArticle.findOne({
      where: {
        journalId: assignment.id,
      },
      attributes: ["id", "journalId"],
      transaction,
    });

    if (article) {
      await transaction.rollback();

      return res.status(409).json({
        success: false,
        message:
          "Cannot remove this journal assignment because article details have already been added.",
        articleId: article.id,
      });
    }

    await assignment.destroy({ transaction });

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Journal assignment removed successfully.",
    });
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }

    console.error("Remove journal assignment error:", error);

    if (error.name === "SequelizeForeignKeyConstraintError") {
      return res.status(409).json({
        success: false,
        message:
          "Cannot remove this assignment because related records exist.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to remove journal assignment.",
    });
  }
};

//new
exports.createProjectJournalArticle = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      journalId,
      authorName,
      username,
      password,
      description,
    } = req.body;

    const addedBy = req.user?.id;

    if (!journalId || !username?.trim() || !password) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "journalId, username and password are required.",
      });
    }

    if (!Number.isInteger(Number(journalId)) || Number(journalId) <= 0) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "A valid journalId is required.",
      });
    }

    const existingArticle = await ProjectJournalArticle.findOne({
      where: {
        journalId: Number(journalId),
      },
      transaction,
    });

    if (existingArticle) {
      await transaction.rollback();

      return res.status(409).json({
        success: false,
        message: "An article already exists for this journal.",
      });
    }

    if (!addedBy) {
      await transaction.rollback();

      return res.status(401).json({
        success: false,
        message: "Authenticated user is required.",
      });
    }

    if (
      authorName !== undefined &&
      authorName !== null &&
      !Array.isArray(authorName)
    ) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "authorName must be an array of author names.",
      });
    }

    const journal = await ProjectDocumentJournal.findByPk(
      Number(journalId),
      { transaction }
    );

    if (!journal) {
      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message: "Journal record not found.",
      });
    }

    const article = await ProjectJournalArticle.create(
      {
        journalId: Number(journalId),
        authorName: authorName ?? null,
        username: username.trim(),
        password,
        status:"PENDING",
        submissionDate: new Date(),
        description: description || null,
        addedBy,
      },
      { transaction }
    );

    await JournalArticleStatusHistory.create(
      {
        articleId: article.id,
        previousStatus: null,
        newStatus: "PENDING",
        changedBy: addedBy,
        remarks: "Initial article record created.",
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: "Project journal article created successfully.",
    });
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }

    console.error("Create Project Journal Article Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create project journal article.",
    });
  }
};

//new
exports.getProjectJournalArticleById = async (req, res) => {
  try {
    const articleId = Number(req.params.articleId);

    if (!Number.isInteger(articleId) || articleId <= 0) {
      return res.status(400).json({
        success: false,
        message: "A valid article ID is required.",
      });
    }

    // const article = await ProjectJournalArticle.findOne({
    //   where: {
    //     id: articleId,
    //   },
    //   include: [
    //     {
    //       model: ProjectDocumentJournal,
    //       as: "journal",
    //       attributes: [
    //         "id",
    //         "documentId",
    //         "projectId",
    //         "journalCode",
    //         "journalName",
    //         "link",
    //       ],
    //       include: [
    //         {
    //           model: ProjectDocument,
    //           as: "document",
    //           attributes: [
    //             "id",
    //             "documentName",
    //             "abstract",
    //             "title",
    //           ],
    //         },
    //       ],
    //     },
    //   ],
    
    // });

    const article = await ProjectJournalArticle.findOne({
      where: {
        id: articleId,
      },
      include: [
        {
          model: ProjectDocumentJournal,
          as: "journal",
          attributes: [
            "id",
            "documentId",
            "projectId",
            "journalId",
          ],
          include: [
            {
              model: ProjectDocument,
              as: "document",
              attributes: [
                "id",
                "documentName",
                "abstract",
                "title",
              ],
            },
            {
              model: Journal,
              as: "masterJournal",
              attributes: [
                "id",
                "journalCode",
                "journalName",
                "link",
                "quartile",
              ],
            },
          ],
        },
      ],
    
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Project journal article not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Project journal article fetched successfully.",
      data: article,
    });
  } catch (error) {
    console.error(
      "Get Project Journal Article By ID Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch project journal article details.",
    });
  }
};

exports.updateProjectJournalArticle = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const articleId = Number(req.params.id);

    const {
      journalId,
      authorName,
      username,
      password,
      description,
    } = req.body;

    if (!Number.isInteger(articleId) || articleId <= 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Valid article ID is required.",
      });
    }

    const article = await ProjectJournalArticle.findByPk(articleId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!article) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Project journal article not found.",
      });
    }

    const updateData = {};

    if (journalId !== undefined) {
      const parsedJournalId = Number(journalId);

      if (!Number.isInteger(parsedJournalId) || parsedJournalId <= 0) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Valid journalId is required.",
        });
      }

      updateData.journalId = parsedJournalId;
    }

    if (authorName !== undefined) {
      if (
        !Array.isArray(authorName) ||
        !authorName.every(
          (name) => typeof name === "string" && name.trim().length > 0
        )
      ) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "authorName must be an array of non-empty strings.",
        });
      }

      updateData.authorName = authorName.map((name) => name.trim());
    }

    if (username !== undefined) {
      if (typeof username !== "string" || !username.trim()) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Username cannot be empty.",
        });
      }

      updateData.username = username.trim();
    }

    if (password !== undefined) {
      if (typeof password !== "string" || !password.trim()) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Password cannot be empty.",
        });
      }

      updateData.password = password;
    }

    if (description !== undefined) {
      if (description !== null && typeof description !== "string") {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Description must be a string or null.",
        });
      }

      updateData.description = description;
    }

    if (Object.keys(updateData).length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Provide at least one valid field to update.",
      });
    }

    await article.update(updateData, { transaction });

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Project journal article updated successfully.",
    });
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }

    console.error("Update Project Journal Article Error:", error);

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        success: false,
        message: "An article already exists for this journal.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update project journal article.",
    });
  }
};

//new
exports.getProjectJournalArticles = async (req, res) => {
  try {

    const { page, limit, offset, searchTerm } = validateQueryParams({
      ...req.query,
    });

    console.log("serchterm",searchTerm);

    const {updatedAtDate,status,documentId, projectId,sortOrder} = req.query;

    const sortOrderFilter =
        sortOrder?.toUpperCase() === "ASC" ? "ASC" : "DESC";

    const whereClause = {};

    if (documentId !== undefined) {
      const parsedDocumentId = Number(documentId);

      if (!Number.isInteger(parsedDocumentId) || parsedDocumentId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Valid documentId is required.",
        });
      }

      whereClause["$journal.documentId$"] = parsedDocumentId;
    }

    if (projectId !== undefined) {
      if (typeof projectId !== "string" || !projectId.trim()) {
        return res.status(400).json({
          success: false,
          message: "Valid projectId is required.",
        });
      }

      whereClause["$journal.projectId$"] = projectId.trim();
    }

    if (updatedAtDate) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(updatedAtDate)) {
        return res.status(400).json({
          success: false,
          message: "updatedAtDate must be in YYYY-MM-DD format.",
        });
      }

      const startDate = new Date(`${updatedAtDate}T00:00:00.000Z`);

      if (
        Number.isNaN(startDate.getTime()) ||
        startDate.toISOString().slice(0, 10) !== updatedAtDate
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid updatedAtDate.",
        });
      }

      const endDate = new Date(startDate);
      endDate.setUTCDate(endDate.getUTCDate() + 1);

      whereClause.updatedAt = {
        [Op.gte]: startDate,
        [Op.lt]: endDate,
      };
    }

    if(status){
      if (!VALID_STATUSES.includes(status)) {

        return res.status(400).json({
          success: false,
          message: "Invalid article status.",
          validStatuses: VALID_STATUSES,
        });
      }

      whereClause.status = status;
    }

    if (searchTerm) {
      whereClause[Op.or] = [
        Sequelize.where(
          Sequelize.cast(Sequelize.col("ProjectJournalArticle.authorName"), "CHAR"),
          {
            [Op.like]: `%${searchTerm}%`,
          }
        ),

        {
          username: {
            [Op.like]: `%${searchTerm}%`,
          },
        },

        {
          status: {
            [Op.like]: `%${searchTerm}%`,
          },
        },

        {
          "$addedByDetails.name$": {
            [Op.like]: `%${searchTerm}%`,
          },
        },

        {
          "$addedByDetails.email$": {
            [Op.like]: `%${searchTerm}%`,
          },
        },

        {
          "$journal.journalName$": {
            [Op.like]: `%${searchTerm}%`,
          },
        },

        {
          "$journal.link$": {
            [Op.like]: `%${searchTerm}%`,
          },
        },

        {
          "$journal.document.abstract$": {
            [Op.like]: `%${searchTerm}%`,
          },
        },

        {
          "$journal.document.title$": {
            [Op.like]: `%${searchTerm}%`,
          },
        },
      ];
    }

    // const { count, rows } = await ProjectJournalArticle.findAndCountAll({
    //   where: whereClause,
    //   include: [
    //     {
    //       model: ProjectDocumentJournal,
    //       as: "journal",
    //       attributes:["id","documentId","projectId","journalCode","journalName","link"],
    //       include: [
    //         {
    //           model: ProjectDocument,
    //           as: "document",
    //           attributes:["id","documentName","abstract","title"],
    //         },
    //       ]
    //     },
    //     {
    //       model: User,
    //       as: "addedByDetails",
    //       attributes:["id","name","email","role"],
    //     },
    //   ],
    //   order: [
    //     ["updatedAt", sortOrderFilter],
    //     ["id", "DESC"],
    //   ],
    //   limit: limit,
    //   offset,
    // });

    const { count, rows } = await ProjectJournalArticle.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: ProjectDocumentJournal,
          as: "journal",
          attributes:["id","documentId","projectId","journalId"],
          include: [
            {
              model: ProjectDocument,
              as: "document",
              attributes:["id","documentName","abstract","title"],
            },
            {
              model: Journal,
              as: "masterJournal",
              attributes: [
                "id",
                "journalCode",
                "journalName",
                "link",
                "quartile",
              ],
              required: true,
            },
          ]
        },
        {
          model: User,
          as: "addedByDetails",
          attributes:["id","name","email","role"],
        },
      ],
      order: [
        ["updatedAt", sortOrderFilter],
        ["id", "DESC"],
      ],
      limit: limit,
      offset,
    });

    return res.status(200).json({
      success: true,
      message: "Project journal articles fetched successfully.",
      data: rows,
      pagination: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error("Get Project Journal Articles Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch project journal articles.",
    });
  }
};

exports.updateProjectJournalArticleStatus = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const articleId = Number(req.params.id);
    const { status, remarks } = req.body;
    const changedBy = req.user?.id;

    if (!Number.isInteger(articleId) || articleId <= 0) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "A valid article ID is required.",
      });
    }

    if (!changedBy) {
      await transaction.rollback();

      return res.status(401).json({
        success: false,
        message: "Authenticated user is required.",
      });
    }

    if (!status || !VALID_STATUSES.includes(status)) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Invalid article status.",
      });
    }

    const article = await ProjectJournalArticle.findByPk(articleId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!article) {
      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message: "Project journal article not found.",
      });
    }

    const previousStatus = article.status;

    if (previousStatus === status) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Article already has this status.",
        currentStatus: previousStatus,
      });
    }

    await article.update(
      {
        status,
      },
      { transaction }
    );

    await JournalArticleStatusHistory.create(
      {
        articleId: article.id,
        previousStatus,
        newStatus: status,
        changedBy,
        remarks: remarks?.trim() || null,
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Journal article status updated successfully.",
    });
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }

    console.error(
      "Update Project Journal Article Status Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update journal article status.",
    });
  }
};

//new
exports.getProjectJournalArticleDetailsById = async (req, res) => {
  try {
    const articleId = Number(req.params.articleId);

    if (!Number.isInteger(articleId) || articleId <= 0) {
      return res.status(400).json({
        success: false,
        message: "A valid article ID is required.",
      });
    }

    const article = await ProjectJournalArticle.findOne({
      where: {
        id: articleId,
      },
      include: [
        {
          model: ProjectDocumentJournal,
          as: "journal",
          attributes: [
            "id",
            "documentId",
            "projectId",
            "journalId",
          ],
          include: [
            {
              model: ProjectDocument,
              as: "document",
              attributes: [
                "id",
                "documentName",
                "abstract",
                "title",
              ],
            },
            {
              model: Journal,
              as: "masterJournal",
              attributes: [
                "id",
                "journalCode",
                "journalName",
                "link",
                "quartile",
              ],
            },
          ],
        },
        {
          model: User,
          as: "addedByDetails",
          attributes: ["id", "name", "email", "role"],
        },
        {
          model: JournalArticleStatusHistory,
          as: "statusHistory",
          attributes: [
            "id",
            "articleId",
            "previousStatus",
            "newStatus",
            "changedBy",
            "remarks",
            "createdAt",
          ],
          include: [
            {
              model: User,
              as: "changedByDetails",
              attributes: ["id", "name", "email", "role"],
            },
          ],
        },
      ],
    
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Project journal article not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Project journal article details fetched successfully.",
      data: article,
    });
  } catch (error) {
    console.error(
      "Get Project Journal Article By ID Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch project journal article details.",
    });
  }
};


