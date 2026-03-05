const express = require("express");
const router = express.Router();

const Post = require("../models/post");
const User = require("../models/user");
const authMiddleware = require("../middleware/authMiddleware");


// CREATE POST WITH DAILY LIMIT
router.post("/create", authMiddleware, async (req, res) => {
  try {

    const user = await User.findById(req.userId);
    const friendCount = user.friends.length;

    const today = new Date();
    today.setHours(0,0,0,0);

    const todayPosts = await Post.countDocuments({
      userId: req.userId,
      createdAt: { $gte: today }
    });

    let allowedPosts = 1;

    if (friendCount >= 2) {
      allowedPosts = 2;
    }

    if (friendCount >= 10) {
      allowedPosts = Infinity;
    }

    if (todayPosts >= allowedPosts) {
      return res.status(403).json({
        message: "Daily post limit reached"
      });
    }

    const newPost = new Post({
      userId: req.userId,
      content: req.body.content
    });

    await newPost.save();

    res.status(201).json({
      message: "Post created successfully",
      post: newPost
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// GET ALL POSTS
router.get("/", async (req, res) => {
  try {

    const posts = await Post.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.json(posts);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// LIKE / UNLIKE POST
router.put("/:id/like", authMiddleware, async (req, res) => {
  try {

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const userId = req.userId;

    if (post.likes.includes(userId)) {

      post.likes = post.likes.filter(
        (id) => id.toString() !== userId
      );

    } else {

      post.likes.push(userId);

    }

    await post.save();

    res.json({
      message: "Post like status updated",
      likes: post.likes.length
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// COMMENT ON POST
router.post("/:id/comment", authMiddleware, async (req, res) => {
  try {

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = {
      userId: req.userId,
      text: req.body.text
    };

    post.comments.push(comment);

    await post.save();

    res.json({
      message: "Comment added successfully",
      comments: post.comments
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// SHARE POST
router.post("/:id/share", authMiddleware, async (req, res) => {
  try {

    const originalPost = await Post.findById(req.params.id);

    if (!originalPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    const sharedPost = new Post({
      userId: req.userId,
      content: originalPost.content
    });

    await sharedPost.save();

    res.json({
      message: "Post shared successfully",
      post: sharedPost
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;