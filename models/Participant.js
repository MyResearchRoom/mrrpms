const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Participant extends Model {
    static associate(models) {
      Participant.belongsTo(models.Project, {
        foreignKey: "projectId",
        as: "project",
      });
      Participant.belongsTo(models.User, {
        foreignKey: "employeeId",
        as: "employee",
      });
    }
  }
  Participant.init(
    {
      projectId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      employeeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Participant",
      tableName: "participants",
      timestamps: false,
    }
  );

  return Participant;
};
