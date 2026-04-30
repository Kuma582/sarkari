const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
  // Date stored as YYYY-MM-DD string for easy grouping
  date: {
    type: String,
    required: true,
    index: true
  },
  // Unique IPs per day (stored as Set via Array)
  ips: [{
    type: String
  }],
  // Total page hits (including refreshes)
  hits: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Visit', visitSchema);
