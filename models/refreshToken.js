const { DataTypes, Model } = require("sequelize");

module.exports = (sequelize) => {
    class RefreshToken extends Model { }

    RefreshToken.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            token: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: "users",
                    key: "id",
                },
                onDelete: "CASCADE",
            },
            clientId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                refrences: {
                    model: "clients",
                    key: "id",
                },
                onDelete: "CASCADE",
            },
            expiresAt: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            isRevoked: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
        },
        {
            sequelize,
            modelName: "RefreshToken",
            tableName: "refresh_tokens",
        }
    );

    return RefreshToken;
};
