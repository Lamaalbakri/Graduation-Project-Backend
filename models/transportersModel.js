const mongoose = require("mongoose");
const { customAlphabet } = require('nanoid');
const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz'; 
const nanoid = customAlphabet(alphabet, 12); 

const transporterSchema = new mongoose.Schema({
  shortId: {
    type: String,
    unique: true,
    default: () => `t${nanoid()}`,
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
    default: 'Transporter'
  }
});

module.exports = mongoose.model('Transporters', transporterSchema);
