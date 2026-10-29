const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    class Meeting extends Model {
        static associate(models) {
            Meeting.belongsTo(models.User, {
                foreignKey: "createdBy",
                as: "creator",
            });
            Meeting.hasMany(models.MeetingParticipant, {
                foreignKey: "meetingId",
                as: "participants",
            });
        }
    }

    Meeting.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            createdBy: {
                type: DataTypes.INTEGER,
                references: {
                    model: 'User',
                    key: 'id'
                },
            },
            title: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            date: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },
            time: {
                type: DataTypes.TIME,
                allowNull: false,
            },
            agenda: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            meetingLink: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'Meeting',
            tableName: 'meetings',
            timestamps: true,

        }
    );
    return Meeting;
}
