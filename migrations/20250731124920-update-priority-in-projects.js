'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('projects', "priority", { 
      type: Sequelize.ENUM("low", "medium", "high", "on-hold", "active"),
        defaultValue: "low",
     });
  },

  async down (queryInterface, Sequelize) {
  }
};
