const SupplierModel = require("../models/suppliersModel");
const { createToken } = require('../services/authService');
const bcrypt = require("bcryptjs");

const registerSupplier = async (data) => {
  const { full_name, email, phone_number, password, userType, category } = data;

  const existingSupplier = await SupplierModel.findOne({ email });
  if (existingSupplier) {
    throw new Error("This email is already registered.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newSupplier = new SupplierModel({
    full_name,
    email,
    phone_number,
    password: hashedPassword,
    userType,
    category
  });

  // await newSupplier.save();
  // return { message: "Supplier registered successfully!" };
  //lamya
  try {
    // Attempt to save the new Supplier
    await newSupplier.save();

    // add lama
    // Create JWT token
    const token = createToken(newSupplier._id, 'supplier');
    // Check if token creation was successful
    if (!token) {
      throw new Error("Failed to create token. Registration aborted.");
    }

    return { message: "Supplier registered successfully!", newSupplier, token };
  } catch (error) {
    // If there's an error, delete the Supplier from the database
    await SupplierModel.deleteOne({ _id: newSupplier._id });
    throw new Error(`Registration failed: ${error.message}`);
  }
};


//sprint 3
const searchSuppliers = async (req, res) => {
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
    const suppliers = await SupplierModel.find(searchQuery);
    res.status(200).json({ data: suppliers });
  } catch (error) {
    console.log("error: ", error);
    res.status(500).json({ error: `Search failed: ${error.message}` });
  }
};


module.exports = {
  registerSupplier,
  searchSuppliers
};