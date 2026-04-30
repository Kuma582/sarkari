const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// --- PUBLIC ROUTES ---

// @desc    Get all posts with pagination, search, and category filtering
// @route   GET /api/posts
router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const { search, category } = req.query;
  // Use a 1-minute buffer to ensure posts show up immediately even if there's minor clock skew
  const now = new Date(Date.now() + 60000); 
  let query = { isEnabled: true, scheduledAt: { $lte: now } };

  if (search) {
    query.$text = { $search: search };
  }

  if (category) {
    query.category = category;
  }

  try {
    const posts = await Post.find(query)
      .sort({ postDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments(query);

    res.json({
      success: true,
      count: posts.length,
      total,
      pages: Math.ceil(total / limit),
      data: posts
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get single post
// @route   GET /api/posts/:id
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- ADMIN ROUTES ---

// @desc    Create new post
// @route   POST /api/posts
router.post('/', protect, authorize('Super Admin', 'Editor'), upload.none(), async (req, res) => {
  try {
    const postData = { ...req.body };
    
    // Handle empty scheduledAt
    if (!postData.scheduledAt || postData.scheduledAt === "") {
      postData.scheduledAt = new Date();
    }
    // Parse importantLinks if it's a string (from FormData)
    if (typeof postData.importantLinks === 'string') {
      postData.importantLinks = JSON.parse(postData.importantLinks);
    }

    postData.author = req.user._id;
    postData.authorName = req.user.username;

    const post = await Post.create(postData);
    res.status(201).json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update post
// @route   PUT /api/posts/:id
router.put('/:id', protect, authorize('Super Admin', 'Editor'), upload.none(), async (req, res) => {
  try {
    let post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const postData = { ...req.body };

    // Handle empty scheduledAt
    if (!postData.scheduledAt || postData.scheduledAt === "") {
      // For updates, we only reset to 'now' if it was explicitly cleared
      // If it's undefined, Mongoose won't change the existing value
      if (postData.scheduledAt === "") delete postData.scheduledAt;
    }

    if (typeof postData.importantLinks === 'string') {
      postData.importantLinks = JSON.parse(postData.importantLinks);
    }

    post = await Post.findByIdAndUpdate(req.params.id, postData, { new: true, runValidators: true });
    res.json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Delete post
// @route   DELETE /api/posts/:id
router.delete('/:id', protect, authorize('Super Admin'), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    await post.deleteOne();
    res.json({ success: true, message: 'Post removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
