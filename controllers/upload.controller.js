const path = require('path');

const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    
    res.json({
      success: true,
      message: 'File uploaded successfully',
      url: fileUrl,
      filename: req.file.filename
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadImage
};
