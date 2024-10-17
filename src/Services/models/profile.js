const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: {
    type: String,
    default: '',
    unique: true,
    index: true,
  },
  bio: { type: String, default: '' },
  country: { type: String, default: '' },
  profilePicture: { type: String, default: '' },
  contactNumber: { type: String, default: '' },
  hashTags: { type: [String], default: [] },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  language: { type: String, default: 'English' }
}, { timestamps: true });

module.exports = mongoose.model("Profile", profileSchema);
