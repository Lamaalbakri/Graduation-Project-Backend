const mongoose = require('mongoose');//import mongoose 
const { customAlphabet } = require('nanoid');
const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz'; // أرقام وحروف صغيرة
const nanoid = customAlphabet(alphabet, 8); // ID بطول 8 خانات 


const RawMaterialPreviousRequestSchema = new mongoose.Schema(
    {
        shortId: {
            type: String,
            required: true,
        },
        supplierId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Suppliers',
            required: true,
        },
        supplierName: {//who will receive the order
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        manufacturerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Manufacturers',
            required: true,
        },
        manufacturerName: {//who will send the order
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        supplyingRawMaterials: [{
            rawMaterial_id: {
                type: String,
                required: true,
                trim: true,
            },
            rawMaterial_name: {
                type: String,
                required: true,
                trim: true,
            },
            quantity: {
                type: Number,
                required: true,
                min: 1,
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
        arrivalAddress: {//manufacturer address
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
        departureAddress: {//supplier address
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
                trim: true,
                required: true,
                lowercase: true,
            },
        },
        transporterId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Transporters',
        },
        transporterName: {
            type: String,
            trim: true,
            lowercase: true,
            required: true,
        },
        estimated_delivery_date: {
            required: true,
            type: Date,
        },
        actual_delivery_date: {
            required: true,
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
            required: true,
            type: String,
            trim: true,
        },
        contract_id: {
            type: String,
            trim: true,
        },
    }, { timestamps: true })
    ;

//2- create model
const RawMaterialPreviousRequestModel = mongoose.model('Raw-Material-Previous-Request', RawMaterialPreviousRequestSchema);

module.exports = RawMaterialPreviousRequestModel