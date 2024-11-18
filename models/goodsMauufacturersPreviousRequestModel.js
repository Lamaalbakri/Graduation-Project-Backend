const mongoose = require('mongoose'); 
const { customAlphabet } = require('nanoid');
const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz'; 
const nanoid = customAlphabet(alphabet, 8); 

const GoodsManufacturersPreviousRequestSchema = new mongoose.Schema(
    {
        shortId: {
            type: String,
            required: true,
        },
        manufacturerId: {//who will receive the order
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Manufacturers',
        },
        manufacturerName: {//who will receive the order
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        distributorId: {//who will send the order
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Distributors',
        },
        distributorName: {//who will send the order
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        goodsForDistributors: [{
            goods_id: {
                type: String,
                required: true,
                trim: true,
            },
            goods_name: {
                type: String,
                required: true,
                trim: true,
            },
            quantity: {
                type: Number,
                required: true,
                min: 1,
            },
            image: {
                type: String, // if using GridFS for image storage change this to an ObjectID  
            },
            unit_price: {
                type: Number,
                required: true,
                min: 0,
            },
            subtotal: {
                type: Number,
                required: true,
                min: 0,
            },
            unit: { 
                type: String,
                required: true,
                trim: true,
            },
            options: [ 
                {
                    optionType: {
                        type: String,
                        trim: true,
                    },
                    values: [{
                        type: String,
                        trim: true,
                    }]
                }
            ],
        }],
        subtotal_items: {
            type: Number,
            required: true,
            min: 0,
        },
        shipping_cost: {
            type: Number,
            required: true,
            min: 0,
        },
        total_price: {
            type: Number,
            required: true,
            min: 0,
        },
        payment_method: {
            type: String,
            required: true,
            trim: true,
        },
        status: {
            type: String,
            enum: ['delivered', 'rejected'],
            required: true,
        },
        arrivalAddress: {// distributor address
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
            postal_code: {
                type: String,
                trim: true,
            },
            neighborhood: {
                type: String,
                required: true,
                trim: true,
                lowercase: true, 
            },
            country: {
                type: String,
                required: true,
                trim: true,
                lowercase: true,
            },
        },
        departureAddress: {// manufacturer address
            street: {
                type: String,
                trim: true,
                lowercase: true,
            },
            city: {
                type: String,
                trim: true,
                lowercase: true,
            },
            neighborhood: { 
                type: String,
                trim: true,
                lowercase: true,
            },
            postal_code: {
                type: String,
                trim: true,
            },
            country: {
                type: String,
                trim: true,
                lowercase: true,
            },
        },
        transporterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Transporters',
        },
        transporterName: {
            type: String,
            trim: true,
            lowercase: true,
        },
        estimated_delivery_date: {
            type: [Date],
        },
        actual_delivery_date: {
            type: Date,
        },
        notes: {
            type: String,
            default: '',
            trim: true,
        },
        tracking_number: {
            type: String,
            trim: true,
        },
        transportRequest_id: {
            type: String,
            trim: true,
        },
        contract_id: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true }
);

//2- create model
const GoodsManufacturersPreviousRequestModel = mongoose.model('Goods-Manufacturers-Previous-Request', GoodsManufacturersPreviousRequestSchema);

module.exports = GoodsManufacturersPreviousRequestModel