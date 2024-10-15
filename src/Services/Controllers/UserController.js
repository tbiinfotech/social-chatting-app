const bcrypt = require("bcrypt");
const User = require("../models/users");
const Profile = require("../models/profile");
const Joi = require('joi');
const jwt = require("jsonwebtoken");
const fs = require('fs');
const path = require('path');
const { userSchema, updateUserSchema, updateProfileSchema } = require('../../libs/schemaValidation')

module.exports.getUser = async (req, res, next) => {
  try {
    const users = await User.find();
    return res.json({
      status: 200,
      response: users,
      success: true,
      message: "Data found",
    });
  } catch (error) {
    console.log("Error while trying to get data-------", error);
    return res.json({
      status: 400,
      success: false,
      message: error.message,
    });
  }
};
module.exports.getUserById = async (req, res) => {
  try {

    // Extract userId from request parameters
    const { id } = req.params;

    // Find user by userId
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // If user found, return user data
    return res.json({
      status: 200,
      response: user,
      success: true,
      message: "User found",
    });
  } catch (error) {
    console.log("Error while trying to get user by ID:", error);
    return res.status(500).json({
      status: 500,
      success: false,
      message: "Internal Server Error",
    });
  }
};
module.exports.createUser = async (req, res, next) => {
  console.log('createUser')
  try {
    console.log('createUser', req.body)
    let { name, email, password, age, gender, role } = req.body;
    // Updated validation logic
    const { error, value } = userSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        error: error.details[0].message,
      });
    }

    const user = await User.find({ email: email });

    if (!user) {
      return res.send({
        status: 400,
        success: false,
        message: "Email already exists. Please try a different email.",
      });
    }

    //////////////////////////// Bcrypt User password
    if (password) {
      password = bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
    }
    //////////////////////////// Create User
    const newUser = await User.create({
      name, email, password, age, gender, role
    });

    token = jwt.sign(
      { user_id: newUser._id, role: "user" },
      process.env.jwt_token_key,
      { expiresIn: "8h" }
    );

    const userData = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      age: newUser.age,
      gender: newUser.gender,
      status: newUser.status,
      role: newUser.newUser
    };
    return res.json({
      user: userData,
      status: 200,
      token: token,
      success: true,
      message: "Log in successful",
    });
  } catch (error) {
    console.log("Error while trying to get data-------", error);

    let message = "An error occurred while processing your request.";

    if (error.name === 'MongoServerError' && error.code === 11000) {
      // Duplicate key error
      message = "The email address is already in use.";
    } else {
      // Handle other types of errors or general error message
      message = error.message || message;
    }

    return res.json({
      status: 400,
      success: false,
      message: message,
    });

  }
};

module.exports.updateUser = async (req, res, next) => {
  try {
    let { name, password, age, gender, role } = req.body;
    const { id } = req.params;
    const { error, value } = updateUserSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        error: error.details[0].message,
      });
    }

    const user = await User.findById(id);

    if (user) {
      await User.findByIdAndUpdate(id, {
        name, age, gender, role
      });

      return res.json({
        status: 200,
        success: true,
        message: "Profile updated",
      });
    } else {
      return res.send({
        status: 400,
        success: false,
        message: "User not exist!",
      });
    }
  } catch (error) {
    console.log(error.message);
    return res.json({
      status: 400,
      success: false,
      message: error.message,
    });
  }
};

module.exports.deleteUser = async (req, res, next) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);

    // return res.send(user);
    if (user) {
      await User.findByIdAndDelete(id);
      return res.json({
        status: 200,
        success: true,
        message: "User deleted",
      });
    } else {
      return res.send({
        status: 400,
        success: false,
        message: "User not exist!",
      });
    }
  } catch (error) {
    console.log("Error while trying to get data-------", error);
    return res.json({
      status: 400,
      success: false,
      message: error.message,
    });
  }
};

module.exports.updateProfile = async (req, res, next) => {
  console.log('updateProfile#');
  try {
    const userId = req.params.id; // Extract the user ID from the parameters
    const { bio, contactNumber } = req.body;

    // Process hashTags if they are sent
    const hashTags = req.body.hashTags instanceof Array ? req.body.hashTags : [];

    // Validate the incoming data
    const { error } = updateProfileSchema.validate({ bio, contactNumber,hashTags});

    if (error) {
      return res.status(400).json({
        error: error.details[0].message,
      });
    }

    // Find the existing profile to check for the old profile picture
    const profile = await Profile.findOne({ userId });

    // Prepare the update object
    const updateData = {
      bio: bio || undefined,
      contactNumber: contactNumber || undefined,
      profilePicture: req.file ? req.file.path : undefined, // Uploaded file path
      hashTags: hashTags.length ? hashTags : undefined,
    };

    // If a new profile picture is uploaded, delete the old one
    if (req.file && profile && profile.profilePicture) {
      const oldFilePath = profile.profilePicture;

      console.log('oldFilePath', oldFilePath);
      // Delete the old file if it exists
      fs.unlink(oldFilePath, (err) => {
        if (err) {
          console.error('Error deleting old profile picture:', err);
        } else {
          console.log('Old profile picture deleted:', oldFilePath);
        }
      });
    }

    // Use findOneAndUpdate to update the profile or create a new one if it doesn't exist
    const updatedProfile = await Profile.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true, upsert: true, runValidators: true }
    );

    return res.json({
      profile: {
        userId: updatedProfile.userId,
        bio: updatedProfile.bio,
        profilePicture: updatedProfile.profilePicture,
        contactNumber: updatedProfile.contactNumber,
        hashTags: updatedProfile.hashTags,
      },
      status: 200,
      success: true,
      message: "Profile updated successfully.",
    });
  } catch (error) {
    console.log("Error while updating user profile-------", error);
    return res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while processing your request.",
    });
  }
};


