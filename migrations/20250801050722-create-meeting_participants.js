'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('meeting_participants',
      {
        meetingId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'meetings',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        participantId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
      });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('meeting_participants');
  }
};
