// this cloudinary function is used by cloudinaryUploadController in services.
// this function is contains all key so that cloudinary gives access to the user

const fs = require("fs");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    const data = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    return data;
  } catch (error) {
    fs.unlinkSync(localFilePath);
  }
};

module.exports = { uploadOnCloudinary };