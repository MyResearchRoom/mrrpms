const express = require("express");
const {
  clientValidationRules,
  validate,
} = require("../middlewares/validations");
const authenticate = require("../middlewares/authMiddleware");
const { upload } = require("../middlewares/upload");
const {
  addClient,
  getClientList,
  getClientDetails,
  editClientDetails,
  changePasswordClient,
  deleteClient,
  blockUnblockClient,
  getClientsByRole,
} = require("../controllers/ClientController");

const {
  ADMIN,
  CLIENT_VENDOR,
  CLIENT,
  PROJECT_COORDINATOR,
} = require("../utils/constants");

const router = express.Router();

router.post(
  "/addClient",
  upload.single("profile"),
  authenticate([ADMIN]),
  clientValidationRules,
  validate,
  addClient
);

router.get(
  "/getClientList",
  authenticate([ADMIN, CLIENT_VENDOR, CLIENT, PROJECT_COORDINATOR]),
  getClientList
);

router.get(
  "/getClientDetails/:clientId",
  authenticate([ADMIN, CLIENT_VENDOR, CLIENT, PROJECT_COORDINATOR]),
  getClientDetails
);

router.put(
  "/editClient/:clientId",
  upload.single("profile"),
  authenticate([ADMIN]),
  editClientDetails
);

router.get("/getClientsByRole", authenticate([ADMIN]), getClientsByRole);

router.put("/change-password/:id", authenticate([ADMIN]), changePasswordClient);

router.put(
  "/blockUnblockClient/:clientId",
  authenticate([ADMIN]),
  blockUnblockClient
);

router.delete("/deleteClient/:id", authenticate([ADMIN]), deleteClient);

module.exports = router;
