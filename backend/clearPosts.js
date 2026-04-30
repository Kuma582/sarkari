const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const Post = require('./models/Post');

async function clearPosts() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB...');
        
        const result = await Post.deleteMany({});
        console.log(`Successfully deleted ${result.deletedCount} posts.`);
        
        process.exit(0);
    } catch (error) {
        console.error('Error deleting posts:', error);
        process.exit(1);
    }
}

clearPosts();
