"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("project_documents", "submissionReady", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      after: "uploadBy",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      "project_documents",
      "submissionReady"
    );
  },
};