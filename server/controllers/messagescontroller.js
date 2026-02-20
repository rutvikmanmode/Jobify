const Conversation = require("../models/conversation");
const Message = require("../models/message");
const User = require("../models/user");
const mongoose = require("mongoose");

const toIdString = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value._id) return value._id.toString();
  return value.toString ? value.toString() : "";
};

const ensureParticipant = (conversation, userId) => {
  const authId = toIdString(userId);
  if (!authId) return false;
  return (conversation.participants || []).some((participant) => toIdString(participant) === authId);
};

const randomToken = (size = 10) =>
  Math.random().toString(36).slice(2, 2 + size);

const buildMeetingLink = (provider) => {
  if (provider === "google_meet") {
    return `https://meet.google.com/${randomToken(3)}-${randomToken(4)}-${randomToken(3)}`;
  }
  if (provider === "zoom") {
    const numeric = `${Date.now()}`.slice(-10);
    return `https://zoom.us/j/${numeric}`;
  }
  return "";
};

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const getAuthUserId = (req) => req?.user?.id || null;

const clampLimit = (value, fallback = 50) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(1, Math.min(n, 100));
};

const getMapValue = (mapLike, key, fallback) => {
  if (!mapLike) return fallback;
  if (typeof mapLike.get === "function") {
    const value = mapLike.get(key);
    return value ?? fallback;
  }
  return mapLike[key] ?? fallback;
};

const setMapValue = (mapLike, key, value) => {
  if (!mapLike || typeof mapLike.set !== "function") return;
  mapLike.set(key, value);
};

const getUnreadCount = (conversation, userId) => {
  const raw = getMapValue(conversation.unreadCounts, userId, 0);
  const unread = Number(raw);
  return Number.isFinite(unread) ? unread : 0;
};

const normalizeConversationState = (conversation) => {
  const participantIds = (conversation.participants || []).map((p) => toIdString(p)).filter(Boolean);
  const nextUnreadCounts = {};
  const nextLastReadAt = {};

  participantIds.forEach((participantId) => {
    const unread = Number(getMapValue(conversation.unreadCounts, participantId, 0));
    nextUnreadCounts[participantId] = Number.isFinite(unread) && unread >= 0 ? unread : 0;

    const rawReadAt = getMapValue(conversation.lastReadAt, participantId, null);
    if (rawReadAt) {
      const parsed = new Date(rawReadAt);
      if (!Number.isNaN(parsed.getTime())) {
        nextLastReadAt[participantId] = parsed;
      }
    }
  });

  conversation.unreadCounts = nextUnreadCounts;
  conversation.lastReadAt = nextLastReadAt;
};

const markConversationRead = async (conversation, userId) => {
  const unread = getUnreadCount(conversation, userId);
  const currentReadAt = getMapValue(conversation.lastReadAt, userId, null);
  const updates = {};
  if (unread !== 0) {
    updates[`unreadCounts.${userId}`] = 0;
  }
  if (!currentReadAt) {
    updates[`lastReadAt.${userId}`] = new Date();
  }

  if (Object.keys(updates).length === 0) {
    return false;
  }

  await Conversation.updateOne({ _id: conversation._id }, { $set: updates });

  setMapValue(conversation.unreadCounts, userId, 0);
  setMapValue(conversation.lastReadAt, userId, updates[`lastReadAt.${userId}`] || currentReadAt);
  return true;
};

const initializeConversationState = async (conversation, actorUserId) => {
  normalizeConversationState(conversation);
  const updates = {};
  (conversation.participants || []).forEach((participant) => {
    const participantId = toIdString(participant);
    if (!participantId) return;
    const unread = getMapValue(conversation.unreadCounts, participantId, null);
    if (unread === null || unread === undefined) {
      updates[`unreadCounts.${participantId}`] = 0;
    }
  });

  if (actorUserId) {
    const readAt = getMapValue(conversation.lastReadAt, actorUserId, null);
    if (!readAt) {
      updates[`lastReadAt.${actorUserId}`] = new Date();
    }
  }

  if (Object.keys(updates).length > 0) {
    await Conversation.updateOne({ _id: conversation._id }, { $set: updates });

    Object.keys(updates).forEach((path) => {
      if (path.startsWith("unreadCounts.")) {
        const id = path.replace("unreadCounts.", "");
        setMapValue(conversation.unreadCounts, id, updates[path]);
      } else if (path.startsWith("lastReadAt.")) {
        const id = path.replace("lastReadAt.", "");
        setMapValue(conversation.lastReadAt, id, updates[path]);
      }
    });
  }
};

