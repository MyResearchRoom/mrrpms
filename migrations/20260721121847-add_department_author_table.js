'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("authors", "department", {
      type: Sequelize.STRING,
      allowNull: true,
      after:"designation",
    });

  },

  async down (queryInterface, Sequelize) {
     await queryInterface.removeColumn('authors', 'department');
  }
};
