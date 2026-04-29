const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    roll: String,
    studentName: String,
    type: String,
    text: String,
    status: {
      type: String,
      default: "Pending",
    },
    date: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Complaint", complaintSchema);
