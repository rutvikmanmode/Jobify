const express = require("express");
const router = express.Router();

const { resumeUpload } = require("../middleware/uploadmiddleware");
const { protect } = require("../middleware/authmiddleware");

const {
  uploadResume,
  viewResumeInline,
  getResumeHistory,
  saveResumeBuilder,
  getResumeBuilder,
  getResumeScorePreview,
  getSkillSuggestions,
  addSkillTag,
  removeSkillTag,
  getResumeImprovementSuggestions
} = require("../controllers/resumecontroller");

router.get("/stream/:filename", viewResumeInline);

router.post(
  "/upload",
  protect,
  resumeUpload.single("resume"),
  uploadResume
);

router.get("/history", protect, getResumeHistory);
router.get("/builder", protect, getResumeBuilder);
router.post("/builder", protect, saveResumeBuilder);
router.get("/score-preview/:jobId", protect, getResumeScorePreview);
router.get("/skill-suggestions", protect, getSkillSuggestions);
router.post("/skills/add", protect, addSkillTag);
router.post("/skills/remove", protect, removeSkillTag);
router.get("/improvement-suggestions", protect, getResumeImprovementSuggestions);

module.exports = router;
