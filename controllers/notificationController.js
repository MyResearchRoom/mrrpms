const { Op } = require("sequelize");
const { Notification,Project } = require("../models");
const { CLIENT } = require("../utils/constants");
const { validateQueryParams } = require("../utils/validateQueryParams");

exports.getNotifications = async (req, res) => {
  try {
    const { page, limit, offset } = validateQueryParams({ ...req.query });
    const whereClause = {};
    if (req.user.role === CLIENT) {
      whereClause.clientId = req.user.id;
    } else {
      whereClause.userId = req.user.id;
    }
    const { date, type } = req.query;
    if (date) {
      const startDate = new Date(date).setHours(0, 0, 0, 0);
      const endDate = new Date(date).setHours(23, 59, 59, 999);
      whereClause.createdAt = {
        [Op.between]: [startDate, endDate],
      };
    } else {
      whereClause.isRead = false;
    }

    if (["document", "message"].includes(type)) {
      whereClause.type = type;
    }

    const { rows, count } = await Notification.findAndCountAll({
      where: whereClause,
      include: {
        model: Project,
        as: "project",
        attributes: ["id", "projectName"],
      },

      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    res.status(200).json({
      success: true,
      data: {
        data: rows,
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

exports.markNotificationAsRead = async (req, res) => {
  try {
    const role = req.user.role;
    const id = req.user.id;
    const notification = await Notification.update(
      {
        isRead: true,
      },
      {
        where: {
          id: req.params.notificationId,
          clientId: role === CLIENT ? id : null,
          userId: role === CLIENT ? null : id,
        },
      }
    );

    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }

    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markAllNotificationsAsRead = async (req, res) => {
  try {
    const role = req.user.role;
    const id = req.user.id;
    const notifications = await Notification.update(
      {
        isRead: true,
      },
      {
        where: {
          isRead: false,
          clientId: role === CLIENT ? id : null,
          userId: role === CLIENT ? null : id,
        },
      }
    );
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const role = req.user.role;
    const id = req.user.id;
    const notification = await Notification.destroy({
      where: {
        id: req.params.notificationId,
        clientId: role === CLIENT ? id : null,
        userId: role === CLIENT ? null : id,
      },
    });
    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUnReadNotificationCnt = async (req, res) => {
  try {
    const role = req.user.role;
    const id = req.user.id;
    const whereClause = {
      clientId: role === CLIENT ? id : null,
      userId: role === CLIENT ? null : id,
      isRead: false,
    };

    const [docCnt, mesgCnt] = await Promise.all([
      Notification.count({
        where: {
          ...whereClause,
          type: "document",
        },
      }),
      Notification.count({
        where: {
          ...whereClause,
          type: "message",
        },
      }),
    ]);
    res.status(200).json({
      success: true,
      data: {
        documentCnt: docCnt,
        messageCnt: mesgCnt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};