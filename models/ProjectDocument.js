const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class ProjectDocument extends Model {
    static associate(models) {
      ProjectDocument.belongsTo(models.Project, {
        foreignKey: "projectId",
        as: "project",
      });
      ProjectDocument.belongsTo(models.ProjectMainFolder, {
        foreignKey: "mainFolderId",
        as: "folder",
      });
       ProjectDocument.belongsTo(models.ProjectSubFolder, {
        foreignKey: "subFolderId",
        as: "subFolder",
      });
      ProjectDocument.belongsTo(models.Client, {
        foreignKey: "clientId",
        as: "client",
      });
      ProjectDocument.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });
      ProjectDocument.belongsTo(models.User, {
        foreignKey: "userId",
        as: "vendorClient",
      });

      ProjectDocument.hasMany(models.ProjectDocumentJournal , {
        foreignKey: "documentId",
        as: "documentArticles",
      })
    }
  }

  ProjectDocument.init(
    {
      projectId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      mainFolderId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      subFolderId: {
        type: DataTypes.INTEGER,
        allowNull: true, 
      },
      isPublished: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      documentName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      abstract:{
        type: DataTypes.TEXT("long"),
        allowNull: true,
      },
      title:{
        type: DataTypes.TEXT("long"),
        allowNull: true,
      },
      document: {
        type: DataTypes.BLOB("long"),
        allowNull: false,
      },
      fileName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      uploadDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      uploadBy: {
        type: DataTypes.ENUM("MRR", "CLIENT"),
        allowNull: false,
      },
      submissionReady: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      clientId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      documentType: {
        type: DataTypes.ENUM("reference", "important", "final","submissionReady"),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "ProjectDocument",
      tableName: "project_documents",
      timestamps: false,
    }
  );

  return ProjectDocument;
};
