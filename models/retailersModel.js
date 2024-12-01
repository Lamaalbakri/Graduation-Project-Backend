const mongoose = require("mongoose");
const { customAlphabet } = require('nanoid');
const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz';
const nanoid = customAlphabet(alphabet, 12);

const retailerSchema = new mongoose.Schema(
  {
    shortId: {
      type: String,
      unique: true,
      default: () => `r${nanoid()}`,
      immutable: true
    },
    full_name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true
    },
    phone_number: {
      type: String,
      required: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    userType: {
      type: String,
      default: 'Retailer'
    },
    addresses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address'
      }
    ],
    distributorsList: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Distributors'
      }
    ]
  }
);

module.exports = mongoose.model('Retailers', retailerSchema);
