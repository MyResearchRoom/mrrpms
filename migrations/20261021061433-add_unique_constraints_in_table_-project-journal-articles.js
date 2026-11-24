"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Prevent duplicate article records for the same journal.
    await queryInterface.addConstraint(
      "project_journal_articles",
      {
        fields: ["journalId"],
        type: "unique",
        name: "unique_project_journal_article",
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint(
      "project_journal_articles",
      "unique_project_journal_article"
    );
  },
};