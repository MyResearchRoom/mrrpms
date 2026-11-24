// "use strict";

// const { Model, DataTypes } = require("sequelize");

// module.exports = (sequelize) => {
//   class ProjectDocumentJournal extends Model {
//     static associate(models) {
//       ProjectDocumentJournal.belongsTo(models.ProjectDocument, {
//         foreignKey: "documentId",
//         as: "document",
//       });

//       ProjectDocumentJournal.belongsTo(models.Project, {
//         foreignKey: "projectId",
//         as: "project",
//       });

//       ProjectDocumentJournal.hasOne(models.ProjectJournalArticle, {
//         foreignKey: "journalId",
//         as: "articleDetails",
//       });
//     }
//   }

//   ProjectDocumentJournal.init(
//     {
//       documentId: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//       },

//        projectId: {
//         type: DataTypes.STRING,
//         allowNull: false,
//       },

//       journalCode: {
//         type: DataTypes.STRING(20),
//         allowNull: false,
//       },

//       journalName: {
//         type: DataTypes.STRING(255),
//         allowNull: false,
//       },

//       link: {
//         type: DataTypes.STRING(2048),
//         allowNull: false,
//       },

//       quartile: {
//         type: DataTypes.ENUM("Q1", "Q2", "Q3", "Q4"),
//         allowNull: false,
//       },
//     },
//     {
//       sequelize,
//       modelName: "ProjectDocumentJournal",
//       tableName: "document_journals",
//       timestamps: true,
//       indexes: [
//         {
//           name: "unique_document_project_journal_code",
//           unique: true,
//           fields: ["documentId", "projectId", "journalCode"],
//         },
//         {
//           name: "idx_document_journals_project_document",
//           fields: ["projectId", "documentId"],
//         },
//       ],
//     }
//   );

//   return ProjectDocumentJournal;
// };


"use strict";

const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class ProjectDocumentJournal extends Model {
    static associate(models) {
      ProjectDocumentJournal.belongsTo(models.ProjectDocument, {
        foreignKey: "documentId",
        as: "document",
      });

      ProjectDocumentJournal.belongsTo(models.Project, {
        foreignKey: "projectId",
        as: "project",
      });

      ProjectDocumentJournal.belongsTo(models.Journal, {
        foreignKey: "journalId",
        as: "masterJournal",
      });

      ProjectDocumentJournal.hasOne(models.ProjectJournalArticle, {
        foreignKey: "journalId",
        as: "articleDetails",
      });
    }
  }

  ProjectDocumentJournal.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      documentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      projectId: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      journalId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "ProjectDocumentJournal",
      tableName: "document_journals",
      timestamps: true,
      indexes: [
        {
          name: "unique_document_project_journal",
          unique: true,
          fields: ["documentId", "projectId", "journalId"],
        },
        {
          name: "idx_document_journals_project_document",
          fields: ["projectId", "documentId"],
        },
      ],
    }
  );

  return ProjectDocumentJournal;
};
