const DistributorModel = require("../models/distributorsModel");
const { createToken } = require('../services/authService');
const bcrypt = require("bcryptjs");

//create distributer
const registerDistributor = async (data) => {
  const { full_name, email, phone_number, password, userType, category } = data;

  const existingDistributor = await DistributorModel.findOne({ email });
  if (existingDistributor) {
    throw new Error("This email is already registered.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newDistributor = new DistributorModel({
    full_name,
    email,
    phone_number,
    password: hashedPassword,
    userType,
    category
  });

  try {
    // Attempt to save the new Distributor
    await newDistributor.save();

    // Create JWT token
    const token = createToken(newDistributor._id, 'distributor');

    // Check if token creation was successful
    if (!token) {
      throw new Error("Failed to create token. Registration aborted.");
    }

    return { message: "Distributor registered successfully!", newDistributor, token };
  } catch (error) {
    // If there's an error, delete the Distributor from the database
    await DistributorModel.deleteOne({ _id: newDistributor._id });
    throw new Error(`Registration failed: ${error.message}`);
  }
};

const searchDistributors = async (req, res) => {
  const { category, searchText } = req.params;
  let searchQuery = {};

  if (category && category !== "null") {
    searchQuery.category = category;
  }

  if (searchText && searchText !== "null") {
    searchQuery.$or = [
      { full_name: { $regex: searchText, $options: 'i' } },
      { shortId: { $regex: searchText, $options: 'i' } }
    ];
  }

  try {
    const distributors = await DistributorModel.find(searchQuery);
    res.status(200).json({ data: distributors });
  } catch (error) {
    res.status(500).json({ error: `Search failed: ${error.message}` });
  }
};

module.exports = {
  registerDistributor,
  searchDistributors
};