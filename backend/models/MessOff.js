const mongoose = require("mongoose");

const messOffSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    fromDate: {
      type: String,
      required: true,
      index: true,
    },
    toDate: {
      type: String,
      required: true,
      index: true,
    },
    mealType: {
      type: String,
      enum: ["all", "breakfast", "lunch", "dinner"],
      default: "all",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("MessOff", messOffSchema);
