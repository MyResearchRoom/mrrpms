const {
  Message,
  User,
  Client,
  Project,
  Participant,
  sequelize,
  Attachment,
} = require("../models");
const { createNotifications } = require("../services/notificationService");
const { CLIENT, CLIENT_VENDOR } = require("../utils/constants");
const { convertToIST } = require("../utils/dateConverter");
const { validateQueryParams } = require("../utils/validateQueryParams");
const { sendMessage, getActiveUsers } = require("../websocket");

exports.sendMessage = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id, name, role } = req.user;
    const { message, projectId } = req.body;
    let attachments = req.files["files[]"];

    const saved = await Message.create(
      {
        message,
        projectId,
        clientId: role === CLIENT ? id : null,
        userId: role === CLIENT ? null : id,
      },
      {
        transaction,
      }
    );

    const attachmentsData = (attachments || []).map((item) => ({
      messageId: saved.id,
      fileName: item.originalname,
      file: `data:${item.mimetype};base64,${item.buffer.toString("base64")}`,
      fileType: item.mimetype,
    }));

    attachments = await Attachment.bulkCreate(attachmentsData, {
      transaction,
    });

    const payload = {
      type: "message",
      message: `${name} sends a new message in ${req.project.projectName}(${
        req.project.id
      }): ${
        saved.message.length > 10
          ? saved.message.substring(0, 10) + "..."
          : saved.message
      }`,

      data: {
        id: saved.id,
        message: saved.message,
        attachments:
          attachments && attachments.length > 0
            ? attachments.map((item) => ({
                id: item.id,
                fileName: item.fileName,
                fileType: item.fileType,
              }))
            : [],
        sendBy: {
          id,
          name,
          role,
        },
        sendAt: convertToIST(saved.createdAt, "YYYY-MM-DD HH:mm:ss"),
      },
    };

    const activeUsers = getActiveUsers(req.project.id);

    await createNotifications(
      req.project,
      {
        projectId: req.project.id,
        message: `${name} sends a new message in ${req.project.projectName}(${
          req.project.id
        }): ${
          saved.message.length > 10
            ? saved.message.substring(0, 10) + "..."
            : saved.message
        }`,
        type: "message",
      },
      id,
      role,
      transaction,
      activeUsers
    );

    await Project.update(
      {
        updatedAt: new Date(),
      },
      {
        where: {
          id: projectId,
        },
        transaction,
      }
    );

    sendMessage(payload, projectId, id, role);

    await transaction.commit();

    res.status(200).json({
      success: true,
      data: payload,
      message: "Message send successfully",
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMessages = async (req, res) => {
  const { projectId } = req.params;

  try {
    // const project = req.project;
    // if (project.isBlock && (role === CLIENT || role === CLIENT_VENDOR)) {
    //   return res.status(403).json({
    //     success: false,
    //     message:
    //       "Access is restricted. Please contact your administrator for assistance.",
    //   });
    // }
    const { page, limit, offset } = validateQueryParams({ ...req.query });
    const { count, rows } = await Message.findAndCountAll({
      attributes: [
        "id",
        "userId",
        "clientId",
        "projectId",
        "message",
        "createdAt",
      ],
      where: { projectId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "role"],
        },
        {
          model: Client,
          as: "client",
          attributes: ["id", "name", "role"],
        },
        {
          model: Attachment,
          as: "attachments",
          attributes: ["id", "fileName", "fileType"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    const data = rows.map((msg) => ({
      id: msg.id,
      sendBy: msg.userId ? msg.user : msg.client,
      message: msg.message,
      attachments: msg.attachments || [],
      sendAt: convertToIST(msg.createdAt, "YYYY-MM-DD HH:mm:ss"),
    }));

    res.status(200).json({
      success: true,
      data: {
        data: data.reverse(),
        pagination: {
          totalItems: count,
          totalPages: Math.ceil(count / limit),
          currentPage: page,
          itemsPerPage: limit,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

exports.getAttachment = async (req, res) => {
  try {
    const attachmentId = req.params.attachmentId;
    const attachment = await Attachment.findOne({
      where: {
        id: attachmentId,
      },
    });

    if (!attachment) {
      return res
        .status(400)
        .json({ success: false, message: "Attachment not found." });
    }

    res
      .status(200)
      .json({ success: true, data: attachment.file.toString("utf8") });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
