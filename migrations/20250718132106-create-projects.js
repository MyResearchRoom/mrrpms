"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("projects", {
      id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
      },
      projectName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      clientType: {
        type: Sequelize.ENUM("CLIENT", "CLIENT_VENDOR"),
        allowNull: false,
      },
      clientId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "clients",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      clientVendorId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      priority: {
        type: Sequelize.ENUM("low", "medium", "high"),
        defaultValue: "low",
      },
      status: {
        type: Sequelize.ENUM("pending", "in-progress", "on-hold", "completed"),
        defaultValue: "pending",
      },
      projectTitle: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      clientName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      clientEmail: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      assignedDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      university: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      degreeLevel: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      researchArea: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      typeOfAssistanceNeeded: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      projectDetails: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      expectedOutcome: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      deadline: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      additionalNote: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("projects");
  },
};
