const Complaint = require("../models/Complaint");
const User = require("../models/User");

async function createComplaint(req, res) {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user || user.role !== "student") {
      return res.status(403).json({ message: "Only students can submit complaints" });
    }

    await Complaint.create({
      roll: user.rollNumber || user.username,
      studentName: user.name || user.username,
      type: req.body.type,
      text: req.body.text,
      status: "Pending",
      date: new Date().toISOString().slice(0, 10),
    });

    return res.json({ message: "Complaint submitted successfully" });
  } catch (_error) {
    return res.status(500).json({ message: "Server error" });
  }
}

async function getMyComplaints(req, res) {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user || user.role !== "student") {
      return res.status(403).json({ message: "Only students can view complaints" });
    }

    const complaints = await Complaint.find({
      roll: user.rollNumber || user.username,
    }).sort({ date: -1, createdAt: -1 });

    return res.json(complaints);
  } catch (_error) {
    return res.status(500).json({ message: "Server error" });
  }
}

async function getAllComplaints(_req, res) {
  try {
    const complaints = await Complaint.find().sort({ date: -1, createdAt: -1 });
    return res.json(complaints);
  } catch (_error) {
    return res.status(500).json([]);
  }
}

async function updateComplaintStatus(req, res) {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    complaint.status = complaint.status === "Pending" ? "Resolved" : "Pending";
    await complaint.save();

    return res.json({ message: "Status updated successfully" });
  } catch (_error) {
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  updateComplaintStatus,
};
