
"use strict";

const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class JournalArticleStatusHistory extends Model {
    static associate(models) {
      JournalArticleStatusHistory.belongsTo(
        models.ProjectJournalArticle,
        {
          foreignKey: "articleId",
          as: "article",
        }
      );

      JournalArticleStatusHistory.belongsTo(models.User, {
        foreignKey: "changedBy",
        as: "changedByDetails",
      });
    }
  }

  JournalArticleStatusHistory.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      articleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      previousStatus: {
        type: DataTypes.ENUM(
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
        type: DataTypes.ENUM(
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
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      remarks: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "JournalArticleStatusHistory",
      tableName: "journal_article_status_histories",
      timestamps: true,
      indexes: [
        {
          name: "idx_article_status_history_article",
          fields: ["articleId"],
        },
        {
          name: "idx_article_status_history_user",
          fields: ["changedBy"],
        },
        {
          name: "idx_article_status_history_created_at",
          fields: ["createdAt"],
        },
      ],
    }
  );

  return JournalArticleStatusHistory;
};