exports.createOrGetConversation = async (req, res) => {
  try {
    const authUserId = getAuthUserId(req);
    if (!authUserId) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    const { participantId, jobId } = req.body;
    if (!participantId) {
      return res.status(400).json({ success: false, message: "participantId is required" });
    }

    if (participantId === authUserId) {
      return res.status(400).json({ success: false, message: "Cannot chat with yourself" });
    }

    const targetUser = await User.findById(participantId).select("role");
    if (!targetUser) {
      return res.status(404).json({ success: false, message: "Participant not found" });
    }

    if (!["student", "recruiter"].includes(targetUser.role)) {
      return res.status(400).json({ success: false, message: "Invalid participant role" });
    }

    const participants = [authUserId, participantId].sort();
    let conversation = await Conversation.findOne({
      participants: { $all: participants, $size: 2 },
      ...(jobId ? { job: jobId } : {})
    })
      .populate("participants", "name role email profilePhoto recruiterProfile.jobTitle headline")
      .populate("job", "title company");

    if (!conversation) {
      conversation = await Conversation.create({
        participants,
        job: jobId || undefined,
        createdBy: authUserId,
        unreadCounts: {
          [authUserId]: 0,
          [participantId]: 0
        },
        lastReadAt: {
          [authUserId]: new Date()
        }
      });

      conversation = await Conversation.findById(conversation._id)
        .populate("participants", "name role email profilePhoto recruiterProfile.jobTitle headline")
        .populate("job", "title company");
    }

    await initializeConversationState(conversation, authUserId);

    return res.status(200).json({ success: true, data: conversation });
  } catch (error) {
    console.error("createOrGetConversation error:", error);
    return res.status(500).json({ success: false, message: "Failed to create conversation" });
  }
};

exports.listConversations = async (req, res) => {
  try {
    const authUserId = getAuthUserId(req);
    if (!authUserId) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    const conversations = await Conversation.find({ participants: authUserId })
      .populate("participants", "name role email profilePhoto recruiterProfile.jobTitle headline")
      .populate("job", "title company")
      .sort({ lastMessageAt: -1 });

    const data = conversations.map((conversation) => {
      const obj = conversation.toObject();
      obj.unreadCount = getUnreadCount(conversation, authUserId);
      return obj;
    });

    return res.json({ success: true, data });
  } catch (error) {
    console.error("listConversations error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch conversations" });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const authUserId = getAuthUserId(req);
    if (!authUserId) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    const { conversationId } = req.params;
    const { before, after } = req.query;
    const limit = clampLimit(req.query.limit, 50);
    const conversation = await Conversation.findById(conversationId)
      .populate("participants", "name role email profilePhoto recruiterProfile.jobTitle headline")
      .populate("job", "title company");

    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    if (!ensureParticipant(conversation, authUserId)) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const query = { conversation: conversationId };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    } else if (after) {
      query.createdAt = { $gt: new Date(after) };
    }

    const sort = after ? { createdAt: 1, _id: 1 } : { createdAt: -1, _id: -1 };

    let messages = await Message.find(query)
      .populate("sender", "name role email")
      .sort(sort)
      .limit(limit + 1);

    const hasMore = messages.length > limit;
    if (hasMore) {
      messages = messages.slice(0, limit);
    }

    if (!after) {
      messages.reverse();
    }

    await markConversationRead(conversation, authUserId);

    const oldestAt = messages.length > 0 ? messages[0].createdAt : null;
    const newestAt = messages.length > 0 ? messages[messages.length - 1].createdAt : null;

    return res.json({
      success: true,
      conversation,
      data: messages,
      meta: {
        limit,
        hasMore,
        mode: before ? "before" : after ? "after" : "latest",
        oldestAt,
        newestAt
      }
    });
  } catch (error) {
    console.error("getMessages error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch messages" });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const authUserId = getAuthUserId(req);
    if (!authUserId) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    const { conversationId } = req.params;
    const { text, messageType, file } = req.body;
    const safeText = typeof text === "string" ? text : "";
    const trimmedText = safeText.trim();

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }
    normalizeConversationState(conversation);

    if (!ensureParticipant(conversation, authUserId)) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const type = messageType || "text";
    if (type === "text" && !trimmedText) {
      return res.status(400).json({ success: false, message: "Message text is required" });
    }

    if (type === "file" && !file?.fileUrl) {
      return res.status(400).json({ success: false, message: "File payload is required" });
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: toIdString(authUserId),
      messageType: type,
      text: safeText,
      file: type === "file" ? file : undefined
    });

    conversation.lastMessagePreview =
      type === "file" ? `Shared file: ${file?.fileName || "attachment"}` : trimmedText;
    conversation.lastMessageAt = new Date();
    const authId = toIdString(authUserId);
    (conversation.participants || []).forEach((participant) => {
      const participantId = toIdString(participant);
      if (participantId === authId) {
        setMapValue(conversation.unreadCounts, participantId, 0);
        setMapValue(conversation.lastReadAt, participantId, new Date());
        return;
      }

      const existing = getUnreadCount(conversation, participantId);
      setMapValue(conversation.unreadCounts, participantId, existing + 1);
    });

    await conversation.save();

    const populated = await Message.findById(message._id).populate("sender", "name role email");
    return res.status(201).json({ success: true, data: populated });
  } catch (error) {
    console.error("sendMessage error:", error);
    return res.status(500).json({ success: false, message: "Failed to send message" });
  }
};

