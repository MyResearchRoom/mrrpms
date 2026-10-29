const express = require('express');
const { upload } = require("../middlewares/upload");
const authenticate = require("../middlewares/authMiddleware");
const { getProjectCoordinatorList, getProjectCoordinatorDetails, editProjectCoordinator, deleteProjectCoordinator, changePasswordProjectCoordinator, blockUnblockCoordinator } = require('../controllers/ProjectCordController');

const {
    ADMIN,
    CLIENT_VENDOR,
    CLIENT,
    PROJECT_COORDINATOR,
} = require("../utils/constants");

const router = express.Router();

router.get(
    "/getProjectCoordinatorList",
    authenticate([ADMIN, CLIENT_VENDOR, CLIENT, PROJECT_COORDINATOR]),
    getProjectCoordinatorList
);

router.get(
    "/getProjectCoordinatorDetails/:id",
    authenticate([ADMIN, CLIENT_VENDOR, CLIENT, PROJECT_COORDINATOR]),
    getProjectCoordinatorDetails
);

router.put(
    "/editProjectCoordinator/:id",
    upload.single("profile"),
    authenticate([ADMIN]),
    editProjectCoordinator
);

router.put(
    "/change-password/:id",
    authenticate([ADMIN]),
    changePasswordProjectCoordinator
);

router.put(
    "/blockUnblockCoordinator/:id",
    authenticate([ADMIN]),
    blockUnblockCoordinator
);

router.delete(
    "/deleteProjectCoordinator/:id",
    authenticate([ADMIN]),
    deleteProjectCoordinator
);

module.exports = router;