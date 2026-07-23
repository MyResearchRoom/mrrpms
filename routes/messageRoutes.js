const { Router } = require("express");
const {
  getMessages,
  getAttachment,
  sendMessage,
} = require("../controllers/chatController");
const authenticate = require("../middlewares/authMiddleware");
const {
  ADMIN,
  CLIENT,
  CLIENT_VENDOR,
  PROJECT_COORDINATOR,
} = require("../utils/constants");
const { upload } = require("../middlewares/upload");
const { isAssociatedMember } = require("../middlewares/isAssociatedMember");
const { validateFilesForUpdate } = require("../middlewares/fileValidation");
const router = Router();

router.post(
  "/",
  upload.fields([{ name: "files[]" }]),
  validateFilesForUpdate,
  authenticate([ADMIN, CLIENT, CLIENT_VENDOR, PROJECT_COORDINATOR]),
  isAssociatedMember,
  sendMessage
);

router.get(
  "/:projectId/messages",
  authenticate([ADMIN, CLIENT, CLIENT_VENDOR, PROJECT_COORDINATOR]),
  isAssociatedMember,
  getMessages
);

router.get(
  "/:attachmentId/attachment",
  authenticate([ADMIN, CLIENT, CLIENT_VENDOR, PROJECT_COORDINATOR]),
  getAttachment
);

module.exports = router;
