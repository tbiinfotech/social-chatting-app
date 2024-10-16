const multer = require("multer");
const path = require("path");

// Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'public/uploads/profiles';
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
    cb(null, uniqueName);
  }
});

// File type validation function
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/; // Allowed image types
  const mimeType = allowedTypes.test(file.mimetype); // Validate MIME type
  const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase()); // Validate file extension

  if (mimeType && extName) {
    cb(null, true); // Accept the file
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.'), false); // Reject the file
  }
};

// Maximum file size: 5MB
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

module.exports = upload;
