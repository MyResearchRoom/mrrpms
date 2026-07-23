const { User, Client, Project ,Participant,Meeting,MeetingParticipant} = require("../models")

const { Op } = require("sequelize");
exports.getDashboardCounts = async (req, res) => {
    try {
        const totalEmployees = await User.count({ where: { role: "PROJECT_COORDINATOR" } });
        const totalVendors = await User.count({ where: { role: "CLIENT_VENDOR" } });
        const totalClients = await Client.count({ where: { role: "CLIENT" } });
        const totalProjects = await Project.count();
        const pendingProjects = await Project.count({ where: { status: "pending" } });
        const inProcessProjects = await Project.count({ where: { status: "in-progress" } });
        const onHoldProjects = await Project.count({ where: { status: "on-hold" } });
        const completedProjects = await Project.count({ where: { status: "completed" } });
        const lowPriorityProjects = await Project.count({ where: { priority: "low" } });
        const mediumPriorityProjects = await Project.count({ where: { priority: "medium" } });
        const highPriorityProjects = await Project.count({ where: { priority: "high" } });
        const onHoldPriorityProjects = await Project.count({ where: { priority: "on-hold" } });
        const activePriorityProjects = await Project.count({ where: { priority: "active" } });


        return res.status(200).json({
            success: true,
            message: "Dashboard counts fetched successfully",
            data: {
                totalEmployees,
                totalVendors,
                totalClients,
                totalProjects,
                pendingProjects,
                inProcessProjects,
                onHoldProjects,
                completedProjects,
                lowPriorityProjects,
                mediumPriorityProjects,
                highPriorityProjects,
                onHoldPriorityProjects,
                activePriorityProjects
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to get dashboard counts",
        });
    }
};


exports.getProjectsCountForCoordinator = async (req, res) => {
    try {
        const employeeId = req.user.id;

        const totalProjects = await Participant.count({
            where: { employeeId },
            include: [
                {
                    model: Project,
                    as: "project",
                }
            ]
        });
        const pendingProjects = await Participant.count({
            where: { employeeId },
            include: [
                {
                    model: Project,
                    as: "project",
                    where: { status: "pending" }
                }
            ]
        });
        const inProgressProjects = await Participant.count({
            where: { employeeId },
            include: [
                {
                    model: Project,
                    as: "project",
                    where: { status: "in-progress" }
                }
            ]
        });
        const onHoldProjects = await Participant.count({
            where: { employeeId },
            include: [
                {
                    model: Project,
                    as: "project",
                    where: { status: "on-hold" }
                }
            ]
        });
        const completedProjects = await Participant.count({
            where: { employeeId },
            include: [
                {
                    model: Project,
                    as: "project",
                    where: { status: "completed" }
                }
            ]
        });
        const lowPriorityProjects = await Participant.count({
            where: { employeeId },
            include: [
                {
                    model: Project,
                    as: "project",
                    where: { priority: "low" }
                }
            ]
        });
        const mediumPriorityProjects = await Participant.count({
            where: { employeeId },
            include: [
                {
                    model: Project,
                    as: "project",
                    where: { priority: "medium" }
                }
            ]
        });
        const highPriorityProjects = await Participant.count({
            where: { employeeId },
            include: [
                {
                    model: Project,
                    as: "project",
                    where: { priority: "high" }
                }
            ]
        });

        const onHoldPriorityProjects = await Participant.count({
            where: { employeeId },
            include: [
                {
                    model: Project,
                    as: "project",
                    where: { priority: "on-hold" }
                }
            ]
        });
        const activePriorityProjects = await Participant.count({
            where: { employeeId },
            include: [
                {
                    model: Project,
                    as: "project",
                    where: { priority: "active" }
                }
            ]
        });

        return res.status(200).json({
            success: true,
            data: {
                totalProjects,
                pendingProjects,
                inProgressProjects,
                onHoldProjects,
                completedProjects,
                lowPriorityProjects,
                mediumPriorityProjects,
                highPriorityProjects,
                onHoldPriorityProjects,
                activePriorityProjects
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to get projects count for employee"
        });
    }
};


exports.getTodaysMeetingCount = async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date().toISOString().split("T")[0];

        const participantMeetings = await MeetingParticipant.findAll({
            where: { participantId: userId },
            attributes: ["meetingId"],
        });

        const participantMeetingIds = participantMeetings.map(m => m.meetingId);

        const todaysmeetingCount = await Meeting.count({
            where: {
                date: today,
                [Op.or]: [
                    { createdBy: userId },
                    { id: { [Op.in]: participantMeetingIds } }
                ]
            }
        });

        return res.status(200).json({
            success: true,
            message: "Todays meeting count fetched successfully",
            todaysmeetingCount,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to get todays meeting count"
        });
    }
};