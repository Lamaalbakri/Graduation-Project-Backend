const ManufacturerModel = require("../models/manufacturersModel");
const { createToken } = require('../services/authService');
const bcrypt = require("bcryptjs");

const registerManufacturer = async (data) => {
  const { full_name, email, phone_number, password, userType, category } = data;

  const existingManufacturer = await ManufacturerModel.findOne({ email });
  if (existingManufacturer) {
    throw new Error("This email is already registered.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newManufacturer = new ManufacturerModel({
    full_name,
    email,
    phone_number,
    password: hashedPassword,
    userType,
    category
  });

  // await newManufacturer.save();
  // return { message: "Manufacturer registered successfully!" };

  //lamya
  try {
    // Attempt to save the new manufacturer
    await newManufacturer.save();
    // res.status(201).json({ message: "manufacturer registered successfully!" });

    // add lama
    // Create JWT token
    const token = createToken(newManufacturer._id, 'manufacturer');

    // Check if token creation was successful
    if (!token) {
      throw new Error("Failed to create token. Registration aborted.");
    }

    return { message: "manufacturer registered successfully!", newManufacturer, token };
  } catch (error) {
    // If there's an error, delete the manufacturer from the database
    await ManufacturerModel.deleteOne({ _id: newManufacturer._id });
    throw new Error(`Registration failed: ${error.message}`);
  }
};

const searchManufacturers = async (req, res) => {
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
    const manufacturers = await ManufacturerModel.find(searchQuery);
    res.status(200).json({ data: manufacturers });
  } catch (error) {
    console.log("error: ", error);
    res.status(500).json({ error: `Search failed: ${error.message}` });
  }
};

module.exports = {
  registerManufacturer,
  searchManufacturers
};