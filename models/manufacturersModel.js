const mongoose = require("mongoose");
const { customAlphabet } = require('nanoid');
const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz';
const nanoid = customAlphabet(alphabet, 12);

const manufacturerSchema = new mongoose.Schema({
  shortId: {
    type: String,
    unique: true,
    default: () => `m${nanoid()}`,
    immutable: true
  },
  full_name: {
    type: String,
    required: true,
    trim: true,
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
    default: 'Manufacturer'
  },
  category: {
    type: String,
    trim: true,
    default: ''
  },
  suppliersList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Suppliers'
    }
  ],
  manufacturerGoodsList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Manage-Goods-Manufacturers'
    }
  ],
  addresses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Address'
    }
  ]
});

module.exports = mongoose.model('Manufacturers', manufacturerSchema);