exports.scheduleInterview = async (req, res) => {
  try {
    const authUserId = getAuthUserId(req);
    if (!authUserId) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    const { conversationId } = req.params;
    const {
      scheduledAt,
      durationMinutes,
      meetingProvider = "other",
      meetingLink,
      notes
    } = req.body;

    if (!scheduledAt) {
      return res.status(400).json({ success: false, message: "scheduledAt is required" });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }
    normalizeConversationState(conversation);

    if (!ensureParticipant(conversation, authUserId)) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const finalMeetingLink = meetingLink || buildMeetingLink(meetingProvider);
    const message = await Message.create({
      conversation: conversationId,
      sender: authUserId,
      messageType: "interview",
      text: "Interview scheduled",
      interview: {
        scheduledAt: new Date(scheduledAt),
        durationMinutes: Number(durationMinutes) || 30,
        meetingProvider,
        meetingLink: finalMeetingLink,
        notes: notes || "",
        status: "scheduled"
      }
    });

    conversation.lastMessagePreview = "Interview scheduled";
    conversation.lastMessageAt = new Date();
    (conversation.participants || []).forEach((participant) => {
      const participantId = participant.toString();
      if (participantId === authUserId) {
        setMapValue(conversation.unreadCounts, participantId, 0);
        setMapValue(conversation.lastReadAt, participantId, new Date());
        return;
      }

      const existing = getUnreadCount(conversation, participantId);
      setMapValue(conversation.unreadCounts, participantId, existing + 1);
    });

    await conversation.save();

    const populated = await Message.findById(message._id).populate("sender", "name role email");
    return res.status(201).json({ success: true, data: populated });
  } catch (error) {
    console.error("scheduleInterview error:", error);
    return res.status(500).json({ success: false, message: "Failed to schedule interview" });
  }
};

exports.markInterviewStatus = async (req, res) => {
  try {
    const authUserId = getAuthUserId(req);
    if (!authUserId) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    const { messageId } = req.params;
    const { status } = req.body;

    if (!["scheduled", "cancelled", "completed"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const message = await Message.findById(messageId).populate("conversation");
    if (!message || message.messageType !== "interview") {
      return res.status(404).json({ success: false, message: "Interview message not found" });
    }

    if (!ensureParticipant(message.conversation, authUserId)) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    message.interview.status = status;
    await message.save();

    return res.json({ success: true, data: message });
  } catch (error) {
    console.error("markInterviewStatus error:", error);
    return res.status(500).json({ success: false, message: "Failed to update interview status" });
  }
};

exports.markConversationAsRead = async (req, res) => {
  try {
    const authUserId = getAuthUserId(req);
    if (!authUserId) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    const { conversationId } = req.params;
    if (!mongoose.isValidObjectId(conversationId)) {
      return res.status(400).json({ success: false, message: "Invalid conversation id" });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    if (!ensureParticipant(conversation, authUserId)) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    await markConversationRead(conversation, authUserId);
    return res.json({ success: true });
  } catch (error) {
    console.error("markConversationAsRead error:", error);
    return res.status(500).json({ success: false, message: "Failed to mark as read" });
  }
};

exports.uploadSharedFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    return res.json({
      success: true,
      data: {
        fileUrl: `uploads/chat/${req.file.filename}`,
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error("uploadSharedFile error:", error);
    return res.status(500).json({ success: false, message: "Failed to upload file" });
  }
};

exports.searchContacts = async (req, res) => {
  try {
    const authUserId = getAuthUserId(req);
    if (!authUserId) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    const q = (req.query.q || "").trim();
    const limit = clampLimit(req.query.limit, 20);
    const role = req.query.role;

    const filter = {
      _id: { $ne: authUserId },
      role: { $in: ["student", "recruiter"] }
    };

    if (role && ["student", "recruiter"].includes(role)) {
      filter.role = role;
    }

    if (q) {
      const term = new RegExp(escapeRegex(q), "i");
      filter.$or = [
        { name: term },
        { email: term },
        { "recruiterProfile.companyName": term },
        { "recruiterProfile.jobTitle": term },
        { headline: term }
      ];
    }

    const users = await User.find(filter)
      .select("name email role profilePhoto recruiterProfile.companyName recruiterProfile.jobTitle headline")
      .sort({ updatedAt: -1 })
      .limit(limit);

    return res.json({ success: true, data: users });
  } catch (error) {
    console.error("searchContacts error:", error);
    return res.status(500).json({ success: false, message: "Failed to search contacts" });
  }
};
