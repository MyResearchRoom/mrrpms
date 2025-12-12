"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("notifications", "documentId");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("notifications", "documentId", {
      type: Sequelize.INTEGER,
      references: {
        model: "documents",
        key: "id",
      },
    });
  },
};
