const mongoose = require("mongoose");
const Post = require("../models/post");

exports.createPost = async (req, res, next) => {
  try {
    const text = String(req.body?.text || "").trim();
    const imageUrl = String(req.body?.imageUrl || req.body?.image || "").trim();

    if (!text) {
      return res.status(400).json({ success: false, message: "Post text is required" });
    }

    const post = await Post.create({
      text,
      imageUrl,
      author: req.user.id
    });

    const populatedPost = await Post.findById(post._id).populate("author", "name role");
    return res.status(201).json({ success: true, data: populatedPost });
  } catch (error) {
    return next(error);
  }
};

exports.getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({})
      .populate("author", "name role")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: posts.length, data: posts });
  } catch (error) {
    return next(error);
  }
};

exports.likePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid post id" });
    }

    const post = await Post.findByIdAndUpdate(
      id,
      { $inc: { likes: 1 } },
      { new: true }
    ).populate("author", "name role");

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    return res.status(200).json({ success: true, data: post });
  } catch (error) {
    return next(error);
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid post id" });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const isOwner = post.author?.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this post" });
    }

    await Post.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    return next(error);
  }
};
