const RetailerModel = require("../models/retailersModel");
const bcrypt = require("bcryptjs");

const registerRetailer = async (data) => {
  const { full_name, email, phone_number, password, confirm_password, userType } = data;

  const existingRetailer = await RetailerModel.findOne({ email });
  if (existingRetailer) {
    throw new Error("This email is already registered.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newRetailer = new RetailerModel({
    full_name,
    email,
    phone_number,
    password: hashedPassword,
    confirm_password: hashedPassword,
    userType
  });

  await newRetailer.save();
  res.status(201).json({ message: "Retailer registered successfully!" });
};

module.exports = {
    registerRetailer,
};