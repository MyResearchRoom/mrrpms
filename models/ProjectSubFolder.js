const { Model, DataTypes } = require("sequelize");
module.exports = (sequelize) => {
  class ProjectSubFolder extends Model {
    static associate(models) {
      ProjectSubFolder.belongsTo(models.Project, {
        foreignKey: "projectId",
        as: "project",
      });

      ProjectSubFolder.belongsTo(models.ProjectMainFolder, {
        foreignKey: "mainFolderId",
        as: "mainFolder",
      });

      ProjectSubFolder.belongsTo(models.User, {
        foreignKey: "createdBy",
        as: "creator", // alias for the user who created the folder
      });

      ProjectSubFolder.hasMany(models.ProjectDocument, {
        foreignKey: "subFolderId",
        as: "documents",
      });
    }
  }

  ProjectSubFolder.init(
    {
      projectId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      mainFolderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "project_sub_folders",
      modelName: "ProjectSubFolder",
      timestamps: true,
    }
  );

  return ProjectSubFolder;
};
