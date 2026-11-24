const express = require("express");
const authenticate = require("../middlewares/authMiddleware");
const {
  ADMIN,
  PROJECT_COORDINATOR,
  SUBMISSION_SPECIALIST,
} = require("../utils/constants");
const { createJournal, getAllJournals, getJournalBYId, updateJournal, deleteJournal, getAllJournalsToDownloadExcel } = require("../controllers/masterJournals");
const router = express("Router");

router.post(
  "/add",
  authenticate([ADMIN, PROJECT_COORDINATOR,SUBMISSION_SPECIALIST]),
  createJournal
);

router.get(
  "/getAll",
  authenticate([ADMIN, PROJECT_COORDINATOR,,SUBMISSION_SPECIALIST]),
  getAllJournals
);

router.get(
  "/getAllForExcelDownload",
  authenticate([ADMIN, PROJECT_COORDINATOR,,SUBMISSION_SPECIALIST]),
  getAllJournalsToDownloadExcel
);

router.get(
  "/getById/:id",
  authenticate([ADMIN, PROJECT_COORDINATOR,SUBMISSION_SPECIALIST]),
  getJournalBYId
);

router.patch(
  "/updateJournal/:id", 
  authenticate([ADMIN, PROJECT_COORDINATOR,SUBMISSION_SPECIALIST]),
  updateJournal
);


router.delete(
  "/deleteJournal/:id", 
  authenticate([ADMIN, PROJECT_COORDINATOR,SUBMISSION_SPECIALIST]),
  deleteJournal
);

module.exports = router;