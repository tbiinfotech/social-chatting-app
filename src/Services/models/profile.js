const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bio: { type: String, default: '' },
    profilePicture: { type: String, default: '' },
    contactNumber: { type: String, default: '' },
    hashTags: { type: [String], default: [] },
    // Add more fields as necessary
}, { timestamps: true });

module.exports = mongoose.model("Profile", profileSchema);
