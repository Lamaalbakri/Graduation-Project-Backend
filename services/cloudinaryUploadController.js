// this sdk or function from cloudinary takes req.file.path from multer and sends image to cloudinary

const { uploadOnCloudinary } = require('../config/Cloudinary.js');
const fs = require('fs');

const uploadImageOnCloudinary = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    const localFilePath = req.file.path;
    const data = await uploadOnCloudinary(localFilePath);

    fs.unlinkSync(localFilePath);

    return res.status(200).json({ success: true, message: 'File uploaded to Cloudinary successfully', data });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Could not upload file', error: error.message });
  }
};

module.exports = { uploadImageOnCloudinary };