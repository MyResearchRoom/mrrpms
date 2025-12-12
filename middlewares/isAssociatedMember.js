const { ADMIN, CLIENT, CLIENT_VENDOR } = require("../utils/constants");
const { Project, Participant } = require("../models");

exports.isAssociatedMember = async (req, res, next) => {
  try {
    const { id, role } = req.user;
    const projectId =
      req.params.projectId || req.body.projectId || req.query.projectId;

    const project = await Project.findByPk(projectId);
    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }
    if (role === ADMIN) {
      req.project = project;
      return next();
    } else if (role === CLIENT) {
      if (project.clientId !== id) {
        return res.status(403).json({
          success: false,
          message: "You are not associated with this project",
        });
      }
    } else if (role === CLIENT_VENDOR) {
      if (project.clientVendorId !== id) {
        return res.status(403).json({
          success: false,
          message: "You are not associated with this project",
        });
      }
    } else {
      const participant = await Participant.findOne({
        where: {
          projectId: projectId,
          employeeId: id,
        },
      });

      if (!participant) {
        return res.status(403).json({
          success: false,
          message: "You are not associated with this project",
        });
      }
    }

    req.project = project;

    next();
  } catch (error) {
    console.log(error);

    res.status(500).json({ success: false, message: "Something went wrong." });
  }
};
