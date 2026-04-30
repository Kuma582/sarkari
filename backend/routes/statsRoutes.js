const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get dashboard stats
// @route   GET /api/stats
// @access  Private (Admin)
router.get('/', protect, authorize('Super Admin', 'Editor'), async (req, res) => {
  try {
    const totalPosts = await Post.countDocuments();
    const totalUsers = await User.countDocuments();
    
    // Count by category
    const categoryStats = await Post.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Recent posts
    const recentPosts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title category createdAt');

    res.json({
      success: true,
      data: {
        totalPosts,
        totalUsers,
        categoryStats,
        recentPosts
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
