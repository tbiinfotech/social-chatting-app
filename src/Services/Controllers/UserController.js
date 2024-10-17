const bcrypt = require("bcrypt");
const User = require("../models/users");
const Profile = require("../models/profile");
const Joi = require('joi');
const jwt = require("jsonwebtoken");
const fs = require('fs');
const path = require('path');
const { userSchema, updateUserSchema, updateProfileSchema } = require('../../libs/schemaValidation')
const errorHandling = require('../../libs/errorHandling')
const mongoose = require("mongoose");

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



module.exports.getUserProfileById = async (req, res) => {
  try {
    // Extract userId from request parameters
    const { id } = req.params;

    // Ensure that the id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid user ID",
        success: false,
      });
    }

    // Find user by userId
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // Perform aggregation on Profile collection
    const results = await Profile.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(id), // Match Profile's userId with the provided userId
        },
      },
      {
        // Lookup users from User collection
        $lookup: {
          from: "users", // MongoDB uses the lowercase collection name
          localField: "userId", // Field from Profile
          foreignField: "_id", // Field from User
          as: "userInfo", // Name of the joined output field
        },
      },
      {
        // Unwind the userInfo array to deconstruct it
        $unwind: "$userInfo",
      },
      {
        // Project the desired fields
        $project: {
          userId: 1,
          username: 1,
          bio: 1,
          profilePicture: 1,
          contactNumber: 1,
          hashTags: 1,
          country: 1,
          name: "$userInfo.name",
          email: "$userInfo.email",
          gender: "$userInfo.gender",
          age: "$userInfo.age",
          role: "$userInfo.role",
          status: "$userInfo.status",
        },
      },
    ]);

    if (!results.length) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "No profile found for the given user",
      });
    }

    // If profile found, return the result
    return res.json({
      status: 200,
      success: true,
      message: "User profile found",
      data: results[0], // Return the first profile match
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
    const { bio, contactNumber, username, country } = req.body;

    // Process hashTags if they are sent
    const hashTags = req.body.hashTags instanceof Array ? req.body.hashTags : [];

    // Validate the incoming data
    const { error } = updateProfileSchema.validate({ bio, contactNumber, hashTags });

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
      username: username || undefined,
      country: country || undefined,
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
        country: updatedProfile.country
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

module.exports.searchUser = async (req, res) => {
  try {
    const { query } = req.query; // Search query (name, username, hashtag)
    const { age, gender, country } = req.body; // Filters
    console.log('query:', query);

    // Initialize the match conditions for the aggregation pipeline
    const matchConditions = { $and: [] }; // Using $and to combine query and filter conditions

    // Case 4: Query not provided, filter not provided
    if (!query && !age && !gender && !country) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "Please provide a search query or at least one filter (age, gender, country).",
      });
    }

    // Case 1 & 2: If query is provided, search in username, hashtags, or name
    if (query) {
      matchConditions.$and.push({
        $or: [
          { username: { $regex: query, $options: "i" } }, // Match Profile's username
          { hashTags: { $regex: query, $options: "i" } }, // Match Profile's hashtags
          { "userInfo.name": { $regex: query, $options: "i" } }, // Match User's name
        ],
      });
    }

    // Case 1 & 3: Apply filters if provided
    const optionalFilters = [];
    if (country) {
      optionalFilters.push({ country: { $regex: country, $options: "i" } });
    }
    if (age) {
      optionalFilters.push({ "userInfo.age": age }); // Assuming age is a string or a number
    }
    if (gender) {
      optionalFilters.push({ "userInfo.gender": gender });
    }

    // Add filters to matchConditions if any filters are provided
    if (optionalFilters.length > 0) {
      matchConditions.$and.push(...optionalFilters);
    }

    // Perform aggregation with $lookup to join User and Profile collections
    const results = await Profile.aggregate([
      {
        // Lookup to join User collection
        $lookup: {
          from: "users", // MongoDB uses the lowercase collection name
          localField: "userId", // Field from Profile
          foreignField: "_id", // Field from User
          as: "userInfo", // Name of the joined output field
        },
      },
      {
        // Unwind the userInfo array to deconstruct it
        $unwind: "$userInfo",
      },
      {
        // Apply match conditions if any
        $match: matchConditions.$and.length > 0 ? matchConditions : {}, // Only match if there are conditions
      },
      {
        // Project the desired fields
        $project: {
          userId: 1,
          username: 1,
          bio: 1,
          profilePicture: 1,
          contactNumber: 1,
          hashTags: 1,
          name: "$userInfo.name",
          email: "$userInfo.email",
          gender: "$userInfo.gender",
          age: "$userInfo.age"
        },
      },
    ]);

    // Check if results were found
    if (!results.length) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "No users found matching your query or filters.",
      });
    }

    // Return the search results
    return res.json({
      status: 200,
      success: true,
      message: "Users found.",
      data: results,
    });
  } catch (error) {
    console.error("Error while searching for users:", error);
    return res.status(500).json({
      status: 500,
      success: false,
      message: "An error occurred while searching for users.",
    });
  }
};

module.exports.changeLanguage = async (req, res, next) => {
  console.log('changeLanguage#',req.user.id);
  try {
    const userId = req.user.id// Extract the user ID from the parameters
    const { language } = req.body;

    // Find the existing profile to check for the old profile picture
    const profile = await Profile.findOne({ userId });

    profile.language = language
    await profile.save()

    return res.json({
      profile,
      status: 200,
      success: true,
      message: "Language updated successfully.",
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

module.exports.changeUsername = async (req, res, next) => {
  console.log('changeUsername#',req.user.id);
  try {
    const userId = req.user.id// Extract the user ID from the parameters
    const { username } = req.body;

    // Find the existing profile to check for the old profile picture
    const profile = await Profile.findOne({ userId });

    profile.username = username
    await profile.save()

    return res.json({
      profile,
      status: 200,
      success: true,
      message: "username updated successfully.",
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




