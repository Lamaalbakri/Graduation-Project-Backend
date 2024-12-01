const TransporterModel = require("../models/transportersModel");
const asyncHandler = require('express-async-handler')
const bcrypt = require("bcryptjs");
const { createToken } = require('../services/authService');

const registerTransporter = async (data) => {
  const { full_name, email, phone_number, password, userType } = data;

  const existingTransporter = await TransporterModel.findOne({ email });
  if (existingTransporter) {
    throw new Error("This email is already registered.");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new transporter
  const newTransporter = new TransporterModel({
    full_name,
    email,
    phone_number,
    password: hashedPassword,
    userType
  });

  try {
    // Attempt to save the new transporter
    await newTransporter.save();

    // Create JWT token
    const token = createToken(newTransporter._id, 'transporter');

    // Check if token creation was successful
    if (!token) {
      throw new Error("Failed to create token. Registration aborted.");
    }

    return { message: "Transporter registered successfully!", newTransporter, token };
  } catch (error) {
    // If there's an error, delete the transporter from the database
    await TransporterModel.deleteOne({ _id: newTransporter._id });
    throw new Error(`Registration failed: ${error.message}`);
  }
};

// get the names of transportation companies
const getTransporters = asyncHandler(async (req, res) => {
  try {
    const transporters = await TransporterModel.find({});

    if (!transporters.length) {
      return res.status(404).json({ message: "No transporters found" });
    }

    res.status(200).json({ data: transporters });
  } catch (error) {
    res.status(500).json({ message: "Server error fetching transporters." });
  }
});

module.exports = {
  registerTransporter,
  getTransporters,
};
