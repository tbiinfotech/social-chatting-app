const express = require("express");
const router = express.Router();
const upload = require("../libs/uploadConfig"); // Import the multer configuration
const uploadStory = require("../libs/uploadStoryConfig");
const multerErrorHandler = require("../libs/multerErrorHandler"); // Import the multer error handler

/*** Middleware ***/
const authorize = require("../Middleware/authorize");

/*** Application Controllers ***/
const AuthController = require("./Controllers/AuthController");
const UserController = require("./Controllers/UserController");
const StoryController = require("./Controllers/StoryController")
const NotificationController = require("./Controllers/NotificationController")

/*** Auth Routers ***/
router.post("/api/sign-in", AuthController.SignIn);
router.post("/api/forget-password", AuthController.ForgotPassword);
router.post("/api/verify-otp", AuthController.VerifyOTP);
router.post("/api/reset-password", AuthController.ResetPassword);

/*** Admin ***/
router.post("/api/create-user", UserController.createUser);
router.get("/api/get-user", authorize(), UserController.getUser);
router.get("/api/users/:id", UserController.getUserById);



router.put(
  "/api/update-user/:id",
  authorize(),
  upload.none(),
  UserController.updateUser
);
router.delete(
  "/api/delete-user/:id",
  authorize(),
  upload.none(),
  UserController.deleteUser
);

/*** profile update ***/

router.get("/api/search-user", UserController.searchUser);
router.get("/api/user-profile/:id", UserController.getUserProfileById);
router.post("/api/profile/change-lang",authorize(), UserController.changeLanguage);
router.post("/api/profile/change-username",authorize(), UserController.changeUsername);

router.put(
  "/api/user/profile/:id",
  (req, res, next) => {
    upload.single('profilePicture')(req, res, multerErrorHandler(req, res, next));
  },
  UserController.updateProfile
);

/*** Story ***/

router.post('/api/story', authorize(), (req, res, next) => {
  uploadStory.single('mediaUrl')(req, res, multerErrorHandler(req, res, next));
}, StoryController.createStory);

// Get all stories (explore feed)
router.get('/api/story', StoryController.getAllStories);

// Get stories by a specific user
router.get('/api/story/user/:id', StoryController.getUserStories);

// Like a story (requires user authentication)
router.post('/api/story/:storyId/like', StoryController.likeStory);

// Unlike a story (requires user authentication)
router.post('/api/story/:storyId/unlike', StoryController.unlikeStory);

// Promote a story (requires user authentication and permission)
router.post('/:storyId/promote', StoryController.promoteStory);

// Delete a story (requires user authentication and permission)
router.delete('/api/story/:storyId', authorize(), StoryController.deleteStory);

/*** Notificatio controller ***/

try {
  router.post('/api/notification', authorize(), NotificationController.markAsRead)
  router.get('/api/notification',
    authorize(),
    NotificationController.getNotifications)

} catch (error) {
  console.log('error', error)
}

module.exports = router;
