const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Client extends Model {
        static associate(models) {
        }
    }

    Client.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            clientId: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            role: {
                type: DataTypes.ENUM('CLIENT'),
                allowNull: false,
                defaultValue: 'CLIENT'
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false
            },
            mobileNumber: {
                type: DataTypes.STRING,
                allowNull: false
            },
            address: {
                type: DataTypes.STRING,
                allowNull: false
            },
            pinCode: {
                type: DataTypes.STRING,
                allowNull: false
            },
            gstNumber: {
                type: DataTypes.STRING,
                allowNull: false
            },
            associatedCompany: {
                type: DataTypes.STRING,
                allowNull: false
            },
            profile: {
                type: DataTypes.BLOB('long'),
                allowNull: true
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false
            },
            companyName: {
                type: DataTypes.STRING,
                allowNull: true
            },
            pointOfContactPersonName: {
                type: DataTypes.STRING,
                allowNull: true
            },
            pointOfContactMobileNumber: {
                type: DataTypes.STRING,
                allowNull: true
            },
            pointOfContactDesignation: {
                type: DataTypes.STRING,
                allowNull: true
            },
            otp: {
                type: DataTypes.STRING,
                allowNull: true
            },
            otpExpires: {
                type: DataTypes.DATE,
                allowNull: true
            },
            isBlock: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            }
        },
        {
            sequelize,
            modelName: 'Client',
            tableName: 'clients',
            timestamps: true
        }

    );

    return Client;
};