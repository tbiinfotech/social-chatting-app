const Notification = require('../models/notification');
const Story = require('../models/story');




exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user.id })
        res.json(notifications);
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
};

exports.markAsRead = async (req, res) => {
    console.log('req.user.id', req.user.id)
    try {
        await Notification.updateMany(
            { recipient: req.user.id, isRead: false },
            { $set: { isRead: true } }
        );
        res.json({ success: true, message: "mark as read" });
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }

};

