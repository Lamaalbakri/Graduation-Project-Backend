const SupplierModel = require("../models/suppliersModel");
const bcrypt = require("bcryptjs");

const registerSupplier = async (data) => {
  const { full_name, email, phone_number, password, userType } = data;

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
    userType
  });

  await newSupplier.save();
  return { message: "Transporter registered successfully!" };
};

module.exports = {
  registerSupplier,
};