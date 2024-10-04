const DistributorModel = require("../models/distributorsModel");
const bcrypt = require("bcryptjs");

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

  await newDistributor.save();
  res.status(201).json({ message: "Distributor registered successfully!" });
};

module.exports = {
    registerDistributor,
};