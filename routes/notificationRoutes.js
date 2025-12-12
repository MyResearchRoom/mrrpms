const { Router } = require("express");
const authenticate = require("../middlewares/authMiddleware");
const {
  CLIENT,
  CLIENT_VENDOR,
  PROJECT_COORDINATOR,
  ADMIN,
} = require("../utils/constants");
const {
  getNotifications,
  markNotificationAsRead,
  deleteNotification,
  markAllNotificationsAsRead,
  getUnReadNotificationCnt,
} = require("../controllers/notificationController");


const router = Router();


router.get(
  "/",
  authenticate([ADMIN, CLIENT, CLIENT_VENDOR, PROJECT_COORDINATOR]),
  getNotifications
);


router.patch(
  "/:notificationId",
  authenticate([ADMIN, CLIENT, CLIENT_VENDOR, PROJECT_COORDINATOR]),
  markNotificationAsRead
);


router.patch(
  "/",
  authenticate([ADMIN, CLIENT, CLIENT_VENDOR, PROJECT_COORDINATOR]),
  markAllNotificationsAsRead
);


router.delete(
  "/:notificationId",
  authenticate([ADMIN, CLIENT, CLIENT_VENDOR, PROJECT_COORDINATOR]),
  deleteNotification
);


router.get(
  "/count",
  authenticate([ADMIN, CLIENT, CLIENT_VENDOR, PROJECT_COORDINATOR]),
  getUnReadNotificationCnt
);
module.exports = router;





