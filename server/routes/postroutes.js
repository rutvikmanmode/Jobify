const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authmiddleware");
const {
  createPost,
  getPosts,
  likePost,
  deletePost
} = require("../controllers/postcontroller");

router.post("/", protect, createPost);
router.get("/", protect, getPosts);
router.put("/:id/like", protect, likePost);
router.delete("/:id", protect, deletePost);

module.exports = router;
