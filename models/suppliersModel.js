const mongoose = require('mongoose'); //import mongoose 
const { customAlphabet } = require('nanoid');
const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz';
const nanoid = customAlphabet(alphabet, 12);

const supplierSchema = new mongoose.Schema({
    shortId: {
        type: String,
        unique: true,
        default: () => `s${nanoid()}`,
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
        default: 'Supplier',
        trim: true
    },
    category: {
        type: String,
        default: "",
        trim: true
    },
    rawMaterialList: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Manage-Raw-Materials'
        }
    ],
    addresses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Address'
        }
    ]
},
    {
        timestamps: true
    });


module.exports = mongoose.model('Suppliers', supplierSchema);