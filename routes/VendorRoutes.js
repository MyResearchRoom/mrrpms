const express = require('express');
const { upload } = require("../middlewares/upload");
const authenticate = require("../middlewares/authMiddleware");
const { getVendorsList, getVendorDetails, editVendor, deleteVendor, changePasswordVendor, blockUnblockVendor } = require('../controllers/VendorController');

const {
    ADMIN,
    CLIENT_VENDOR,
    CLIENT,
    PROJECT_COORDINATOR,
} = require("../utils/constants");

const router = express.Router()

router.get(
    '/getVendorsList',
    authenticate([ADMIN, CLIENT_VENDOR, CLIENT, PROJECT_COORDINATOR]),
    getVendorsList
);

router.get(
    '/getVendorDetails/:id',
    authenticate([ADMIN, CLIENT_VENDOR, CLIENT, PROJECT_COORDINATOR]),
    getVendorDetails
);

router.put(
    "/editVendor/:id",
    upload.single("profile"),
    authenticate([ADMIN]),
    editVendor
);

router.put(
    "/change-password/:id",
    authenticate([ADMIN]),
    changePasswordVendor
);

router.put(
    "/blockUnblockVendor/:id",
    authenticate([ADMIN]),
    blockUnblockVendor
);

router.delete(
    "/deleteVendor/:id",
    authenticate([ADMIN]),
    deleteVendor
);

module.exports = router;