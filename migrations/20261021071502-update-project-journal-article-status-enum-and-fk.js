
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableName = "project_journal_articles";
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.changeColumn(
        tableName,
        "status",
        {
          type: Sequelize.ENUM(
            "PENDING",
            "SUBMITTED_TO_JOURNAL",
            "TECHNICAL_CHECK",
            "EDITOR_ASSIGNED",
            "UNDER_REVIEW",
            "REQUIRED_REVIEWS_COMPLETED",
            "DECISION_IN_PROCESS",
            "ACCEPTED",
            "REVISION",
            "REJECTED",
            "PRODUCTION_AND_PUBLICATION"
          ),
          allowNull: false,
          defaultValue: "PENDING",
        },
        { transaction }
      );

  
      await queryInterface.removeConstraint(
        tableName,
        "project_journal_articles_ibfk_1",
        { transaction }
      );

      await queryInterface.addConstraint(tableName, {
        fields: ["journalId"],
        type: "foreign key",
        name: "fk_project_journal_articles_journal",
        references: {
          table: "document_journals",
          field: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
        transaction,
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const tableName = "project_journal_articles";
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.removeConstraint(
        tableName,
        "fk_project_journal_articles_journal",
        { transaction }
      );

      await queryInterface.addConstraint(tableName, {
        fields: ["journalId"],
        type: "foreign key",
        name: "project_journal_articles_ibfk_1",
        references: {
          table: "document_journals",
          field: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        transaction,
      });

      await queryInterface.changeColumn(
        tableName,
        "status",
        {
          type: Sequelize.ENUM(
            "PENDING",
            "SUBMITTED_TO_JOURNAL",
            "TECHNICAL_CHECK",
            "EDITOR_ASSIGNED",
            "UNDER_REVIEW",
            "REQUIRED_REVIEWS_COMPLETED",
            "DECISION_IN_PROCESS",
            "ACCEPTED / REVISION / REJECTED",
            "PRODUCTION_AND_PUBLICATION"
          ),
          allowNull: false,
          defaultValue: "PENDING",
        },
        { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
