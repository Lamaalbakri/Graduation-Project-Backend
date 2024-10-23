const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Supplier = require('../models/suppliersModel');
const Transporter = require('../models/transportersModel');
const Manufacturer = require('../models/manufacturersModel');
const Distributor = require('../models/distributorsModel');
const Retailer = require('../models/retailersModel');
const transportersService = require("../services/transportersService");
const suppliersService = require("../services/suppliersService");
const manufacturersService = require("../services/manufacturersService");
const distributorsService = require("../services/distributorsService");
const retailersService = require("../services/retailersService");
const { createToken } = require('../services/authService');

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
      return res.status(401).json({ message: 'Incorrect password or email.' });
    }

    // Create a JWT token
    const token = createToken(user._id, userType);
    // const token = jwt.sign({ id: user._id, userType: userType }, getJwtSecret(), {
    //   expiresIn: process.env.JWT_EXPIRE_TIME,
    // });

    return res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
}

// Register method
async function register(req, res) {
  const { userType } = req.body;
  console.log(`Registering ${userType}`);

  try {
    let result;
    switch (userType) {
      case "transporter":
        result = await transportersService.registerTransporter(req.body);
        break;
      case "supplier":
        result = await suppliersService.registerSupplier(req.body);
        break;
      case "manufacturer":
        result = await manufacturersService.registerManufacturer(req.body);
        break;
      case "distributor":
        result = await distributorsService.registerDistributor(req.body);
        break;
      case "retailer":
        result = await retailersService.registerRetailer(req.body);
        break;
      default:
        return res.status(400).json({ error: "Invalid user type." });
    }

    res.status(201).json(result);
  } catch (error) {
    console.error("Error in registration:", error);
    res.status(500).json({ error: error.message });
  }
}
module.exports = {
  login,
  register
};