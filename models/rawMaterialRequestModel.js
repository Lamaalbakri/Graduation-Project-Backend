const mongoose = require('mongoose');//import mongoose 

//1-create schema
const RawMaterialRequestSchema = new mongoose.Schema(
    {
        manufacturerId: {
            type: mongoose.Schema.Types.ObjectId,
            //Uncomment when the Manufacturer model is available
            // required: true,
            // ref: 'Manufacturer',
        },
        manufacturerName: {
            type: String,
            required: true,
        },
        supplyingItems: {
            type: [String],
            required: true,
        },
        quantity: {
            type: [Number],
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'inProgress', 'delivered', 'rejected'],
            default: 'pending',
        },
        arrivalCity: {
            type: String,
            required: true
        },
        transporterId: {
            type: mongoose.Schema.Types.ObjectId,
            //Uncomment when the Transporter model is available
            // required: true,
            // ref: 'Transporter'
        },
        notes: {
            type: String,
            default: '',
        },
        trackingInfo: {
            type: String,
            default: '',
        },
        slug: {
            type: String,
            lowercase: true,
        },
    },
    { timestamps: true }
);

//2- create model
const RawMaterialRequestModel = mongoose.model('RawMaterialRequest', RawMaterialRequestSchema);

module.exports = RawMaterialRequestModel;