const mongoose = require('mongoose');

const adSchema = new mongoose.Schema({
  location: {
    type: String,
    required: true,
    enum: ['header', 'sidebar', 'between_posts', 'footer'],
    unique: true
  },
  code: {
    type: String,
    required: true
  },
  isEnabled: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Ad', adSchema);
