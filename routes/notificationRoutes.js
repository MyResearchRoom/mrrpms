const { Router } = require("express");
const authenticate = require("../middlewares/authMiddleware");
const {
  CLIENT,
  CLIENT_VENDOR,
  PROJECT_COORDINATOR,
  ADMIN,
  SUBMISSION_SPECIALIST,
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
  authenticate([ADMIN, CLIENT, CLIENT_VENDOR, PROJECT_COORDINATOR,SUBMISSION_SPECIALIST]),
  getNotifications
);

router.patch(
  "/:notificationId",
  authenticate([ADMIN, CLIENT, CLIENT_VENDOR, PROJECT_COORDINATOR,SUBMISSION_SPECIALIST]),
  markNotificationAsRead
);

router.patch(
  "/",
  authenticate([ADMIN, CLIENT, CLIENT_VENDOR, PROJECT_COORDINATOR,SUBMISSION_SPECIALIST]),
  markAllNotificationsAsRead
);

router.delete(
  "/:notificationId",
  authenticate([ADMIN, CLIENT, CLIENT_VENDOR, PROJECT_COORDINATOR,SUBMISSION_SPECIALIST]),
  deleteNotification
);

router.get(
  "/count",
  authenticate([ADMIN, CLIENT, CLIENT_VENDOR, PROJECT_COORDINATOR,SUBMISSION_SPECIALIST]),
  getUnReadNotificationCnt
);
module.exports = router;





