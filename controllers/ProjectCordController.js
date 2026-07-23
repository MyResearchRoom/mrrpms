const { where } = require("sequelize");
const { Op } = require("sequelize");
const bcrypt = require("bcrypt");
const { User,RefreshToken, sequelize } = require("../models");
const { validateQueryParams } = require("../utils/validateQueryParams");

exports.getProjectCoordinatorList = async (req, res) => {
  try {
    const { page, limit, offset, searchTerm } = validateQueryParams({
      ...req.query,
    });
    const { isBlock } = req.query;
    const whereClause = {
      role: "PROJECT_COORDINATOR",
      ...(searchTerm && {
        [Op.or]: [
          { name: { [Op.like]: `%${searchTerm}%` } },
          { email: { [Op.like]: `%${searchTerm}%` } },
        ],
      }),
    };

    if (isBlock === "true" || isBlock === "false") {
      whereClause.isBlock = isBlock === "true" ? true : false;
    }

    const { rows, count } = await User.findAndCountAll({
      where: whereClause,
      attributes: ["id", "name", "empId", "email", "mobileNumber", "isBlock"],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    res.status(200).json({
      success: true,
      message: "Project Coordinators List fetched successfully!",
      data: rows,
      pagination: {
        totalRecords: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch Project Coordinators List",
    });
  }
};

exports.getProjectCoordinatorDetails = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Project Coordinator ID is required",
      });
    }

    const coordinator = await User.findOne({
      where: { id, role: "PROJECT_COORDINATOR" },
    });

    if (!coordinator) {
      return res.status(404).json({
        success: false,
        message: "Project Coordinator not found",
      });
    }

    let profileImage = null;
    if (coordinator.profile && coordinator.imageType) {
      profileImage = `data:${
        coordinator.imageType
      };base64,${coordinator.profile.toString("base64")}`;
    }

    res.status(200).json({
      success: true,
      message: "Project Coordinator Details fetched successfully!",
      data: {
        ...coordinator.toJSON(),
        profile: profileImage,
        password: null,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch Project Coordinator Details",
    });
  }
};

exports.editProjectCoordinator = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      email,
      empId,
      mobileNumber,
      gender,
      dateOfBirth,
      address,
      pinCode,
      gstNumber,
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Project Coordinator ID is required",
      });
    }

    const coordinator = await User.findByPk(id);
    if (!coordinator) {
      return res.status(404).json({
        success: false,
        message: "Coordinator not found",
      });
    }

    let profileImage = coordinator.profile;
    let profileType = coordinator.imageType;

    if (req.file) {
      profileImage = req.file.buffer;
      profileType = req.file.mimetype;
    }

    await coordinator.update({
      name,
      email,
      empId,
      mobileNumber,
      gender,
      dateOfBirth,
      address,
      pinCode,
      gstNumber,
      profile: profileImage,
      imageType: profileType,
    });

    res.status(200).json({
      success: true,
      message: "Project Coordinator details updated successfully",
      data: coordinator,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to update Project Coordinator details",
    });
  }
};

exports.changePasswordProjectCoordinator = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword, confirmPassword } = req.body;

    if (!id || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "ID, new password, and confirm password are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password do not match",
      });
    }

    const coordinator = await User.findOne({
      where: { id, role: "PROJECT_COORDINATOR" },
    });

    if (!coordinator) {
      return res.status(404).json({
        success: false,
        message: "Project Coordinator not found",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    coordinator.password = hashedPassword;
    await coordinator.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to change password",
    });
  }
};

exports.blockUnblockCoordinator = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { isBlock } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID is required.",
      });
    }

    if (typeof isBlock !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "`iBlock` must be a boolean (true/false)",
      });
    }

    const coordinator = await User.findOne({
      where: { id, role: "PROJECT_COORDINATOR" },
    });
    if (!coordinator) {
      return res.status(404).json({
        success: false,
        message: "Coordinator not found.",
      });
    }

    await coordinator.update({ isBlock }, { transaction });

    if (isBlock) {
      await RefreshToken.update(
        {
          isRevoked: true,
        },
        {
          where: {
            isRevoked: false,
            userId: coordinator.id,
          },
          transaction,
        }
      );
    }

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: `Coordinator ${isBlock ? "Blocked" : "Unblocked"} successfully.`,
      coordinator,
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to change status",
    });
  }
};

exports.deleteProjectCoordinator = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Project Coordinator Id is required",
      });
    }

    const coordinator = await User.findOne({
      where: { id, role: "PROJECT_COORDINATOR" },
    });

    if (!coordinator) {
      return res.status(404).json({
        success: false,
        message: "Project Coordinator not found",
      });
    }

    await User.destroy({ where: { id, role: "PROJECT_COORDINATOR" } });

    res.status(200).json({
      success: true,
      message: "Project Coordinator deleted successfully!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to delete Project Coordinator",
    });
  }
};
