'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('project_main_folders', 'createdBy', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: "CASCADE",
    });

  },

  async down (queryInterface, Sequelize) {
     await queryInterface.removeConstraint('project_main_folders', 'project_main_folders_createdBy_users_fk');
     
    await queryInterface.changeColumn('project_main_folders', 'createdBy', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  }
};
