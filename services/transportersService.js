const TransporterModel = require("../models/transportersModel");
const bcrypt = require("bcryptjs");

const registerTransporter = async (data) => {
  const { full_name, email, phone_number, password, userType } = data;

  const existingTransporter = await TransporterModel.findOne({ email });
  if (existingTransporter) {
    throw new Error("This email is already registered.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newTransporter = new TransporterModel({
    full_name,
    email,
    phone_number,
    password: hashedPassword,
    userType
  });

  await newTransporter.save();
  return { message: "Transporter registered successfully!" };
};

module.exports = {
  registerTransporter,
};
