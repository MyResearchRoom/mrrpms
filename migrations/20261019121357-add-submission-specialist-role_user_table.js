
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("users", "role", {
      type: Sequelize.ENUM(
        "ADMIN",
        "PROJECT_COORDINATOR",
        "CLIENT_VENDOR",
        "SUBMISSION_SPECIALIST"
      ),
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {

    await queryInterface.changeColumn("users", "role", {
      type: Sequelize.ENUM(
        "ADMIN",
        "PROJECT_COORDINATOR",
        "CLIENT_VENDOR"
      ),
      allowNull: false,
    });
  },
};