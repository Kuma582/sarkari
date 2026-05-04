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
  department: {
    type: String,
    trim: true
  },
  postDate: {
    type: Date,
    default: Date.now
  },
  applyStartDate: {
    type: Date
  },
  lastDate: {
    type: Date
  },
  applicationFees: [{
    categories: [String],
    amount: String
  }],
  eligibility: {
    type: String
  },
  admitCardDate: {
    type: String
  },
  examDate: {
    type: String
  },
  resultDate: {
    type: String
  },
  answerKeyDate: {
    type: String
  },
  examMode: {
    type: String // Written / Physical / Direct
  },
  paymentMode: {
    type: String
  },
  totalVacancies: {
    type: Number
  },
  maleVacancies: {
    type: Number
  },
  femaleVacancies: {
    type: Number
  },
  vacancyDetails: {
    type: String // JSON string to store department/male/female counts
  },
  subTitle: {
    type: String
  },
  batchName: {
    type: String
  },
  shortInfo: {
    type: String
  },
  physicalEligibility: {
    type: String
  },
  payScale: {
    type: String
  },
  selectionMode: {
    type: String
  },
  howToApply: {
    type: String
  },
  ageLimit: {
    type: String
  },
  importantLinks: [{
    label: String,
    url: String
  }],
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
  },
  minAge: {
    type: String
  },
  maxAge: {
    type: String
  },
  ageRelaxation: {
    type: String
  },
  officialWebsite: {
    type: String
  },
  selectionProcess: {
    type: String
  },
  dynamicDates: [{
    label: String,
    value: String
  }],
  eligibilityPoints: [String],
  howToApplySteps: [String],
  selectionProcessSteps: [String],
  customSections: [{
    title: String,
    contentType: {
      type: String,
      enum: ['Text', 'Bullets', 'Table']
    },
    content: mongoose.Schema.Types.Mixed
  }],
  vacancyTableTitle: {
    type: String
  },
  metaTitle: {
    type: String,
    maxLength: 60
  },
  metaDescription: {
    type: String,
    maxLength: 160
  },
  focusKeyword: {
    type: String
  },
  relatedKeywords: [String],
  slug: {
    type: String,
    unique: true,
    sparse: true
  }
}, { timestamps: true });

// Index for search
postSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Post', postSchema);
