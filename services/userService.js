const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Supplier = require('../models/suppliersModel');
const Transporter = require('../models/transportersModel');
const Manufacturer = require('../models/manufacturersModel');
const Distributor = require('../models/distributorsModel');
const Retailer = require('../models/retailersModel');
const { getJwtSecret } = require('../services/authService');

// Helper function to get the appropriate model based on user type
function getModelByUserType(userType) {
  switch (userType) {
    case 'supplier':
      return Supplier;
    case 'transporter':
      return Transporter;
    case 'manufacturer':
      return Manufacturer;
    case 'distributor':
      return Distributor;
    case 'retailer':
      return Retailer;
    default:
      throw new Error('Invalid user type');
  }
}

// Login method
async function login(req, res) {
  const { email, password, userType } = req.body;
  console.log(`${userType} login successfully`);

  try {
    const UserModel = getModelByUserType(userType);

    // Find the user in the database
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'No user found with this email and user type.' });
    }

    // When checking the password during login
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Incorrect password.' });
    }

    // Create a JWT token
    const token = jwt.sign({ id: user._id, userType: userType }, getJwtSecret(), {
      expiresIn: process.env.JWT_EXPIRE_TIME,
    });

    return res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
}

module.exports = {
  login
};