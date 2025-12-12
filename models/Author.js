const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Author extends Model {
    static associate(models) {
      Author.belongsTo(models.Project, {
        foreignKey: "projectId",
        as: "project",
      });
    }


  }

  Author.init(
    {
      projectId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      orcidId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      scholarLink: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      collegeAffiliation: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      designation: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Author",
      tableName: "authors",
      timestamps: true,
    }
  );

  return Author;
};
