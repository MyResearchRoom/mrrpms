"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("project_documents", "documentType", {
      type: Sequelize.ENUM("reference", "important", "final"),
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("project_documents", "documentType");
  },
};
