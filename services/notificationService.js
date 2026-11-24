const { Op } = require("sequelize");
const { Notification, Participant, User } = require("../models");
const {
  PROJECT_COORDINATOR,
  CLIENT,
  CLIENT_VENDOR,
  ADMIN,
} = require("../utils/constants");

// exports.createNotifications = async (
//   project,
//   payload,
//   senderId,
//   senderRole,
//   transaction
// ) => {
//   const participants = await Participant.findAll({
//     where: {
//       projectId: project.id,
//       ...(senderRole === PROJECT_COORDINATOR
//         ? {
//             employeeId: {
//               [Op.ne]: senderId,
//             },
//           }
//         : {}),
//     },
//   });

//   if (senderRole !== CLIENT && senderRole !== CLIENT_VENDOR) {
//     await Notification.create(
//       {
//         ...payload,
//         clientId: project.clientId,
//         userId: project.clientVendorId,
//       },
//       {
//         transaction,
//       }
//     );
//   }

//   let notificationData = [];

//   const admin = await User.findAll({
//     attributes: ["id"],
//     where: {
//       role: ADMIN,
//       ...(senderRole === ADMIN ? { id: { [Op.ne]: senderId } } : {}),
//     },
//   });

//   for (let i = 0; i < admin.length; i++) {
//     notificationData.push({
//       ...payload,
//       clientId: null,
//       userId: admin[i].id,
//     });
//   }

//   for (let i = 0; i < participants.length; i++) {
//     notificationData.push({
//       ...payload,
//       clientId: null,
//       userId: participants[i].employeeId,
//     });
//   }

//   await Notification.bulkCreate(notificationData, {
//     transaction,
//   });

//   return true;
// };




exports.createNotifications = async (
  project,
  payload,
  senderId,
  senderRole,
  transaction,
  activeUsers = []
) => {
  const participantIds = new Set();


  if (senderRole === PROJECT_COORDINATOR) {
    participantIds.add(senderId);
  }
  activeUsers.forEach((user) => {
    if (user.role === PROJECT_COORDINATOR) participantIds.add(user.id);
  });


  const participants = await Participant.findAll({
    where: {
      projectId: project.id,
      employeeId: {
        [Op.notIn]: Array.from(participantIds),
      },
    },
  });


  const isClientActive = activeUsers.some(
    (user) =>
      (user.role === CLIENT && user.id === project.clientId) ||
      (user.role === CLIENT_VENDOR && user.id === project.clientVendorId)
  );


  if (
    senderRole !== CLIENT &&
    senderRole !== CLIENT_VENDOR &&
    !isClientActive
  ) {
    await Notification.create(
      {
        ...payload,
        clientId: project.clientId,
        userId: project.clientVendorId,
      },
      { transaction }
    );
  }


  let notificationData = [];


  const adminIds = new Set();
  if (senderRole === ADMIN) adminIds.add(senderId);
  activeUsers.forEach((user) => {
    if (user.role === ADMIN) adminIds.add(user.id);
  });


  const admins = await User.findAll({
    attributes: ["id"],
    where: {
      role: ADMIN,
      id: {
        [Op.notIn]: Array.from(adminIds),
      },
    },
  });


  admins.forEach((admin) =>
    notificationData.push({
      ...payload,
      clientId: null,
      userId: admin.id,
    })
  );


  participants.forEach((p) =>
    notificationData.push({
      ...payload,
      clientId: null,
      userId: p.employeeId,
    })
  );


  if (notificationData.length > 0) {
    await Notification.bulkCreate(notificationData, { transaction });
  }


  return true;
};
