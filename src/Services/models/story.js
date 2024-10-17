const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    mediaType: {
        type: String, // e.g., 'image', 'video'
        required: true,
    },
    caption: {
        type: String,
    },
    mediaUrl: {
        type: String,
        required: true,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    expiryDate: {
        type: Date,
        default: Date.now,
        expires: '24h', // Automatically deletes after 24 hours
    },
    promotionExpiry: Date, // If the story is promoted
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Story', storySchema);