// 'use strict';

// /** @type {import('sequelize-cli').Migration} */
// module.exports = {
//   async up(queryInterface, Sequelize) {
//     await queryInterface.createTable('project_main_folders', {
//       id: {
//         type: Sequelize.INTEGER,
//         autoIncrement: true,
//         primaryKey: true,
//         allowNull: false,
//       },

//       projectId: {
//         type: Sequelize.STRING(255),
//         allowNull: false,
//         references: {
//           model: 'projects',
//           key: 'id',
//         },
//         onDelete: 'CASCADE',
//       },

//       name: {
//         type: Sequelize.STRING,
//         allowNull: false,
//       },

//       createdBy: {
//         type: Sequelize.INTEGER,
//         allowNull: false,
//       },

//       createdAt: {
//         allowNull: false,
//         type: Sequelize.DATE,
//         defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
//       },

//       updatedAt: {
//         allowNull: false,
//         type: Sequelize.DATE,
//         defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
//       },
//     });
//   },

//   async down(queryInterface) {
//     await queryInterface.dropTable('project_main_folders');
//   },
// };
// new updates 




'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'project_main_folders',
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },

        projectId: {
          type: Sequelize.STRING(255),
          allowNull: false,
          references: {
            model: 'projects',
            key: 'id',
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },

        name: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },

        createdBy: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },

        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },

        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal(
            'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
          ),
        },
      },
      {
        engine: 'InnoDB',
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('project_main_folders');
  },
};
