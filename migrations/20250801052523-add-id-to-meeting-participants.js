'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('meeting_participants', 'id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      first: true,

    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('meeting_participants', 'id');
  },
};
