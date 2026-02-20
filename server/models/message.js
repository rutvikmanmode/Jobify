const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    messageType: {
      type: String,
      enum: ["text", "file", "interview"],
      default: "text"
    },
    text: {
      type: String,
      default: ""
    },
    file: {
      fileUrl: String,
      fileName: String,
      mimeType: String,
      size: Number
    },
    interview: {
      scheduledAt: Date,
      durationMinutes: Number,
      meetingProvider: {
        type: String,
        enum: ["google_meet", "zoom", "other"]
      },
      meetingLink: String,
      notes: String,
      status: {
        type: String,
        enum: ["scheduled", "cancelled", "completed"],
        default: "scheduled"
      }
    }
  },
  { timestamps: true }
);

MessageSchema.index({ conversation: 1, createdAt: -1 });

module.exports = mongoose.model("Message", MessageSchema);
