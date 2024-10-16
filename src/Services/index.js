const express = require("express");
const router = express.Router();
const upload = require("../libs/uploadConfig"); // Import the multer configuration
const multerErrorHandler = require("../libs/multerErrorHandler"); // Import the multer error handler

/*** Middleware ***/
const authorize = require("../Middleware/authorize");

/*** Application Controllers ***/
const AuthController = require("./Controllers/AuthController");
const UserController = require("./Controllers/UserController");

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

router.put(
  "/api/user/profile/:id",
  (req, res, next) => {
    upload.single('profilePicture')(req, res, multerErrorHandler(req, res, next)); 
  },
  UserController.updateProfile 
);



module.exports = router;
