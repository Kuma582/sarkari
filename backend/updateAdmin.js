const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const User = require('./models/User');

async function updateAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB...');
        
        // Find if any admin exists
        let admin = await User.findOne({ role: 'Super Admin' });
        
        if (admin) {
            // Update existing admin
            admin.username = 'Anol';
            admin.password = 'sharma@2356';
            await admin.save();
            console.log('Successfully updated existing admin credentials.');
        } else {
            // Create new admin if not found
            await User.create({
                username: 'Anol',
                password: 'sharma@2356',
                role: 'Super Admin'
            });
            console.log('Successfully created new admin.');
        }
        
        console.log('New Username: Anol');
        console.log('New Password: sharma@2356');
        
        process.exit(0);
    } catch (error) {
        console.error('Error updating admin:', error);
        process.exit(1);
    }
}

updateAdmin();
