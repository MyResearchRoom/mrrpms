const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class User extends Model {
        static associate(models) {
        }
    }

    User.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            mobileNumber: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            gender: {
                type: DataTypes.ENUM('male', 'female'),
                allowNull: true
            },
            dateOfBirth: {
                type: DataTypes.DATEONLY,
                allowNull: true
            },
            address: {
                type: DataTypes.STRING,
                allowNull: true
            },
            pinCode: {
                type: DataTypes.STRING,
                allowNull: true
            },
            gstNumber: {
                type: DataTypes.STRING,
                allowNull: true
            },
            role: {
                type: DataTypes.ENUM('ADMIN', 'PROJECT_COORDINATOR', 'CLIENT_VENDOR'),
                allowNull: false,
            },
            empId: {
                type: DataTypes.STRING,
                allowNull: true,
            },

            password: {
                type: DataTypes.STRING,
                allowNull: false
            },
            profile: {
                type: DataTypes.BLOB('long'),
                allowNull: true
            },
            imageType: {
                type: DataTypes.STRING,
                allowNull: true
            },
            isBlock: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
            otp: {
                type: DataTypes.STRING,
                allowNull: true
            },
            otpExpires: {
                type: DataTypes.DATE,
                allowNull: true
            }
        },
        {
            sequelize,
            modelName: "User",
            tableName: "users",
            timestamps: true
        }
    );
    return User;
}