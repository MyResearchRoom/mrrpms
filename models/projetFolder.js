const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class ProjectFolder extends Model {
    static associate(models) {
      ProjectFolder.belongsTo(models.Project, {
        foreignKey: "projectId",
        as: "project",
      });
      ProjectFolder.belongsTo(models.User, {
        foreignKey: "createdBy",
        as: "user",
      });
    }
  }

  ProjectFolder.init(
    {
      projectId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      createdDate: { 
        type: DataTypes.DATE, 
        allowNull: false, 
        defaultValue: DataTypes.NOW 
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "ProjectFolder",
      tableName: "project_folders",
      timestamps: true,
    }
  );

  return ProjectFolder;
};
