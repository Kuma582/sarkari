const express = require('express');
const router = express.Router();
const Ad = require('../models/Ad');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get all ads
// @route   GET /api/ads
router.get('/', async (req, res) => {
  try {
    const ads = await Ad.find({ isEnabled: true });
    res.json({ success: true, data: ads });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Create or Update ad
// @route   POST /api/ads
router.post('/', protect, authorize('Super Admin'), async (req, res) => {
  const { location, code, isEnabled } = req.body;

  try {
    let ad = await Ad.findOne({ location });

    if (ad) {
      ad.code = code;
      ad.isEnabled = isEnabled !== undefined ? isEnabled : ad.isEnabled;
      await ad.save();
    } else {
      ad = await Ad.create({ location, code, isEnabled });
    }

    res.json({ success: true, data: ad });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
