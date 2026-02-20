const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authmiddleware");
const { photoUpload } = require("../middleware/uploadmiddleware");

const {
  getMyProfile,
  updateProfile,
  uploadPhoto,
  getRecruiterPublicProfile
} = require("../controllers/profilecontroller");

// Get Profile
router.get("/me", protect, getMyProfile);

// Update Profile
router.put("/me", protect, updateProfile);

// Upload Profile Photo
router.post(
  "/photo",
  protect,
  photoUpload.single("photo"),
  uploadPhoto
);

// Public recruiter profile (visible to logged-in users)
router.get("/recruiter/:id", protect, getRecruiterPublicProfile);

module.exports = router;
