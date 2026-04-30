const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB...');

    // Delete existing admin to start fresh
    await User.deleteOne({ username: 'admin' });
    console.log('Old admin deleted (if any).');

    const admin = new User({
      username: 'admin',
      password: 'admin123',
      role: 'Super Admin'
    });

    await admin.save();
    console.log('✅ Default Admin created successfully!');
    console.log('ID: admin');
    console.log('Password: admin123');
    process.exit();
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
