const DistributorModel = require("../models/distributorsModel");
const { createToken } = require('../services/authService');
const bcrypt = require("bcryptjs");

//create distributer
const registerDistributor = async (data) => {
  const { full_name, email, phone_number, password, userType } = data;

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
    userType
  });

  // await newDistributor.save();
  // res.status(201).json({ message: "Distributor registered successfully!" });
  //lamya
  try {
    // Attempt to save the new Distributor
    await newDistributor.save();

    // add lama
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


module.exports = {
  registerDistributor,
};