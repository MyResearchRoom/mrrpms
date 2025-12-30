'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('notifications','createdAt', { 
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn('NOW'),
    });
    await queryInterface.changeColumn('notifications','updatedAt', { 
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn('NOW'),
    });

  },

  async down (queryInterface, Sequelize) {

    await queryInterface.changeColumn('notifications',"createdAt",{
        type: Sequelize.DATE,
        allowNull: false,
    });

    await queryInterface.changeColumn('notifications',"updatedAt",{
        type: Sequelize.DATE,
        allowNull: false,
    });

  }
};
