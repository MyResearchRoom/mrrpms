const { User, Meeting, MeetingParticipant, sequelize } = require("../models");
const { Op } = require("sequelize");
const moment = require("moment");

exports.createMeeting = async (req, res) => {
  try {
    const userId = req.user.id;

    const { title, date, time, agenda, meetingLink } = req.body;

    const meeting = await Meeting.create({
      createdBy: userId,
      title,
      date,
      time,
      agenda,
      meetingLink,
    });

    return res.status(200).json({
      success: true,
      message: "Meeting created successfully",
      data: meeting,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to create meeting",
    });
  }
};

exports.addParticipants = async (req, res) => {
  try {
    const participants = req.body.participants;
    const meetingId = req.params.meetingId;

    if (
      !participants ||
      !Array.isArray(participants) ||
      participants.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Participants array is required and cannot be empty.",
      });
    }

    const meeting = await Meeting.findByPk(meetingId);

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found.",
      });
    }

    for (let participantId of participants) {
      await MeetingParticipant.findOrCreate({
        where: {
          meetingId,
          participantId,
        },
        defaults: {
          meetingId,
          participantId,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: participants,
      message: "Participants added successfully.",
    });
  } catch (error) {
    console.error("Error adding participants:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getParticipants = async (req, res) => {
  try {
    const meetingId = req.params.meetingId;

    const meeting = await Meeting.findByPk(meetingId);
    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found.",
      });
    }

    const participants = await MeetingParticipant.findAll({
      where: { meetingId },
      include: [
        {
          model: User,
          as: "members",
          attributes: ["id", "name"],
        },
      ],
    });

    res.status(200).json({
      success: true,
      data: participants,
    });
  } catch (error) {
    console.error("Error fetching participants:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch participants.",
    });
  }
};

exports.getMeetings = async (req, res) => {
  try {
    const userId = req.user.id;
    // const requestedDate = req.query.date || new Date().toISOString().split("T")[0];
    const requestedDate = req.query.date
      ? moment(req.query.date).format("YYYY-MM-DD")
      : moment().format("YYYY-MM-DD");

    const participantMeetings = await MeetingParticipant.findAll({
      where: { participantId: userId },
      attributes: ["meetingId"],
    });

    const meetingIds = participantMeetings.map((mp) => mp.meetingId);

    const meetings = await Meeting.findAll({
      where: {
        date: requestedDate,
        [Op.or]: [{ createdBy: userId }, { id: { [Op.in]: meetingIds }
       }],
      },
      order: [["time", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Meetings retrieved successfully.",
      data: meetings,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getMeetingById = async (req, res) => {
  try {
    const userId = req.user.id;
    const meetingId = req.params.id;

    const participantRecord = await MeetingParticipant.findOne({
      where: {
        meetingId: meetingId,
        participantId: userId,
      },
    });

    const meeting = await Meeting.findOne({
      where: {
        id: meetingId,
        [Op.or]: [
          { createdBy: userId },
          participantRecord ? { id: meetingId } : null,
        ],
      },
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found or access denied.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Meeting retrieved successfully.",
      data: meeting,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//list for assigning members
exports.getEligibleEmployees = async (req, res) => {
  try {
    const currentUser = req.user.id;

    const employees = await User.findAll({
      where: {
        role: ["ADMIN", "PROJECT_COORDINATOR"],
        id: { [Op.ne]: currentUser },
      },
      attributes: ["id", "name"],
    });

    res.status(200).json({
      success: true,
      message: "Eligible employees retrieved successfully.",
      data: employees,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get Employee List",
      error: error.message,
    });
  }
};

exports.editMeeting = async (req, res) => {
  try {
    const userId = req.user.id;
    const meetingId = req.params.id;

    const meeting = await Meeting.findOne({
      where: {
        id: meetingId,
        createdBy: userId,
      },
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Unauthorized access only host can edit meeting.",
      });
    }

    const { title, date, time, agenda, meetingLink } = req.body;

    await meeting.update({
      title: title || meeting.title,
      date: date || meeting.date,
      time: time || meeting.time,
      agenda: agenda || meeting.agenda,
      meetingLink: meetingLink || meeting.meetingLink,
    });

    return res.status(200).json({
      success: true,
      message: "Meeting updated successfully.",
      data: meeting,
    });
  } catch (error) {
    console.error("Failed to update meeting:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update meeting.",
    });
  }
};

exports.deleteMeeting = async (req, res) => {
  try {
    const meetingId = req.params.meetingId;

    const meeting = await Meeting.findOne({
      where: { id: meetingId },
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found.",
      });
    }

    await MeetingParticipant.destroy({
      where: { meetingId },
    });

    await Meeting.destroy({
      where: { id: meetingId },
    });

    return res.status(200).json({
      success: true,
      message: "Meeting deleted successfully.",
    });
  } catch (error) {
    console.log("Error deleting meeting:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete Meeting.",
    });
  }
};

exports.removeParticipant = async (req, res) => {
  try {
    const { meetingId, participantId } = req.params;

    const removedParticipant = await MeetingParticipant.destroy({
      where: {
        meetingId,
        participantId,
      },
    });

    if (!removedParticipant) {
      return res.status(404).json({
        success: false,
        message: "Participant not found for this meeting",
      });
    }

    res.status(200).json({
      success: true,
      message: "Participant removed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to remove participant",
    });
  }
};
