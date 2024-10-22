const TransporterModel = require("../models/transportersModel");
const bcrypt = require("bcryptjs");
// add lama
const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../services/authService');

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

  await newTransporter.save();
  
  // add lama
  // Create JWT token
  const token = jwt.sign({ id: newTransporter._id, userType: 'transporter' },
    getJwtSecret(), { expiresIn: process.env.JWT_EXPIRE_TIME });

  return { message: "Transporter registered successfully!", newTransporter, token };
};

module.exports = {
  registerTransporter,
};
