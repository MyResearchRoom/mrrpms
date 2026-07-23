'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn('clients', 'pincode', 'pinCode');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn('clients', 'pinCode', 'pincode');
  }
};
