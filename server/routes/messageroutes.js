const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../middleware/authmiddleware");
const { chatUpload } = require("../middleware/uploadmiddleware");
const {
  createOrGetConversation,
  listConversations,
  getMessages,
  sendMessage,
  scheduleInterview,
  markInterviewStatus,
  markConversationAsRead,
  uploadSharedFile,
  searchContacts
} = require("../controllers/messagescontroller");

router.use(protect, authorize("student", "recruiter"));

router.get("/contacts", searchContacts);
router.get("/conversations", listConversations);
router.post("/conversations", createOrGetConversation);
router.get("/conversations/:conversationId/messages", getMessages);
router.patch("/conversations/:conversationId/read", markConversationAsRead);
router.post("/conversations/:conversationId/messages", sendMessage);
router.post("/conversations/:conversationId/interviews", scheduleInterview);
router.patch("/interviews/:messageId/status", markInterviewStatus);
router.post("/upload", chatUpload.single("file"), uploadSharedFile);

module.exports = router;
