const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema({
    user_id: {//how own this address
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        trim: true,
    },
    user_type: {
        type: String,
        required: true,
        enum: ['supplier', 'manufacturer', 'distributor', 'retailer'],
        trim: true,
    },
    street: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    city: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    neighborhood: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    postal_code: {
        type: String,
        trim: true,
    },
    country: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    is_default: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const AddressModel = mongoose.model('Addresses', AddressSchema);

module.exports = AddressModel;