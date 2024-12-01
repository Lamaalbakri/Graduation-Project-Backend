const mongoose = require("mongoose");
const { customAlphabet } = require('nanoid');
const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz';
const nanoid = customAlphabet(alphabet, 12);

const distributorSchema = new mongoose.Schema(
  {
    shortId: {
      type: String,
      unique: true,
      default: () => `d${nanoid()}`,
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
      default: 'Distributor'
    },
    category: {
      type: String,
      trim: true,
      default: ''
    },
    addresses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address'
      }
    ],
    manufacturersList: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Manufacturers'
      }
    ],
    distributorGoodsList: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Manage-Goods-Distributors'
      }
    ]
  }
);

module.exports = mongoose.model('Distributors', distributorSchema);