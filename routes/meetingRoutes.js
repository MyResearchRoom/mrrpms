const express = require("express");
const authenticate = require("../middlewares/authMiddleware");
const {
  ADMIN,
  CLIENT_VENDOR,
  CLIENT,
  PROJECT_COORDINATOR,
} = require("../utils/constants");
const {
  createMeeting,
  addParticipants,
  getMeetings,
  getEligibleEmployees,
  editMeeting,
  deleteMeeting,
  getMeetingById,
  getParticipants,
  removeParticipant,
} = require("../controllers/meetingController");

const router = express("Router");

router.post(
  "/createMeeting",
  authenticate([ADMIN, PROJECT_COORDINATOR]),
  createMeeting
);

router.post(
  "/addParticipants/:meetingId",
  authenticate([ADMIN, PROJECT_COORDINATOR]),
  addParticipants
);

router.get(
  "/getParticipants/:meetingId",
  authenticate([ADMIN, PROJECT_COORDINATOR]),
  getParticipants
);

router.get(
  "/getMeetings",
  authenticate([ADMIN, PROJECT_COORDINATOR]),
  getMeetings
);

router.get(
  "/getMeetingById/:id",
  authenticate([ADMIN, PROJECT_COORDINATOR]),
  getMeetingById
);

router.get(
  "/getEligibleEmployees",
  authenticate([ADMIN, PROJECT_COORDINATOR]),
  getEligibleEmployees
);

router.put(
  "/editMeeting/:id",
  authenticate([ADMIN, PROJECT_COORDINATOR]),
  editMeeting
);

router.delete(
  "/deleteMeeting/:meetingId",
  authenticate([ADMIN, PROJECT_COORDINATOR]),
  deleteMeeting
);

router.delete(
  "/removeParticipant/:meetingId/:participantId",
  authenticate([ADMIN, PROJECT_COORDINATOR]),
  removeParticipant
);

module.exports = router;
