const { where } = require("sequelize");
const { Op } = require("sequelize");
const bcrypt = require("bcrypt");
const { User,RefreshToken, sequelize } = require("../models");
const { validateQueryParams } = require("../utils/validateQueryParams");

exports.getVendorsList = async (req, res) => {
  try {
    const { page, limit, offset, searchTerm } = validateQueryParams({
      ...req.query,
    });
    const { isBlock } = req.query;

    const whereClause = {
      role: "CLIENT_VENDOR",
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
      attributes: ["id", "name", "email", "mobileNumber", "isBlock"],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    res.status(200).json({
      success: true,
      message: "Vendors List fetched successfully!",
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
      message: "Failed to fetch Vendors List",
    });
  }
};

exports.getVendorDetails = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Vendor ID is required",
      });
    }

    const vendor = await User.findOne({ where: { id, role: "CLIENT_VENDOR" } });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    let profileImage = null;
    if (vendor.profile && vendor.imageType) {
      profileImage = `data:${vendor.imageType};base64,${vendor.profile.toString(
        "base64"
      )}`;
    }

    res.status(200).json({
      success: true,
      message: "Vendor Details fetched successfully!",
      data: {
        ...vendor.toJSON(),
        profile: profileImage,
        password: null,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch Vendor Details",
    });
  }
};

exports.editVendor = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      email,
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
        message: "Vendor ID is required",
      });
    }

    const vendor = await User.findByPk(id);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    let profileImage = vendor.profile;
    let profileType = vendor.imageType;

    if (req.file) {
      profileImage = req.file.buffer;
      profileType = req.file.mimetype;
    }

    await vendor.update({
      name,
      email,
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
      message: "Vendor details updated successfully",
      data: vendor,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update Vendor details" });
  }
};

exports.changePasswordVendor = async (req, res) => {
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

    const vendor = await User.findOne({ where: { id, role: "CLIENT_VENDOR" } });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    vendor.password = hashedPassword;
    await vendor.save();

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

exports.blockUnblockVendor = async (req, res) => {
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
        message: "`isBlock` must be a boolean (true/false)",
      });
    }

    const vendor = await User.findOne({ where: { id, role: "CLIENT_VENDOR" } });
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found.",
      });
    }

    await vendor.update({ isBlock }, { transaction });

    if (isBlock) {
      await RefreshToken.update(
        {
          isRevoked: true,
        },
        {
          where: {
            isRevoked: false,
            userId: vendor.id,
          },
          transaction,
        }
      );
    }

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: `Vendor ${isBlock ? "Blocked" : "Unblocked"} successfully.`,
      vendor,
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

exports.deleteVendor = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Vendor Id is required",
      });
    }

    const vendor = await User.findOne({ where: { id, role: "CLIENT_VENDOR" } });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    await User.destroy({ where: { id, role: "CLIENT_VENDOR" } });

    res.status(200).json({
      success: true,
      message: "Vendor deleted successfully!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to delete Vendor",
    });
  }
};
