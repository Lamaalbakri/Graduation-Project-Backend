const mongoose = require('mongoose');//import mongoose 
const { customAlphabet } = require('nanoid');
const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz'; // أرقام وحروف صغيرة
const nanoid = customAlphabet(alphabet, 8); // ID بطول 8 خانات 

//1-create schema
const RawMaterialCurrentRequestSchema = new mongoose.Schema(
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
        shortId: {
            type: String,
            unique: true, // إضافة فهرس للتأكد من أن القيم فريدة
            default: () => `m${nanoid()}`,
            immutable: true // اجعل القيمة غير قابلة للتعديل
        }

    },
    { timestamps: true }
);

//2- create model
const RawMaterialCurrentRequestModel = mongoose.model('Raw-Material-Current-Request', RawMaterialCurrentRequestSchema);

module.exports = RawMaterialCurrentRequestModel