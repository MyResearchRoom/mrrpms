'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("todolists", "isCompleted", {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      after:"date",
    });

  },

  async down (queryInterface, Sequelize) {
     await queryInterface.removeColumn('todolists', 'isCompleted');
  }
};
