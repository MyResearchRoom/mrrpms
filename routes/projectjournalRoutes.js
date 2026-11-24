const express = require("express");
const authenticate = require("../middlewares/authMiddleware");
const {
  ADMIN,
  CLIENT_VENDOR,
  CLIENT,
  PROJECT_COORDINATOR,
  SUBMISSION_SPECIALIST,
} = require("../utils/constants");
const { addDocumentJournal, getAllDocumentJournals, createProjectJournalArticle, getProjectJournalArticles, updateProjectJournalArticleStatus, updateProjectJournalArticle, getProjectJournalArticleDetailsById, getProjectJournalArticleById, removeJournalFromDocumementJournal } = require("../controllers/projectJournalController");

const router = express("Router");

router.post(
  "/document-journals",
  authenticate([ADMIN, PROJECT_COORDINATOR,SUBMISSION_SPECIALIST]),
  addDocumentJournal
);

router.get(
  "/document-journals",
  authenticate([ADMIN, PROJECT_COORDINATOR,CLIENT_VENDOR,CLIENT,SUBMISSION_SPECIALIST]),
  getAllDocumentJournals
);

router.delete(
  "/document-journals/:id",
  authenticate([ADMIN, SUBMISSION_SPECIALIST]),
  removeJournalFromDocumementJournal
);

router.post(
  "/createProjectJournalArticle",
  authenticate([ADMIN, SUBMISSION_SPECIALIST]),
  createProjectJournalArticle
);

router.get(
  "/getProjectJournalArticles",
  authenticate([ADMIN, SUBMISSION_SPECIALIST,CLIENT,CLIENT_VENDOR]),
  getProjectJournalArticles
);

router.get(
  "/getProjectJournalArticles/:articleId",
  authenticate([ADMIN, SUBMISSION_SPECIALIST]),
  getProjectJournalArticleById
);

router.patch(
  "/project-journal-articles/:id",
  authenticate([ADMIN, SUBMISSION_SPECIALIST]),
  updateProjectJournalArticle
);

router.patch(
  "/:id/status",
  authenticate([ADMIN, SUBMISSION_SPECIALIST]),
  updateProjectJournalArticleStatus
);

router.get(
  "/:articleId",
  authenticate([ADMIN, SUBMISSION_SPECIALIST,CLIENT,CLIENT_VENDOR]),
  getProjectJournalArticleDetailsById
);


module.exports = router;