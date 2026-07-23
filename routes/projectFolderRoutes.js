const express = require("express");
const authenticate = require("../middlewares/authMiddleware");
const {
  ADMIN,
  CLIENT_VENDOR,
  CLIENT,
  PROJECT_COORDINATOR,
} = require("../utils/constants");
const { createFolder, getProjectMainFolders, getProjectSubFolders, getProjectAndMainFolderBySubFolder, getProjectAndMainFolderByMainFolder, editMainFolder, editSubFolder } = require("../controllers/projectFolderController");

const router = express("Router");

router.post(
  "/createFolder",
  authenticate([ADMIN]),
  createFolder
);

router.get(
  "/getProjectFolders/:projectId",
  authenticate([ADMIN,PROJECT_COORDINATOR]),
  getProjectMainFolders
);

router.get(
  "/getProjectSubFolders/:projectId/:mainFolderId",
  authenticate([ADMIN,PROJECT_COORDINATOR]),
  getProjectSubFolders
);

router.get(
  "/getmainfolderdetails/:mainFolderId",
  authenticate([ADMIN,PROJECT_COORDINATOR]),
  getProjectAndMainFolderByMainFolder
);

router.get(
  "/getsubfolderdetails/:projectId/:mainFolderId/:subFolderId",
  authenticate([ADMIN,PROJECT_COORDINATOR]),
  getProjectAndMainFolderBySubFolder
);

router.patch(
  "/editMainFolderName/:mainFolderId",
  authenticate([ADMIN]),
  editMainFolder
);

router.patch(
  "/editSubFolderName/:subFolderId",
  authenticate([ADMIN]),
  editSubFolder
);

module.exports = router;
