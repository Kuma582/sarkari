const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function fixLogin() {
    try {
        console.log('Connecting to Database...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected!');

        // Remove any existing 'admin' or 'Anol' to avoid confusion
        await User.deleteMany({ username: { $in: ['admin', 'Anol'] } });
        console.log('Cleared old admin users.');

        // Create fresh admin
        const admin = new User({
            username: 'admin',
            password: 'admin786',
            role: 'Super Admin'
        });

        await admin.save();
        console.log('-----------------------------------');
        console.log('✅ LOGIN FIXED SUCCESSFULLY!');
        console.log('ID: admin');
        console.log('Password: admin786');
        console.log('-----------------------------------');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error fixing login:', error);
        process.exit(1);
    }
}

fixLogin();
