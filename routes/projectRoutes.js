const { Router } = require("express");
const router = Router();
const { upload } = require("../middlewares/upload");
const authenticate = require("../middlewares/authMiddleware");
const { isAssociatedMember } = require("../middlewares/isAssociatedMember");
const {
  createProject,
  updateInfo,
  addParticipants,
  uploadDocument,
  getProjects,
  getProjectById,
  getProjectDocuments,
  getDocumentById,
  changeProjectStatus,
  changeProjectPriority,
  updateDocument,
  deleteDocument,
  getClientProjects,
  getParticipants,
  blockAction,
  removeParticipant,
} = require("../controllers/projectController");

const {
  validate,
  validateProject,
  validateProjectInfo,
  validateAddParticipant,
} = require("../middlewares/validations");

const {
  ADMIN,
  CLIENT_VENDOR,
  CLIENT,
  PROJECT_COORDINATOR,
} = require("../utils/constants");

router.post(
  "/",
  authenticate([ADMIN]),
  validateProject,
  validate,
  createProject
);

router.patch(
  "/info/:projectId",
  authenticate([CLIENT, CLIENT_VENDOR]),
  validateProjectInfo,
  validate,
  updateInfo
);

router.post(
  "/participants/:projectId",
  authenticate([ADMIN]),
  validateAddParticipant,
  validate,
  addParticipants
);

router.get(
  "/participants/:projectId",
  authenticate([ADMIN, CLIENT, CLIENT_VENDOR, PROJECT_COORDINATOR]),
  isAssociatedMember,
  getParticipants
);

router.post(
  "/document/:projectId",
  upload.single("document"),
  authenticate([CLIENT, PROJECT_COORDINATOR, CLIENT_VENDOR]),
  isAssociatedMember,
  uploadDocument
);

router.put(
  "/document/:documentId",
  upload.single("document"),
  authenticate([ADMIN]),
  updateDocument
);

router.delete("/document/:documentId", authenticate([ADMIN]), deleteDocument);

router.get(
  "/",
  authenticate([ADMIN, PROJECT_COORDINATOR, CLIENT, CLIENT_VENDOR]),
  getProjects
);

router.get(
  "/:projectId",
  authenticate([ADMIN, PROJECT_COORDINATOR, CLIENT, CLIENT_VENDOR]),
  getProjectById
);

router.get(
  "/:projectId/documents",
  authenticate([ADMIN, PROJECT_COORDINATOR, CLIENT, CLIENT_VENDOR]),
  isAssociatedMember,
  getProjectDocuments
);

router.get(
  "/document/:documentId",
  authenticate([ADMIN, PROJECT_COORDINATOR, CLIENT, CLIENT_VENDOR]),
  getDocumentById
);

router.patch(
  "/status/:projectId",
  authenticate([ADMIN, PROJECT_COORDINATOR]),
  changeProjectStatus
);

router.patch(
  "/priority/:projectId",
  authenticate([ADMIN, PROJECT_COORDINATOR]),
  changeProjectPriority
);

router.get(
  "/client/projects",
  authenticate([CLIENT, CLIENT_VENDOR]),
  getClientProjects
);

router.post("/block-action/:projectId", authenticate([ADMIN]), blockAction);

router.delete(
  "/:participantId",
  authenticate([ADMIN]),
  removeParticipant
);

module.exports = router;
