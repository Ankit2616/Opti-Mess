function buildStudentQrPayload(user) {
  return JSON.stringify({
    userId: String(user._id),
    name: user.name || user.username,
    rollNumber: user.rollNumber || user.username,
    role: user.role,
    department: user.department || "",
    hostel: user.hostel || "",
    roomNo: user.roomNo || "",
    phone: user.phone || "",
  });
}

module.exports = { buildStudentQrPayload };
