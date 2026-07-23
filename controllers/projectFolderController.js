const { where } = require("sequelize");
const { ProjectMainFolder,ProjectSubFolder, Project } = require("../models");

//not in working condition need to check if required
//new upated on 28-12-2025
exports.createFolder = async (req, res) => {
  try {
    const { projectId, name } = req.body;

    if (!projectId || !name) {
      return res
        .status(400)
        .json({ success: false, message: "Project ID and folder name are required." });
    }

    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found." });
    }
    if (project.isBlock) {
      return res.status(404).json({ success: false, message: "Access denied. Project is blocked." });
    }

    const folder = await ProjectMainFolder.create({
      projectId,
      name,
      createdBy: req.user.id, 
    });

    res.status(201).json({
      success: true,
      message: "Folder created successfully",
      data: folder,
    });
  } catch (error) {
    console.error("Error creating folder:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//new upated on 26-12-2025
exports.getProjectMainFolders = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (project.isBlock) {
      return res.status(404).json({ success: false, message: "Access denied. Project is blocked." });
    }

    const folders = await ProjectMainFolder.findAll({
      where: { projectId },
      attributes: [
        "id",
        "name",
        "projectId",
        "createdBy",
        "createdAt",
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: folders,
    });
  } catch (error) {
    console.error("Get folders error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//new upated on 26-12-2025
exports.getProjectSubFolders = async (req, res) => {
  try {
    const { projectId,mainFolderId } = req.params;

    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const projectMainFolder = await ProjectMainFolder.findByPk(mainFolderId);
    if (!projectMainFolder) {
      return res.status(404).json({
        success: false,
        message: "Project main folder not created",
      });
    }

    if (project.isBlock) {
      return res.status(403).json({ success: false, message: "Access denied. Project is blocked." });
    }

    const folders = await ProjectSubFolder.findAll({
      where: { projectId,mainFolderId },
      attributes: [
        "id",
        "name",
        "projectId",
        "mainFolderId",
        "createdBy",
        "createdAt",
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: folders,
    });
  } catch (error) {
    console.error("Get sub folders error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//new upated on 26-12-2025
exports.getProjectAndMainFolderBySubFolder = async (req, res) => {
  try {
    const { subFolderId } = req.params;

    if (!subFolderId) {
      return res.status(400).json({
        success: false,
        message: "subFolderId is required",
      });
    }

    const subFolder = await ProjectSubFolder.findOne({
      where: { id: subFolderId },
      include: [
        {
          model: ProjectMainFolder,
          as: "mainFolder",
          attributes: ["id", "name"],
          include: [
            {
              model: Project,
              as: "project",
              attributes: ["id", "projectName"],
            },
          ],
        },
      ],
    });

    if (!subFolder) {
      return res.status(404).json({
        success: false,
        message: "Subfolder not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        projectName: subFolder.mainFolder.project.projectName,
        mainFolderName: subFolder.mainFolder.name,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//new upated on 26-12-2025
exports.getProjectAndMainFolderByMainFolder = async (req, res) => {
  try {
    const { mainFolderId } = req.params;

    if (!mainFolderId) {
      return res.status(400).json({
        success: false,
        message: "Main FolderId is required",
      });
    }

    const mainFolder = await ProjectMainFolder.findOne({
      where: { id: mainFolderId },
      include: [
        {
          model: Project,
          as: "project",
          attributes: ["id", "projectName"],           
        },
      ],
    });

    if (!mainFolder) {
      return res.status(404).json({
        success: false,
        message: "Main folder not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        projectName: mainFolder.project.projectName,
        mainFolderName: mainFolder.name,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//new upated on 26-12-2025
// exports.getProjectAndMainFolderBySubFolder = async (req, res) => {
//   try {
//     const { subFolderId } = req.params;

//     if (!subFolderId) {
//       return res.status(400).json({
//         success: false,
//         message: "subFolderId is required",
//       });
//     }

//     const subFolder = await ProjectSubFolder.findOne({
//       where: { id: subFolderId },
//       include: [
//         {
//           model: ProjectMainFolder,
//           as: "mainFolder",
//           attributes: ["id", "name"],
//           include: [
//             {
//               model: Project,
//               as: "project",
//               attributes: ["id", "projectName"],
//             },
//           ],
//         },
//       ],
//     });

//     if (!subFolder) {
//       return res.status(404).json({
//         success: false,
//         message: "Subfolder not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: {
//         projectName: subFolder.mainFolder.project.projectName,
//         mainFolderName: subFolder.mainFolder.name,
//         subFolderName: subFolder.name,
//       },
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

exports.getProjectAndMainFolderBySubFolder = async (req, res) => {
  try {
    const { subFolderId, mainFolderId, projectId } = req.params;

    if (parseInt(subFolderId) === 0) {
      if (!mainFolderId || !projectId) {
        return res.status(400).json({
          success: false,
          message: "projectId and mainFolderId are required when subFolderId is 0",
        });
      }

      const mainFolder = await ProjectMainFolder.findOne({
        where: {
          id: mainFolderId,
          projectId,
        },
        attributes: ["id", "name"],
        include: [
          {
            model: Project,
            as: "project",
            attributes: ["id", "projectName"],
          },
        ],
      });

      if (!mainFolder) {
        return res.status(404).json({
          success: false,
          message: "Main folder not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          projectName: mainFolder.project.projectName,
          mainFolderName: mainFolder.name,
          subFolderName: null, // 👈 important
        },
      });
    }

    const subFolder = await ProjectSubFolder.findOne({
      where: { id: subFolderId },
      include: [
        {
          model: ProjectMainFolder,
          as: "mainFolder",
          attributes: ["id", "name"],
          include: [
            {
              model: Project,
              as: "project",
              attributes: ["id", "projectName"],
            },
          ],
        },
      ],
    });

    if (!subFolder) {
      return res.status(404).json({
        success: false,
        message: "Subfolder not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        projectName: subFolder.mainFolder.project.projectName,
        mainFolderName: subFolder.mainFolder.name,
        subFolderName: subFolder.name,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.editMainFolder = async (req,res) =>{
  try {
    const {mainFolderId}=req.params;
    const {name,projectId}=req.body;

    if(!name || !projectId){
      return res.status(404).json({
        success:false,
        message:"Project id and folder name is required.",
      });
    }

    const folder = await ProjectMainFolder.findByPk(mainFolderId);

    if(!folder){
      return res.status(404).json({
        success:false,
        message:"Projectfolder not found",
      });
    }
    
    await folder.update({
      projectId: projectId || folder.projectId,
      name : name || folder.name ,
      createdBy: folder.createdBy,
      updateAt:  new Date(),
    })

    res.status(200).json({
      success:true,
      message: "Folder name updated successfully.",
      folder:{
        id:folder.id,
        projectId:folder.projectId,
        name:folder.name,
      }
    });

  } catch(error) {
    console.log(error);
    res.status(500).json({
      success:false,
      message:"Failed to update project main folder name",
    });
  }
};

exports.editSubFolder = async (req,res) =>{
  try {
    const {subFolderId}=req.params;
    const {name,projectId}=req.body;

    if(!name || !projectId){
      return res.status(404).json({
        success:false,
        message:"Project id and folder name is required.",
      });
    }

    const folder = await ProjectSubFolder.findByPk(subFolderId);

    if(!folder){
      return res.status(404).json({
        success:false,
        message:"Project sub folder not found",
      });
    }
    
    await folder.update({
      projectId: projectId || folder.projectId,
      mainFolderId:folder.mainFolderId,
      name : name || folder.name ,
      createdBy: folder.createdBy,
      updateAt:  new Date(),
    })

    res.status(200).json({
      success:true,
      message: "Folder name updated successfully.",
      folder:{
        id:folder.id,
        projectId:folder.projectId,
        name:folder.name,
      }
    });

  } catch(error) {
    console.log(error);
    res.status(500).json({
      success:false,
      message:"Failed to update project main folder name",
    });
  }
};


