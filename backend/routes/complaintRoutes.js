const express = require("express");

const {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  updateComplaintStatus,
} = require("../controllers/complaintController");
const { verifyToken, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

router.post("/", verifyToken, authorizeRoles(["student"]), createComplaint);
router.get("/my", verifyToken, authorizeRoles(["student"]), getMyComplaints);
router.get("/all", verifyToken, authorizeRoles(["superadmin", "dean"]), getAllComplaints);
router.put("/:id/status", verifyToken, authorizeRoles(["superadmin", "dean"]), updateComplaintStatus);

module.exports = router;
