const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Latest Jobs', 'Results', 'Admit Cards', 'Answer Keys', 'Syllabus', 'Admission', 'Other']
  },
  postDate: {
    type: Date,
    default: Date.now
  },
  lastDate: {
    type: Date
  },
  applicationFees: {
    type: String
  },
  eligibility: {
    type: String
  },
  totalVacancies: {
    type: Number
  },
  vacancyDetails: {
    type: String // JSON string to store department/male/female counts
  },
  ageLimit: {
    type: String
  },
  importantLinks: [{
    label: String,
    url: String
  }],
  pdfUrl: {
    type: String
  },
  imageUrl: {
    type: String
  },
  status: {
    type: String,
    enum: ['New', 'Old'],
    default: 'New'
  },
  isEnabled: {
    type: Boolean,
    default: true
  },
  scheduledAt: {
    type: Date,
    default: Date.now
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  authorName: {
    type: String
  }
}, { timestamps: true });

// Index for search
postSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Post', postSchema);
