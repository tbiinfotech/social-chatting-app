const Story = require('../models/story');
const User = require('../models/users');
const Notification = require('../models/notification')
const fs = require('fs')

// Create a new story
exports.createStory = async (req, res) => {
    try {
        const { mediaType, promotionExpiry, caption } = req.body;
        const newStory = new Story({
            author: req.user.id,
            mediaType,
            mediaUrl: req.file ? req.file.path : undefined,
            promotionExpiry,
            caption
        });

        const savedStory = await newStory.save();
        res.status(201).json({
            success: true,
            message: 'Story created successfully',
            story: savedStory,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all stories (explore feed)
exports.getAllStories = async (req, res) => {
    try {
        const stories = await Story.find().populate('author', 'username');
        res.status(200).json({
            success: true,
            stories,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get stories by a specific user
exports.getUserStories = async (req, res) => {
    const { id } = req.params
    try {
        const stories = await Story.find({ author: id }).populate('author', 'username');
        res.status(200).json({
            success: true,
            stories,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Like a story
exports.likeStory = async (req, res) => {
    try {
        const { userId } = req.body
        const story = await Story.findById(req.params.storyId);
        if (!story) {
            return res.status(404).json({ success: false, message: 'Story not found' });
        }

        // Check if the user has already liked the story
        if (story.likes.includes(userId)) {
            return res.status(400).json({ success: false, message: 'You already liked this story' });
        }

        const userInfo = await User.findById(userId)

        await Notification.create({
            type: 'like',
            recipient: story.author, // Post author receives the notification
            sender: userInfo._id,
            post: story._id,
            message: `${userInfo.name} liked your post.`,
        });
        story.likes.push(userId);
        await story.save();
        res.status(200).json({
            success: true,
            message: 'Story liked successfully',
            likes: story.likes.length,
        });
    } catch (error) {
        console.log('error', error)
        res.status(500).json({ success: false, message: error.message });
    }
};

// Unlike a story
exports.unlikeStory = async (req, res) => {
    try {
        const id = req.body.userId
        const story = await Story.findById(req.params.storyId);
        if (!story) {
            return res.status(404).json({ success: false, message: 'Story not found' });
        }

        // Check if the user has not liked the story
        if (!story.likes.includes(id)) {
            return res.status(400).json({ success: false, message: 'You have not liked this story yet' });
        }

        story.likes = story.likes.filter((userId) => userId.toString() !== id);
        await story.save();

        res.status(200).json({
            success: true,
            message: 'Story unliked successfully',
            likes: story.likes.length,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Promote a story (Admin or Premium feature)
exports.promoteStory = async (req, res) => {
    try {
        const story = await Story.findById(req.params.storyId);
        if (!story) {
            return res.status(404).json({ success: false, message: 'Story not found' });
        }

        // Admins or premium users can promote a story
        const isAdmin = req.user.role === 'admin';
        const isPremium = req.user.isPremium;

        if (!isAdmin && !isPremium) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to promote this story',
            });
        }

        story.promotionExpiry = req.body.promotionExpiry;
        await story.save();

        res.status(200).json({
            success: true,
            message: 'Story promoted successfully',
            promotionExpiry: story.promotionExpiry,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete a story (Author or Admin)
exports.deleteStory = async (req, res) => {
    try {
        const story = await Story.findById(req.params.storyId);
        if (!story) {
            return res.status(404).json({ success: false, message: 'Story not found' });
        }
        // Allow deletion if the user is the author or an admin
        if (story.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'You cannot delete this story' });
        }
        const storyPath = story.mediaUrl
            // Using findByIdAndDelete to remove the story
            await Story.findByIdAndDelete(req.params.storyId);

        fs.unlink(storyPath, (err) => {
            if (err) {
                console.error('Error deleting old profile picture:', err);
            } else {
                console.log('Old profile picture deleted:', storyPath);
            }
        })
        res.status(200).json({
            success: true,
            message: 'Story deleted successfully',
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
