let express = require("express");
const multer = require("multer");
const router = express.Router();

/*** Middleware ***/


const authorize = require("../Middleware/authorize");


/*** Application Controllers ***/
const AuthController = require("./Controllers/AuthController");
const UserController = require("./Controllers/UserController");

console.log("server is running");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("file##########", file);
    const uploadPath = "public/uploads/profiles";
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

/*** Auth Routers ***/
router.post("/api/sign-in", AuthController.SignIn);
router.post("/api/forget-password", AuthController.ForgotPassword);
router.post("/api/verify-otp", AuthController.VerifyOTP);
router.post("/api/reset-password", AuthController.ResetPassword);

/***  Admin ***/
router.post("/api/create-user", UserController.createUser);
router.get("/api/get-user", authorize(), UserController.getUser);
router.get("/api/users/:id", UserController.getUserById);
router.put(
  "/api/update-user/:id",
  authorize(),
  upload.none(),
  UserController.updateUser
);

router.put(
  "/api/user/profile/:id",
  upload.single('profilePicture'),
  UserController.updateProfile
);

router.delete(
  "/api/delete-user/:id",
  authorize(),
  upload.none(),
  UserController.deleteUser
);




module.exports = router;
