const express = require('express');
const authenticate = require("../middlewares/authMiddleware");
const { getDashboardCounts,getProjectsCountForCoordinator, getTodaysMeetingCount } = require('../controllers/countController');

const {
    ADMIN,
    CLIENT_VENDOR,
    CLIENT,
    PROJECT_COORDINATOR,
} = require("../utils/constants");

const router = express.Router();

router.get(
    "/getDashboardCounts",
    authenticate([ADMIN]),
    getDashboardCounts
);

router.get(
    "/getProjectsCountsForCoordinator",
    authenticate([PROJECT_COORDINATOR]),
    getProjectsCountForCoordinator
);

router.get(
    "/getTodaysMeetingCount",
    authenticate([ADMIN, PROJECT_COORDINATOR]),
    getTodaysMeetingCount
);

module.exports = router;