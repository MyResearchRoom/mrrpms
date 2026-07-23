const express = require("express");
const { userValidationRules, validate } = require("../middlewares/validations");
const authenticate = require("../middlewares/authMiddleware");
const { upload } = require("../middlewares/upload");
const verifyToken = require("../middlewares/verifyToken");
const {
  register,
  login,
  clientLogin,
  verifyOtpLogin,
  changePassword,
  logOut,
  verifyOtpClientLogin,
  refreshToken,
  getUser,
  resendOtp,
  getEmployees,
} = require("../controllers/authController");
const router = express.Router();

const {
  ADMIN,
  CLIENT_VENDOR,
  CLIENT,
  PROJECT_COORDINATOR,
} = require("../utils/constants");

router.post(
  "/register",
  upload.single("profile"),
  authenticate([ADMIN]),
  userValidationRules,
  validate,
  register
);

router.post("/login", login);

router.post("/clientLogin", clientLogin);

router.post("/verifyOtpLogin", verifyOtpLogin);

router.post("/verifyOtpClientLogin", verifyOtpClientLogin);

router.post("/refresh-token", refreshToken);

router.post("/change-password", authenticate([ADMIN]), changePassword);

router.get(
  "/getUser",
  authenticate([ADMIN, CLIENT_VENDOR, PROJECT_COORDINATOR, CLIENT]),
  getUser
);

router.post(
  "/logout",
  authenticate([ADMIN, CLIENT_VENDOR, PROJECT_COORDINATOR, CLIENT]),
  logOut
);

router.post("/resendOtp", resendOtp);

router.get("/employees", authenticate([ADMIN]), getEmployees);

module.exports = router;
