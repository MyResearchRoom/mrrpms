"use strict";

const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Journal extends Model {
    static associate(models) {
      Journal.hasMany(models.ProjectDocumentJournal, {
        foreignKey: "journalId",
        as: "journalAssignments",
      });
    }
  }

  Journal.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      journalCode: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
      },

      journalName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },

      link: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isUrl: true,
        },
      },

      quartile: {
        type: DataTypes.ENUM("Q1", "Q2", "Q3", "Q4"),
        allowNull: false,
      },

      apcAmount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
      },

      abbreviation: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      publisher: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      printISSN: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      onlineISSN: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      country: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },

      language: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },

      since: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      submissionUrl: {
        type: DataTypes.STRING(2048),
        allowNull: true,
        validate: {
          isUrl: true,
        },
      },

      category: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      subjectArea: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      keywords: {
        type: DataTypes.JSON,
        allowNull: true,
      },

      articleTypes: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      frequency: {
        type: DataTypes.ENUM(
          "Weekly",
          "Monthly",
          "Bimonthly",
          "Quarterly",
          "Continuous",
          "Annual"
        ),
        allowNull: true,
      },

      impactFactor: {
        type: DataTypes.DECIMAL(10, 4),
        allowNull: true,
      },

      impactFactorYear: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      fiveYearImpactFactor: {
        type: DataTypes.DECIMAL(10, 4),
        allowNull: true,
      },

      citeScore: {
        type: DataTypes.DECIMAL(10, 4),
        allowNull: true,
      },

      sjr: {
        type: DataTypes.DECIMAL(10, 4),
        allowNull: true,
      },

      hIndex: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      acceptanceRate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        validate: {
          min: 0,
          max: 100,
        },
      },

      indexing: {
        type: DataTypes.JSON,
        allowNull: true,
      },

      accessType: {
        type: DataTypes.ENUM(
          "Subscription",
          "Fully Open Access",
          "Hybrid",
          "Diamond (free to author)"
        ),
        allowNull: true,
      },


      currency: {
        type: DataTypes.ENUM("USD", "EUR", "GBP", "INR"),
        allowNull: true,
      },

      otherFees: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      license: {
        type: DataTypes.ENUM(
          "CC BY",
          "CC BY-NC",
          "CC BY-NC-ND",
          "CC BY-SA",
          "Copyright retained by publisher"
        ),
        allowNull: true,
      },

      waiverAvailable: {
        type: DataTypes.ENUM("Yes", "No", "Partial"),
        allowNull: true,
      },

      isPredatory: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      isPeerReviewed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      firstDecisionDays: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      peerReviewDays: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      revisionRoundDays: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      submissionToAcceptanceDays: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      acceptanceToPublicationDays: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      totalPublicationDays: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      issuesPerYear: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      articlesPerYear: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      hasOnlineFirst: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      hasFastTrack: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

    
      reviewType: {
        type: DataTypes.ENUM(
          "Single blind",
          "Double blind",
          "Open peer review",
          "Editorial (invited)"
        ),
        allowNull: true,
      },

      manuscriptLengthLimit: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      editorInChief: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      contactEmail: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
          isEmail: true,
        },
      },

      preprintsAllowed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      invitedArticlesOnly: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Journal",
      tableName: "journalsMaster",
      timestamps: true,
      indexes: [
        {
          name: "unique_journals_name",
          unique: true,
          fields: ["journalName"],
        },
        {
          name: "unique_journals_code",
          unique: true,
          fields: ["journalCode"],
        },
      ],
    }
  );

  return Journal;
};
