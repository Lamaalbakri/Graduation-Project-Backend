const ManufacturerModel = require("../models/manufacturersModel");
const bcrypt = require("bcryptjs");

const registerManufacturer = async (data) => {
  const { full_name, email, phone_number, password, confirm_password, userType } = data;

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
    confirm_password: hashedPassword,
    userType
  });

  await newManufacturer.save();
  return { message: "Manufacturer registered successfully!" };
};

module.exports = {
    registerManufacturer,
};