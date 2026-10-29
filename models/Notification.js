const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    static associate(models) {
      Notification.belongsTo(models.Project, {
        foreignKey: "projectId",
        as: "project",
      });
      Notification.belongsTo(models.Client, {
        foreignKey: "clientId",
        as: "client",
      });
      Notification.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });
      Notification.belongsTo(models.User, {
        foreignKey: "userId",
        as: "vendorClient",
      });
    }
  }

  Notification.init(
    {
      projectId: {
        type: DataTypes.STRING,
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
      message: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      type: {
        type: DataTypes.ENUM("document", "message"),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Notification",
      tableName: "notifications",
      timestamps: true,
    }
  );

  return Notification;
};
