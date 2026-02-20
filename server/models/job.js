const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  salary: {
    type: String,
    trim: true
  },
  description: String,
  requiredSkills: [String],
  status: {
    type: String,
    enum: ["draft", "open", "closed", "archived"],
    default: "open"
  },
  expiryDate: Date,
  recruiters: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true });

module.exports = mongoose.model("Job", JobSchema);
