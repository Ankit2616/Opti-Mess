const express = require("express");

const {
  markAttendance,
  syncAttendance,
  getStudentAttendance,
} = require("../controllers/attendanceController");
const { verifyToken, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

router.post(
  "/mark-attendance",
  verifyToken,
  authorizeRoles(["worker"]),
  markAttendance
);
router.post(
  "/sync-attendance",
  verifyToken,
  authorizeRoles(["worker"]),
  syncAttendance
);
router.get(
  "/my-attendance",
  verifyToken,
  authorizeRoles(["student"]),
  getStudentAttendance
);

module.exports = router;
