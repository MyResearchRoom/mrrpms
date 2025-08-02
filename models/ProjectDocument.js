const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class ProjectDocument extends Model {
    static associate(models) {
      ProjectDocument.belongsTo(models.Project, {
        foreignKey: "projectId",
        as: "project",
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
    }
  }

  ProjectDocument.init(
    {
      projectId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      documentName: {
        type: DataTypes.STRING,
        allowNull: false,
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
      clientId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      documentType: {
        type: DataTypes.ENUM("reference", "important", "final"),
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
