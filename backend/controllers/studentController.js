const User = require("../models/User");

async function getStudentProfile(req, res) {
  try {
    const student = await User.findById(req.user.userId).select("-password");

    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    return res.json(student);
  } catch (_error) {
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  getStudentProfile,
};
