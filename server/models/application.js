const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true
  },
  status: {
    type: String,
    enum: ["Applied", "Screening", "Interview", "Offered", "Rejected"],
    default: "Applied"
  },
  score: {
    type: Number,
    default: 0
  },
  shortlisted: {
    type: Boolean,
    default: false
  },
  internalNotes: {
    type: String,
    default: ""
  },
  statusUpdatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model("Application", ApplicationSchema);
