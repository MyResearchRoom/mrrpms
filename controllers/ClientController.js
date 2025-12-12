const { Op } = require("sequelize");
const bcrypt = require("bcrypt");
const { Client, User, RefreshToken, sequelize } = require("../models");
const { validateQueryParams } = require("../utils/validateQueryParams");

exports.addClient = async (req, res) => {
  try {
    const {
      name,
      email,
      mobileNumber,
      address,
      pinCode,
      gstNumber,
      associatedCompany,
      password,
      companyName,
      pointOfContactPersonName,
      pointOfContactMobileNumber,
      pointOfContactDesignation,
    } = req.body;

    if (
      !name ||
      !email ||
      !mobileNumber ||
      !password ||
      !address ||
      !pinCode ||
      // !gstNumber ||
      !associatedCompany
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields.",
      });
    }

    const existingClient = await Client.findOne({ where: { email } });
    if (existingClient) {
      return res.status(400).json({
        success: false,
        message: "Client already exists with this email.",
      });
    }

    let profileImage = null;
    let profileType = null;

    if (req.file) {
      profileImage = req.file.buffer;
      profileType = req.file.mimetype;
    }

    const lastClient = await Client.findOne({
      order: [["id", "DESC"]],
    });

    const nextId = lastClient ? lastClient.id + 1 : 1;
    const formattedClientId = `MRR-${String(nextId).padStart(4, "0")}`;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newClient = await Client.create({
      clientId: formattedClientId,
      role: "CLIENT",
      name,
      email,
      mobileNumber,
      address,
      pinCode,
      gstNumber,
      associatedCompany,
      profile: profileImage,
      imageType: profileType,
      password: hashedPassword,
      companyName,
      pointOfContactPersonName,
      pointOfContactMobileNumber,
      pointOfContactDesignation,
    });

    res.status(201).json({
      success: true,
      message: "Client created successfully.",
      client: {
        id: newClient.id,
        clientId: newClient.clientId,
        name: newClient.name,
        email: newClient.email,
        mobileNumber: newClient.mobileNumber,
        role: newClient.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to create client",
    });
  }
};

exports.getClientList = async (req, res) => {
  try {
    const { page, limit, offset, searchTerm } = validateQueryParams({
      ...req.query,
    });
    const { isBlock } = req.query;

    const whereClause = searchTerm
      ? {
          [Op.or]: [
            { name: { [Op.like]: `%${searchTerm}%` } },
            { email: { [Op.like]: `%${searchTerm}%` } },
            { mobileNumber: { [Op.like]: `%${searchTerm}%` } },
          ],
        }
      : {};

    if (isBlock === "true" || isBlock === "false") {
      whereClause.isBlock = isBlock === "true" ? true : false;
    }

    const { rows, count } = await Client.findAndCountAll({
      attributes: [
        "id",
        "clientId",
        "name",
        "email",
        "mobileNumber",
        "role",
        "isBlock",
      ],
      where: whereClause,
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    res.status(200).json({
      success: true,
      message: "Client list fetched successfully.",
      clients: rows,
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
      message: "Failed to get client list",
    });
  }
};

exports.getClientDetails = async (req, res) => {
  try {
    const { clientId } = req.params;

    if (!clientId) {
      return res.status(400).json({
        success: false,
        message: "Client ID is required",
      });
    }

    const client = await Client.findOne({ where: { clientId } });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found.",
      });
    }

    let profileImage = null;
    if (client.profile) {
      const defaultMimeType = "image/png";
      profileImage = `data:${defaultMimeType};base64,${client.profile.toString(
        "base64"
      )}`;
    }

    res.status(200).json({
      success: true,
      message: "Client details fetched successfully.",
      data: {
        ...client.toJSON(),
        profile: profileImage,
        password: null,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get client details",
    });
  }
};

exports.editClientDetails = async (req, res) => {
  try {
    const { clientId } = req.params;
    const {
      name,
      email,
      mobileNumber,
      address,
      pinCode,
      gstNumber,
      associatedCompany,
      companyName,
      pointOfContactPersonName,
      pointOfContactMobileNumber,
      pointOfContactDesignation,
    } = req.body;

    const client = await Client.findOne({
      where: { clientId },
    });
    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found.",
      });
    }

    let profileImage = client.profile;

    if (req.file) {
      profileImage = req.file.buffer;
    }

    await client.update({
      name: name || client.name,
      email: email || client.email,
      mobileNumber: mobileNumber || client.mobileNumber,
      address: address || client.address,
      pinCode: pinCode || client.pinCode,
      gstNumber: gstNumber || client.gstNumber,
      associatedCompany: associatedCompany || client.associatedCompany,
      profile: profileImage,
      companyName: companyName || client.companyName,
      pointOfContactPersonName:
        pointOfContactPersonName || client.pointOfContactPersonName,
      pointOfContactMobileNumber:
        pointOfContactMobileNumber || client.pointOfContactMobileNumber,
      pointOfContactDesignation:
        pointOfContactDesignation || client.pointOfContactDesignation,
    });

    res.status(200).json({
      success: true,
      message: "Client updated successfully.",
      client: {
        id: client.id,
        clientId: client.clientId,
        name: client.name,
        email: client.email,
        mobileNumber: client.mobileNumber,
        role: client.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update Client",
    });
  }
};

exports.getClientsByRole = async (req, res) => {
  const { clientType } = req.query;
  try {
    if (!clientType) {
      return res.status(400).json({
        success: false,
        message: "Client type is required",
      });
    }

    let clients;
    if (clientType === "CLIENT") {
      clients = await Client.findAll({
        attributes: ["id", "name", "email"],
        where: { role: "CLIENT" },
      });
    } else if (clientType === "CLIENT_VENDOR") {
      clients = await User.findAll({
        attributes: ["id", "name", "email"],
        where: { role: "CLIENT_VENDOR" },
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid Client Type",
      });
    }
    res.status(200).json({
      success: true,
      data: clients,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch clients",
    });
  }
};

exports.changePasswordClient = async (req, res) => {
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
        message: "New Password and confirm password do not match",
      });
    }

    const client = await Client.findByPk(id);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await client.update({ password: hashedPassword });

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to change password",
    });
  }
};

exports.blockUnblockClient = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { clientId } = req.params;
    const { isBlock } = req.body;

    if (!clientId) {
      return res.status(400).json({
        success: false,
        message: "Client ID is required.",
      });
    }

    if (typeof isBlock !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "`iBlock` must be a boolean (true/false)",
      });
    }

    const client = await Client.findOne({ where: { clientId } });
    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found.",
      });
    }

    await client.update({ isBlock }, { transaction });

    if (isBlock) {
      await RefreshToken.update(
        {
          isRevoked: true,
        },
        {
          where: {
            isRevoked: false,
            clientId: client.id,
          },
          transaction,
        }
      );
    }

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: `Client ${isBlock ? "Blocked" : "Unblocked"} successfully.`,
      client,
    });
  } catch (error) {
    console.log(error);

    if (transaction) await transaction.rollback();
    res.status(500).json({
      success: false,
      message: "Failed to change status",
    });
  }
};

exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Client ID is required.",
      });
    }

    const client = await Client.findOne({ where: { id } });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found.",
      });
    }

    await client.destroy();
    res.status(200).json({
      success: true,
      message: "Client deleted successfully.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to delete Client",
    });
  }
};
