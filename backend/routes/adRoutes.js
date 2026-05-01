const express = require('express');
const router = express.Router();
const Ad = require('../models/Ad');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get all ads (public - only enabled)
// @route   GET /api/ads
router.get('/', async (req, res) => {
  try {
    const ads = await Ad.find();
    res.json({ success: true, data: ads });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Create or Update ad
// @route   POST /api/ads
router.post('/', protect, authorize('Super Admin'), async (req, res) => {
  const { location, code, isEnabled, popupDuration } = req.body;

  try {
    let ad = await Ad.findOne({ location });

    if (ad) {
      ad.code = code;
      ad.isEnabled = isEnabled !== undefined ? isEnabled : ad.isEnabled;
      if (popupDuration !== undefined) ad.popupDuration = popupDuration;
      await ad.save();
    } else {
      ad = await Ad.create({ location, code, isEnabled, popupDuration });
    }

    res.json({ success: true, data: ad });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Configure Multer for File Uploads
const storage = multer.diskStorage({
  destination(req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    cb(null, `ad-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif|webp|mp4|webm/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Images and Videos only!'));
  }
});

// @desc    Upload Ad Media
// @route   POST /api/ads/upload
router.post('/upload', protect, authorize('Super Admin'), upload.single('media'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  
  try {
    // Read the file and convert to Base64
    const filePath = req.file.path;
    const fileData = fs.readFileSync(filePath);
    const base64Data = fileData.toString('base64');
    const mimeType = req.file.mimetype;
    const dataUri = `data:${mimeType};base64,${base64Data}`;

    // Delete the temporary file from disk
    fs.unlinkSync(filePath);

    // Return the Data URI instead of a relative URL
    res.json({ success: true, url: dataUri });
  } catch (error) {
    console.error('Upload conversion error:', error);
    res.status(500).json({ success: false, message: 'Error processing upload' });
  }
});

module.exports = router;
