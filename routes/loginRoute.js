const express = require('express');
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Supplier = require('../models/suppliersModel');
const Transporter = require('../models/transportersModel');
const Manufacturer = require('../models/manufacturersModel');
const Distributor = require('../models/distributorsModel');
const Retailer = require('../models/retailersModel');
const { getJwtSecret } = require('../services/authService');

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

router.route('/').post(async (req, res) => {
  const { email, password, userType } = req.body;
  console.log(`${userType} login successfully`);

  try {
    const UserModel = getModelByUserType(userType);

    // Find the user in the database
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'No user found with this email and user type.' });
    }

    // When checking the password during login:
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Incorrect password.' });
    }

    // Create a JWT token
    const token = jwt.sign({ id: user._id, userType: userType }, getJwtSecret());
    //, { expiresIn: '1h' }
    //res.status(200).json({ message: 'Login successful', user  });
    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

module.exports = router;
