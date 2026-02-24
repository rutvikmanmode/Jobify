const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authmiddleware");
const { photoUpload } = require("../middleware/uploadmiddleware");
const {
  createPost,
  getPosts,
  likePost,
  addComment,
  repost,
  deletePost
} = require("../controllers/postcontroller");

router.post("/", protect, photoUpload.single("image"), createPost);
router.get("/", protect, getPosts);
router.put("/:id/like", protect, likePost);
router.post("/:id/comments", protect, addComment);
router.post("/:id/repost", protect, repost);
router.delete("/:id", protect, deletePost);

module.exports = router;
