const { Model, DataTypes } = require("sequelize");
module.exports = (sequelize) => {
  class ProjectMainFolder extends Model {
    static associate(models) {
      ProjectMainFolder.belongsTo(models.Project, {
        foreignKey: "projectId",
        as: "project",
      });

      ProjectMainFolder.belongsTo(models.User, {
        foreignKey: "createdBy",
        as: "creator", // alias for the user who created the folder
      });

      ProjectMainFolder.hasMany(models.ProjectSubFolder, {
        foreignKey: "mainFolderId",
        as: "subFolders",
      });
    }
  }

  ProjectMainFolder.init(
    {
      projectId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "project_main_folders",
      modelName: "ProjectMainFolder",
      timestamps: true,
    }
  );

  return ProjectMainFolder;
};
