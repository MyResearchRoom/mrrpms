"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    class TodoList extends Model {
        static associate(models) {
            TodoList.belongsTo(models.User, {
                foreignKey: "userId",
                as: "user",
            });
        }
    }
    TodoList.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            task: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            date: {
                type: DataTypes.DATEONLY,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            sequelize,
            modelName: "TodoList",
            tableName: "todolists",
            timestamps: true,
        }
    );

    return TodoList;
};
