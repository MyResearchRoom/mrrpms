'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    // 1️⃣ Change folderId to allow NULL
    await queryInterface.addColumn('project_documents', 'mainFolderId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'project_main_folders',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    // 2️⃣ Add subFolderId column
    await queryInterface.addColumn('project_documents', 'subFolderId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'project_sub_folders',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  },

  async down(queryInterface, Sequelize) {

    // rollback subFolderId
    await queryInterface.removeColumn('project_documents', 'subFolderId');

    // rollback folderId to NOT NULL (only if you really want)
    await queryInterface.removeColumn('project_documents', 'mainFolderId');

  }
};


// // code by sh


// 'use strict';

// /** @type {import('sequelize-cli').Migration} */
// module.exports = {
//   async up(queryInterface, Sequelize) {

//     // 1️⃣ MODIFY existing mainFolderId (DO NOT add again)
//     await queryInterface.changeColumn('project_documents', 'mainFolderId', {
//       type: Sequelize.INTEGER,
//       allowNull: true,
//       references: {
//         model: 'project_main_folders',
//         key: 'id',
//       },
//       onDelete: 'CASCADE',
//       onUpdate: 'CASCADE',
//     });

//     // 2️⃣ ADD subFolderId (this is new, so addColumn is correct)
//     await queryInterface.addColumn('project_documents', 'subFolderId', {
//       type: Sequelize.INTEGER,
//       allowNull: true,
//       references: {
//         model: 'project_sub_folders',
//         key: 'id',
//       },
//       onDelete: 'CASCADE',
//       onUpdate: 'CASCADE',
//     });
//   },

//   async down(queryInterface, Sequelize) {

//     // rollback subFolderId
//     await queryInterface.removeColumn('project_documents', 'subFolderId');

//     // rollback mainFolderId to NOT NULL (only if needed)
//     await queryInterface.changeColumn('project_documents', 'mainFolderId', {
//       type: Sequelize.INTEGER,
//       allowNull: false,
//       references: {
//         model: 'project_main_folders',
//         key: 'id',
//       },
//     });
//   },
// };
