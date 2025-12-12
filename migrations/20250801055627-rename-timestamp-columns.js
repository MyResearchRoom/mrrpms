'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Allow nulls temporarily
    await queryInterface.changeColumn('meetings', 'created_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.changeColumn('meetings', 'updated_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    // Rename columns
    await queryInterface.renameColumn('meetings', 'created_at', 'createdAt');
    await queryInterface.renameColumn('meetings', 'updated_at', 'updatedAt');

    // Restore NOT NULL if desired
    await queryInterface.changeColumn('meetings', 'createdAt', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    });

    await queryInterface.changeColumn('meetings', 'updatedAt', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
    });
  },

  async down(queryInterface, Sequelize) {
    // Same process in reverse
    await queryInterface.changeColumn('meetings', 'createdAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.changeColumn('meetings', 'updatedAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.renameColumn('meetings', 'createdAt', 'created_at');
    await queryInterface.renameColumn('meetings', 'updatedAt', 'updated_at');

    await queryInterface.changeColumn('meetings', 'created_at', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    });

    await queryInterface.changeColumn('meetings', 'updated_at', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
    });
  }
};
