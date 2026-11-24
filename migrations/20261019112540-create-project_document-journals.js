
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("document_journals", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      documentId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "project_documents",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      projectId: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: "projects",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      journalCode: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },

      journalName: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },

      link: {
        type: Sequelize.STRING(2048),
        allowNull: false,
      },

      quartile: {
        type: Sequelize.ENUM("Q1", "Q2", "Q3", "Q4"),
        allowNull: false,
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      engine: "InnoDB",
      charset: "utf8mb4",
      collate: "utf8mb4_unicode_ci",
    }
    );

    await queryInterface.addIndex("document_journals", {
      name: "unique_document_project_journal_code",
      unique: true,
      fields: ["documentId", "projectId", "journalCode"],
    });

    await queryInterface.addIndex("document_journals", {
      name: "idx_document_journals_project_document",
      fields: ["projectId", "documentId"],
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("document_journals");

    // Required for some MySQL configurations when reverting ENUM columns.
    if (queryInterface.sequelize.getDialect() === "postgres") {
      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_document_journals_quartile";'
      );
    }
  },
};