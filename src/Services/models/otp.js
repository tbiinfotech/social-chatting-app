const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  otp: { type: String, required: true },
  expires: { type: Date, required: true },
});

module.exports = mongoose.model('Otp', otpSchema);
