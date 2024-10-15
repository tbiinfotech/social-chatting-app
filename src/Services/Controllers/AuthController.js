"use strict";

const bcrypt = require("bcrypt");
const crypto = require('crypto')
const jwt = require("jsonwebtoken");
const User = require("../models/users");
const Otp = require("../models/otp");
const { signInSchema, emailSchema, passwordSchema } = require('../../libs/schemaValidation')
const { SendEmail } = require('../../libs/Helper')

module.exports.SignIn = async (req, res, next) => {

  try {
    let request_body = req.body;
    const { error } = signInSchema.validate(req.body)

    if (error) {
      return res.status(400).json({
        error: error.details[0].message,
      });
    }

    const user_detail = await User.findOne({
      email: req.body.email,
    });

    if (
      !user_detail ||
      !(await bcrypt.compare(request_body.password, user_detail.password))
    ) {
      return res.status(500).json({
        success: false,
        message: "Username or password is incorrect",
      });
    }

    var token = token = jwt.sign(
      { user_id: user_detail.id, role: "user" },
      process.env.jwt_token_key,
      { expiresIn: "8h" }
    );

    const userData = {
      id: user_detail._id,
      name: user_detail.name,
      email: user_detail.email,
      role: user_detail.role,
      age: user_detail.age,
      status: user_detail.status,
    };

    return res.json({
      user: userData,
      status: 200,
      token: token,
      success: true,
      message: "Log in successful",
    });
  } catch (error) {
    console.log("SignIn error -------", error);
    return res.send({
      status: 400,
      success: false,
      message: error.message,
    });
  }
};

module.exports.ForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const { error } = emailSchema.validate(req.body)
    if (error) {
      return res.status(400).json({
        error: error.details[0].message,
      });
    }
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString(); // Generate a 6-digit OTP
    const expires = Date.now() + 300000; // 5 minutes expiration

    // Store OTP in MongoDB
    await Otp.findOneAndUpdate(
      { email },
      { otp, expires },
      { upsert: true, new: true }
    );

    let mail_options = {
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is ${otp}. It is valid for 5 minutes.`,
      from: `${process.env.MAIL_USERNAME} <${process.env.MAIL_FROM_ADDRESS}>`,
    };

    await SendEmail(mail_options)
      .then((info) => {
        console.log("Nodemailer Email sent ---------- ", info.response);
      })
      .catch((error) => {
        console.log("Nodemailer error ---------- ", error);
      });

    return res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("Error in Forgot Password: ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.VerifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const otpData = await Otp.findOne({ email });
    if (!otpData) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Check if OTP is correct and not expired
    if (otpData.otp !== otp || Date.now() > otpData.expires) {
      await Otp.deleteOne({ email }); // Clear expired or incorrect OTP
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // If OTP is valid
    return res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error in Verify OTP: ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.ResetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const { error } = passwordSchema.validate({newPassword})

    if (error) {
      return res.status(400).json({
        error: error.details[0].message,
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash the new password
    const hashedPassword = bcrypt.hashSync(newPassword, bcrypt.genSaltSync(10), null);
    user.password = hashedPassword;
    await user.save();

    // Clear OTP data from the database
    await Otp.deleteOne({ email });

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error in Reset Password: ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};