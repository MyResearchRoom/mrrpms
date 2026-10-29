
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "journal_article_status_histories",
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },

        articleId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "project_journal_articles",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },

        previousStatus: {
          type: Sequelize.ENUM(
            "PENDING",
            "SUBMITTED_TO_JOURNAL",
            "TECHNICAL_CHECK",
            "EDITOR_ASSIGNED",
            "UNDER_REVIEW",
            "REQUIRED_REVIEWS_COMPLETED",
            "DECISION_IN_PROCESS",
            "ACCEPTED",
            "REVISION",
            "REJECTED",
            "PRODUCTION_AND_PUBLICATION"
          ),
          allowNull: true,
        },

        newStatus: {
          type: Sequelize.ENUM(
            "PENDING",
            "SUBMITTED_TO_JOURNAL",
            "TECHNICAL_CHECK",
            "EDITOR_ASSIGNED",
            "UNDER_REVIEW",
            "REQUIRED_REVIEWS_COMPLETED",
            "DECISION_IN_PROCESS",
            "ACCEPTED",
            "REVISION",
            "REJECTED",
            "PRODUCTION_AND_PUBLICATION"
          ),
          allowNull: false,
        },

        changedBy: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "users",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "RESTRICT",
        },

        remarks: {
          type: Sequelize.TEXT,
          allowNull: true,
        },

        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal(
            "CURRENT_TIMESTAMP"
          ),
        },

        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal(
            "CURRENT_TIMESTAMP"
          ),
        },
      }
    );

    await queryInterface.addIndex(
      "journal_article_status_histories",
      ["articleId"],
      {
        name: "idx_article_status_history_article",
      }
    );

    await queryInterface.addIndex(
      "journal_article_status_histories",
      ["changedBy"],
      {
        name: "idx_article_status_history_user",
      }
    );

    await queryInterface.addIndex(
      "journal_article_status_histories",
      ["createdAt"],
      {
        name: "idx_article_status_history_created_at",
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable(
      "journal_article_status_histories"
    );
  },
};
