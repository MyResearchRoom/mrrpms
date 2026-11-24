const { CLIENT, CLIENT_VENDOR } = require("../utils/constants");
const { Project, Participant } = require("../models");

exports.getUserProjects = async (userId, role) => {
  const whereClause = {};
  const includes = [];
  if (role === CLIENT) {
    whereClause.clientId = userId;
  } else if (role === CLIENT_VENDOR) {
    whereClause.clientVendorId = userId;
  } else {
    includes.push({
      model: Participant,
      as: "employee",
    });
    whereClause["$employee.employeeId$"] = userId;
  }

  const projects = await Project.findAll({
    where: whereClause,
    include: includes,
  });

  return projects.map((item) => item.id);
};
