
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = "document_journals";

    await queryInterface.addColumn(table, "journalId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      after: "projectId",
      references: {
        model: "journalsMaster",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });

    await queryInterface.addIndex(
      table,
      ["documentId", "projectId", "journalId"],
      {
        name: "unique_document_project_journal",
        unique: true,
      }
    );

    await queryInterface.removeIndex(
      table,
      "unique_document_project_journal_code"
    );


    await queryInterface.removeColumn(table, "journalCode");
    await queryInterface.removeColumn(table, "journalName");
    await queryInterface.removeColumn(table, "link");
    await queryInterface.removeColumn(table, "quartile");
  },

  async down(queryInterface, Sequelize) {
    const table = "document_journals";

    await queryInterface.addColumn(table, "journalCode", {
      type: Sequelize.STRING(20),
      allowNull: true,
    });

    await queryInterface.addColumn(table, "journalName", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });

    await queryInterface.addColumn(table, "link", {
      type: Sequelize.STRING(2048),
      allowNull: true,
    });

    await queryInterface.addColumn(table, "quartile", {
      type: Sequelize.ENUM("Q1", "Q2", "Q3", "Q4"),
      allowNull: true,
    });

    await queryInterface.addIndex(
      table,
      ["documentId", "projectId", "journalCode"],
      {
        name: "unique_document_project_journal_code",
        unique: true,
      }
    );

    await queryInterface.removeIndex(
      table,
      "unique_document_project_journal"
    );

    await queryInterface.removeColumn(table, "journalId");
  },
};
