const mongoose = require('mongoose');//import mongoose 
const { customAlphabet } = require('nanoid');
const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz'; // أرقام وحروف صغيرة
const nanoid = customAlphabet(alphabet, 8); // ID بطول 8 خانات 

const RawMaterialCurrentRequestSchema = new mongoose.Schema(
    {
        shortId: {// for the order it is extra with object id
            type: String,
            unique: true,
            default: () => `m${nanoid()}`,
            immutable: true,
        },
        supplierId: {//who will receive the order
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Suppliers',
        },
        supplierName: {//who will receive the order
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        manufacturerId: {//who will send the order
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Manufacturers',
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
            unit: { // وحدة القياس
                type: String,
                required: true,
                trim: true,
            },
            options: [ // الخيارات المرتبطة بالمادة الخام
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
            enum: ['pending', 'accepted', 'inProgress', 'delivered', 'rejected'],
            default: 'pending',
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
            neighborhood: { // الحي
                type: String,
                required: true,
                trim: true,
                lowercase: true, // تحويل إلى أحرف صغيرة
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
                trim: true,
                lowercase: true,
            },
            city: {
                type: String,
                trim: true,
                lowercase: true,
            },
            neighborhood: { // الحي
                type: String,
                trim: true,
                lowercase: true, // تحويل إلى أحرف صغيرة
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
            type: Date,
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
const RawMaterialCurrentRequestModel = mongoose.model('Raw-Material-Current-Request', RawMaterialCurrentRequestSchema);

module.exports = RawMaterialCurrentRequestModel