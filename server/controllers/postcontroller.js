const mongoose = require("mongoose");
const Post = require("../models/post");

const populatePost = (query) => (
  query
    .populate("author", "name role profilePhoto")
    .populate("comments.author", "name role profilePhoto")
    .populate({
      path: "repostOf",
      populate: [
        { path: "author", select: "name role profilePhoto" },
        { path: "comments.author", select: "name role profilePhoto" }
      ]
    })
);

const withUserFlags = (post, userId) => {
  const obj = post.toObject ? post.toObject() : post;
  const hasLiked = (obj.likedBy || []).some((id) => String(id) === String(userId));
  return {
    ...obj,
    userHasLiked: hasLiked,
    commentsCount: Array.isArray(obj.comments) ? obj.comments.length : 0
  };
};

exports.createPost = async (req, res, next) => {
  try {
    const text = String(req.body?.text || "").trim();
    const imageUrlFromBody = String(req.body?.imageUrl || req.body?.image || "").trim();
    const imageUrlFromUpload = req.file ? `uploads/${req.file.filename}` : "";
    const imageUrl = imageUrlFromUpload || imageUrlFromBody;
    const repostOf = String(req.body?.repostOf || "").trim();

    if (!text && !repostOf) {
      return res.status(400).json({ success: false, message: "Post text is required" });
    }

    if (repostOf && !mongoose.Types.ObjectId.isValid(repostOf)) {
      return res.status(400).json({ success: false, message: "Invalid repost id" });
    }

    if (repostOf) {
      const original = await Post.findById(repostOf).select("_id");
      if (!original) {
        return res.status(404).json({ success: false, message: "Original post not found" });
      }
      await Post.findByIdAndUpdate(repostOf, { $inc: { repostCount: 1 } });
    }

    const post = await Post.create({
      text,
      imageUrl,
      repostOf: repostOf || null,
      author: req.user.id
    });

    const populatedPost = await populatePost(Post.findById(post._id));
    return res.status(201).json({ success: true, data: withUserFlags(populatedPost, req.user.id) });
  } catch (error) {
    return next(error);
  }
};

exports.getPosts = async (req, res, next) => {
  try {
    const posts = await populatePost(Post.find({}).sort({ createdAt: -1 }));
    const data = posts.map((post) => withUserFlags(post, req.user.id));
    return res.status(200).json({ success: true, count: data.length, data });
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

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const alreadyLiked = post.likedBy.some((uid) => String(uid) === String(req.user.id));
    if (alreadyLiked) {
      post.likes = Math.max(0, Number(post.likes || 0) - 1);
      post.likedBy = post.likedBy.filter((uid) => String(uid) !== String(req.user.id));
    } else {
      post.likes = Number(post.likes || 0) + 1;
      post.likedBy.push(req.user.id);
    }
    await post.save();

    const populated = await populatePost(Post.findById(post._id));
    return res.status(200).json({ success: true, data: withUserFlags(populated, req.user.id) });
  } catch (error) {
    return next(error);
  }
};

exports.addComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const text = String(req.body?.text || "").trim();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid post id" });
    }
    if (!text) {
      return res.status(400).json({ success: false, message: "Comment text is required" });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    post.comments.push({
      author: req.user.id,
      text
    });
    await post.save();

    const populated = await populatePost(Post.findById(post._id));
    return res.status(200).json({ success: true, data: withUserFlags(populated, req.user.id) });
  } catch (error) {
    return next(error);
  }
};

exports.repost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const text = String(req.body?.text || "").trim();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid post id" });
    }

    const original = await Post.findById(id);
    if (!original) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const repostPost = await Post.create({
      text: text || "",
      imageUrl: "",
      author: req.user.id,
      repostOf: original._id
    });

    original.repostCount = Number(original.repostCount || 0) + 1;
    await original.save();

    const populatedRepost = await populatePost(Post.findById(repostPost._id));
    const populatedOriginal = await populatePost(Post.findById(original._id));

    return res.status(201).json({
      success: true,
      data: withUserFlags(populatedRepost, req.user.id),
      originalPost: withUserFlags(populatedOriginal, req.user.id)
    });
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

    if (post.repostOf) {
      const original = await Post.findById(post.repostOf);
      if (original) {
        original.repostCount = Math.max(0, Number(original.repostCount || 0) - 1);
        await original.save();
      }
    }

    await Post.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    return next(error);
  }
};
