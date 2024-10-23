const TransporterModel = require("../models/transportersModel");
const bcrypt = require("bcryptjs");
// add lama
const jwt = require('jsonwebtoken');
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
  //lamya
  try {
    // Attempt to save the new transporter
    await newTransporter.save();

    // add lama
    // Create JWT token
    const token = createToken(newTransporter._id, 'transporter');
    // const token = jwt.sign({ id: newTransporter._id, userType: 'transporter' },
    //   getJwtSecret(), { expiresIn: process.env.JWT_EXPIRE_TIME });

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

module.exports = {
  registerTransporter,
};
