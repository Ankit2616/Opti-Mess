const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["superadmin", "dean", "worker", "student"],
      required: true,
      default: "student",
    },
    name: {
      type: String,
      trim: true,
      default: undefined,
    },
    rollNumber: {
      type: String,
      trim: true,
      default: undefined,
    },
    department: {
      type: String,
      trim: true,
      default: undefined,
    },
    hostel: {
      type: String,
      trim: true,
      default: undefined,
    },
    phone: {
      type: String,
      trim: true,
      default: undefined,
    },
    qrCode: {
      type: String,
      default: undefined,
    },
    roomNo: {
      type: String,
      trim: true,
      default: undefined,
    },
    aadharNumber: {
      type: String,
      trim: true,
      default: undefined,
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

userSchema.index(
  { rollNumber: 1 },
  {
    unique: true,
    sparse: true,
  }
);

module.exports = mongoose.model("User", userSchema);
