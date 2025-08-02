const { Router } = require("express");
const authenticate = require("../middlewares/authMiddleware");
const {
    CLIENT,
    CLIENT_VENDOR,
    PROJECT_COORDINATOR,
} = require("../utils/constants");
const { getNotifications } = require("../controllers/notificationController");

const router = Router();

router.get(
    "/",
    authenticate([CLIENT, CLIENT_VENDOR, PROJECT_COORDINATOR]),
    getNotifications
);

module.exports = router;