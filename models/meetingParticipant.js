const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    class MeetingParticipants extends Model {
        static associate(models) {
            MeetingParticipants.belongsTo(models.Meeting, {
                foreignKey: 'meetingId',
                as: 'meeting'
            });

            MeetingParticipants.belongsTo(models.User, {
                foreignKey: 'participantId',
                as: 'members'
            });
        }
    }

    MeetingParticipants.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            meetingId: {
                type: DataTypes.INTEGER,
                references: {
                    model: "Meeting",
                    key: 'id',
                },
            },
            participantId: {
                type: DataTypes.INTEGER,
                references: {
                    model: "User",
                    key: 'id',
                },
            },
        },
        {
            sequelize,
            modelName: 'MeetingParticipant',
            tableName: 'meeting_participants',
            timestamps: false
        }
    );
    return MeetingParticipants;
}