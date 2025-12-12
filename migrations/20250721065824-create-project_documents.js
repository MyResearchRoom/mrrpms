"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("project_documents", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      projectId: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: "projects",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      documentName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      document: {
        type: Sequelize.BLOB("long"),
        allowNull: false,
      },
      fileName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      uploadDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      uploadBy: {
        type: Sequelize.ENUM("MRR", "CLIENT"),
        allowNull: false,
      },
      clientId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "clients",
          key: "id",
        },
        onDelete: "SET NULL",
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "SET NULL",
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("project_documents");
  },
};
