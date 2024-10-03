const mongoose = require("mongoose");

const retailerSchema = new mongoose.Schema({
  full_name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  phone_number: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  confirm_password: {
    type: String,
    required: true
  },
  userType: {
    type: String,
    default: 'Retailer' // نوع المستخدم
  }
});

module.exports = mongoose.model('Retailers', retailerSchema);
