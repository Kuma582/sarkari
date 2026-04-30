const express = require('express');
const router = express.Router();
const Visit = require('../models/Visit');
const { protect, authorize } = require('../middleware/auth');

// Helper: get today's date string
function todayStr() {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

// Helper: get date N days ago
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

// @desc   Record a visit (called from frontend on page load)
// @route  POST /api/visits/ping
// @access Public
router.post('/ping', async (req, res) => {
  try {
    const today = todayStr();
    // Get visitor IP
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || 
                req.socket?.remoteAddress || 'unknown';

    let visit = await Visit.findOne({ date: today });

    if (!visit) {
      visit = new Visit({ date: today, hits: 0, ips: [] });
    }

    visit.hits += 1;

    // Add IP only if not already counted today (unique visitors)
    if (!visit.ips.includes(ip)) {
      visit.ips.push(ip);
    }

    await visit.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @desc   Get visit statistics
// @route  GET /api/visits/stats
// @access Private (Admin)
router.get('/stats', protect, authorize('Super Admin', 'Editor'), async (req, res) => {
  try {
    const today = todayStr();
    const yesterday = daysAgo(1);
    const weekStart = daysAgo(6);   // last 7 days
    const monthStart = daysAgo(29); // last 30 days

    // Fetch all relevant documents
    const records = await Visit.find({ date: { $gte: monthStart } }).sort({ date: 1 });

    // Today
    const todayRec  = records.find(r => r.date === today)  || { hits: 0, ips: [] };
    const yesterRec = records.find(r => r.date === yesterday) || { hits: 0, ips: [] };

    // Weekly (last 7 days)
    const weekRecords = records.filter(r => r.date >= weekStart);
    const weeklyHits    = weekRecords.reduce((a, r) => a + r.hits, 0);
    const weeklyUnique  = new Set(weekRecords.flatMap(r => r.ips)).size;

    // Monthly (last 30 days)
    const monthlyHits   = records.reduce((a, r) => a + r.hits, 0);
    const monthlyUnique = new Set(records.flatMap(r => r.ips)).size;

    // Daily chart data (last 7 days)
    const dailyChart = [];
    for (let i = 6; i >= 0; i--) {
      const dateStr = daysAgo(i);
      const rec = records.find(r => r.date === dateStr) || { hits: 0, ips: [] };
      dailyChart.push({
        date: dateStr,
        hits: rec.hits,
        unique: rec.ips.length
      });
    }

    res.json({
      success: true,
      data: {
        today: {
          hits: todayRec.hits,
          unique: todayRec.ips.length
        },
        yesterday: {
          hits: yesterRec.hits,
          unique: yesterRec.ips.length
        },
        weekly: {
          hits: weeklyHits,
          unique: weeklyUnique
        },
        monthly: {
          hits: monthlyHits,
          unique: monthlyUnique
        },
        dailyChart
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
