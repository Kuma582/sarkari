const mongoose = require('mongoose');

const adSchema = new mongoose.Schema({
  location: {
    type: String,
    required: true,
    enum: ['header', 'sidebar', 'between_posts', 'footer', 'modal', 'popup'],
    unique: true
  },
  code: {
    type: String,
    default: ''
  },
  isEnabled: {
    type: Boolean,
    default: true
  },
  popupDuration: {
    type: Number,
    default: 20  // seconds
  }
}, { timestamps: true });

module.exports = mongoose.model('Ad', adSchema);
