const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      }
    ],
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job"
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    lastMessagePreview: {
      type: String,
      default: ""
    },
    lastMessageAt: {
      type: Date,
      default: Date.now
    },
    unreadCounts: {
      type: Map,
      of: Number,
      default: {}
    },
    lastReadAt: {
      type: Map,
      of: Date,
      default: {}
    }
  },
  { timestamps: true }
);

ConversationSchema.index({ participants: 1, job: 1 });

module.exports = mongoose.model("Conversation", ConversationSchema);
