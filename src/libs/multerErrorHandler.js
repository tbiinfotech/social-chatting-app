const multer = require("multer");

// Error handler for multer
const multerErrorHandler = (req, res, next) => {
  return (err) => {
    if (err instanceof multer.MulterError) {
      // Handle Multer-specific errors (e.g., file size limit exceeded)
      return res.status(400).json({ success: false, message: err.message });
    } else if (err) {
      // Handle any other errors (e.g., invalid file type)
      return res.status(400).json({ success: false, message: err.message });
    }
    // If no error, proceed to the next middleware/controller
    next();
  };
};

module.exports = multerErrorHandler;
