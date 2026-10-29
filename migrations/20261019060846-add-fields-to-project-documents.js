"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.addColumn("project_documents", "abstract", {
      type: Sequelize.TEXT("long"),
      allowNull: true,
      after:"documentName",
    });

    await queryInterface.addColumn("project_documents", "title", {
      type: Sequelize.TEXT("long"),
      allowNull: true,
      after:"abstract"
    });


    await queryInterface.changeColumn("project_documents", "documentType", {
      type: Sequelize.ENUM(
        "reference",
        "important",
        "final",
        "submissionReady"
      ),
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("project_documents", "documentType", {
      type: Sequelize.ENUM("reference", "important", "final"),
      allowNull: false,
    });

    await queryInterface.removeColumn("project_documents", "abstract");
    await queryInterface.removeColumn("project_documents", "title");
  },
};