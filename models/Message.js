const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    static associate(models) {
      Message.belongsTo(models.Client, {
        foreignKey: "clientId",
        as: "client",
      });
      Message.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });
      Message.belongsTo(models.Project, {
        foreignKey: "projectId",
        as: "project",
      });
      Message.hasMany(models.Attachment,{
        foreignKey: "messageId",
        as: "attachments",
      })
    }
  }

  Message.init(
    {
      message: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      clientId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      projectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      attachment: {
        type: DataTypes.BLOB("long"),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Message",
      tableName: "messages",
      timestamps: true,
    }
  );

  return Message;
};
