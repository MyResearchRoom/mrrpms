const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Attachment extends Model {
    static associate(models) {
      Attachment.belongsTo(models.Message, {
        foreignKey: "messageId",
        as: "message",
      });
    }
  }

  Attachment.init(
    {
      messageId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      fileName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      file: {
        type: DataTypes.BLOB("long"),
        allowNull: false,
      },
      fileType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Attachment",
      tableName: "attachments",
      timestamps: true,
    }
  );

  return Attachment;
};