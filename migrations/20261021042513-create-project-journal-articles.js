
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("project_journal_articles", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      journalId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "document_journals",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      authorName: {
        type: Sequelize.JSON,
        allowNull: true,
      },

      username: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },

      password: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },

      status: {
        type: Sequelize.ENUM(
          "PENDING",
          "SUBMITTED_TO_JOURNAL",
          "TECHNICAL_CHECK",
          "EDITOR_ASSIGNED",
          "UNDER_REVIEW",
          "REQUIRED_REVIEWS_COMPLETED",
          "DECISION_IN_PROCESS",
          "ACCEPTED / REVISION / REJECTED",
          "PRODUCTION_AND_PUBLICATION"
        ),
        allowNull: false,
        defaultValue: "PENDING",
      },

      submissionDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      addedBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP"
        ),
      },
    });

    await queryInterface.addIndex(
      "project_journal_articles",
      ["journalId"],
      {
        name: "idx_project_journal_articles_journal",
      }
    );

    await queryInterface.addIndex(
      "project_journal_articles",
      ["status"],
      {
        name: "idx_project_journal_articles_status",
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable("project_journal_articles");
  },
};
