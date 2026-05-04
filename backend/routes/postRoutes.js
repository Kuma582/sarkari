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
// router.post('/', protect, authorize('Super Admin', 'Editor'), upload.none(), async (req, res) => {
router.post('/', upload.none(), async (req, res) => {
    console.log('--- NEW POST DATA RECEIVED ---');
    console.log(req.body);
    const postData = { ...req.body };
    
    // Sanitize numeric fields
    ['totalVacancies', 'maleVacancies', 'femaleVacancies'].forEach(field => {
      if (postData[field] === "") postData[field] = 0;
    });

    // Handle empty scheduledAt
    if (!postData.scheduledAt || postData.scheduledAt === "") {
      postData.scheduledAt = new Date();
    }
    // Parse all JSON string fields (FormData sends everything as strings)
    const jsonFields = [
      'importantLinks', 'vacancyDetails', 'applicationFees', 'dynamicDates', 
      'eligibilityPoints', 'howToApplySteps', 'selectionProcessSteps', 
      'customSections', 'relatedKeywords'
    ];

    jsonFields.forEach(field => {
      if (typeof postData[field] === 'string') {
        try {
          postData[field] = JSON.parse(postData[field]);
        } catch (e) {
          console.error(`Error parsing ${field}:`, e);
          if (field === 'vacancyDetails') postData[field] = "[]";
        }
      }
    });

    const post = await Post.create(postData);
    res.status(201).json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update post
// @route   PUT /api/posts/:id
// router.put('/:id', protect, authorize('Super Admin', 'Editor'), upload.none(), async (req, res) => {
router.put('/:id', upload.none(), async (req, res) => {
  try {
    let post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    console.log('--- UPDATE POST DATA RECEIVED ---');
    console.log(req.body);
    const postData = { ...req.body };

    // Sanitize numeric fields
    ['totalVacancies', 'maleVacancies', 'femaleVacancies'].forEach(field => {
      if (postData[field] === "") postData[field] = 0;
    });

    // Handle empty scheduledAt
    if (!postData.scheduledAt || postData.scheduledAt === "") {
      if (postData.scheduledAt === "") delete postData.scheduledAt;
    }

    // Parse all JSON string fields (FormData sends everything as strings)
    const jsonFields = [
      'importantLinks', 'vacancyDetails', 'applicationFees', 'dynamicDates', 
      'eligibilityPoints', 'howToApplySteps', 'selectionProcessSteps', 
      'customSections', 'relatedKeywords'
    ];

    jsonFields.forEach(field => {
      if (typeof postData[field] === 'string') {
        try {
          postData[field] = JSON.parse(postData[field]);
        } catch (e) {
          console.error(`Error parsing ${field}:`, e);
          // For vacancyDetails specifically, we fallback to string "[]" if parsing fails 
          // because the schema expects a string for this legacy field
          if (field === 'vacancyDetails') postData[field] = "[]";
        }
      }
    });

    post = await Post.findByIdAndUpdate(req.params.id, postData, { new: true, runValidators: true });
    res.json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Delete post
// @route   DELETE /api/posts/:id
// router.delete('/:id', protect, authorize('Super Admin'), async (req, res) => {
router.delete('/:id', async (req, res) => {
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
