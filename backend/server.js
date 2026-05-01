const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// Middleware with increased limits for Base64 uploads (Ads images/videos)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Configure CORS for production
app.use(cors()); 

// Disable caching for API routes to ensure real-time updates
app.use((req, res, next) => {
  if (req.url.startsWith('/api')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  next();
});

// Root route for API testing
app.get('/api', (req, res) => {
  res.json({ message: 'Sarkari API is running!' });
});

app.use(helmet({
  crossOriginResourcePolicy: false, 
}));
app.set('trust proxy', 1); // Trust first proxy (Render)
app.use(morgan('dev'));

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Static folder for Admin Panel
app.use('/admin', express.static(path.join(__dirname, '..', 'admin')));

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/ads', require('./routes/adRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));
app.use('/api/visits', require('./routes/visitRoutes'));

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
