
"use strict";

const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class ProjectJournalArticle extends Model {
    static associate(models) {
      ProjectJournalArticle.belongsTo(models.ProjectDocumentJournal, {
        foreignKey: "journalId",
        as: "journal",
      });

      ProjectJournalArticle.belongsTo(models.User, {
        foreignKey: "addedBy",
        as: "addedByDetails",
      });

      
      ProjectJournalArticle.hasMany(
        models.JournalArticleStatusHistory,
        {
          foreignKey: "articleId",
          as: "statusHistory",
        }
      );

    }
  }

  ProjectJournalArticle.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      journalId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      authorName: {
        type: DataTypes.JSON,
        allowNull: true,
      },

      username: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      status: {
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
        defaultValue: "PENDING",
      },

      submissionDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      addedBy :{
        type: DataTypes.INTEGER,
        allowNull:false,
      }
    },
    {
      sequelize,
      modelName: "ProjectJournalArticle",
      tableName: "project_journal_articles",
      timestamps: true,
      indexes: [
        {
          name: "unique_project_journal_article",
          unique: true,
          fields: ["journalId"],
        },
        {
          name: "idx_project_journal_articles_status",
          fields: ["status"],
        },
      ],
    }
  );

  return ProjectJournalArticle;
};