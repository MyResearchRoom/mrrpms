const { Notification } = require("../models");
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
    const { rows, count } = await Notification.findAndCountAll({
      where: whereClause,
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
