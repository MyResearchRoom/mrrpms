const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const projectCordRoutes = require("./ProjectCordRoutes");
const vendorRoutes = require("./VendorRoutes");
const clientRoutes = require("./ClientRoutes");
const projectRoutes = require("./projectRoutes");
const messageRoutes = require("./messageRoutes");
const countRoutes = require("./countRoutes");
const notificationRoutes = require("./notificationRoutes");
const todoListRoutes = require("./todoListRoutes");
const meetingRoutes = require("./meetingRoutes");

router.use("/api/auth", authRoutes);
router.use("/api/projectCoordinator", projectCordRoutes);
router.use("/api/clientVendor", vendorRoutes);
router.use("/api/client", clientRoutes);
router.use("/api/project", projectRoutes);
router.use("/api/message", messageRoutes);
router.use("/api/counts", countRoutes);
router.use("/api/notification", notificationRoutes);
router.use("/api/todolist", todoListRoutes);
router.use("/api/meeting", meetingRoutes);

module.exports = router;
