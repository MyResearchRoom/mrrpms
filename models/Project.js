const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Project extends Model {
    static associate(models) {
      Project.belongsTo(models.Client, {
        foreignKey: "clientId",
        as: "client",
      });
      Project.belongsTo(models.User, {
        foreignKey: "clientVendorId",
        as: "clientVendor",
      });
      Project.hasMany(models.Participant, {
        foreignKey: "projectId",
        as: "employees",
      });
      Project.hasOne(models.Participant, {
        foreignKey: "projectId",
        as: "employee",
      });
      Project.hasMany(models.Author, {
        foreignKey: "projectId",
        as: "authors",
      });


    }
  }

  Project.init(
    {
      projectName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      clientType: {
        type: DataTypes.ENUM("CLIENT", "CLIENT_VENDOR"),
        allowNull: false,
      },
      clientId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      clientVendorId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      priority: {
        type: DataTypes.ENUM("low", "medium", "high", "on-hold", "active"),
        defaultValue: "low",
      },
      status: {
        type: DataTypes.ENUM("pending", "in-progress", "on-hold", "completed"),
        defaultValue: "pending",
      },
      projectTitle: DataTypes.TEXT,
      clientName: DataTypes.STRING,
      clientEmail: DataTypes.STRING,
      assignedDate: DataTypes.DATE,
      university: DataTypes.STRING,
      degreeLevel: DataTypes.STRING,
      researchArea: DataTypes.STRING,
      typeOfAssistanceNeeded: DataTypes.JSON,
      projectDetails: DataTypes.TEXT,
      expectedOutcome: DataTypes.TEXT,
      deadline: DataTypes.DATE,
      additionalNote: DataTypes.TEXT,

      isBlock: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "Project",
      tableName: "projects",
      timestamps: true,
    }
  );

  Project.beforeCreate(async (project, options) => {
    const current = new Date();
    const month = current.getMonth();
    const paddedMonth = (month + 1).toString().padStart(2, "0");
    const year = current.getFullYear();

    const lastProject = await Project.findOne({
      order: [["createdAt", "DESC"]],
    });
    if (!lastProject) {
      project.id = `PR-${paddedMonth}${year}001`;
    } else {
      const lastId = lastProject.id.slice(9);
      const number = parseInt(lastId, 10) + 1;
      const paddedId = number.toString().padStart(lastId.length, "0");
      project.id = `PR-${paddedMonth}${year}${paddedId}`;
    }
  });

  return Project;
};
