const mongoose = require('mongoose'); //import mongoose 

const supplierSchema = new mongoose.Schema (
    {
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
        default: 'Supplier'
    }
});
  
module.exports = mongoose.model('Suppliers', supplierSchema);