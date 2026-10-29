"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("notifications", "type", {
      type: Sequelize.ENUM("document", "message"),
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("notifications", "type");
  },
};
