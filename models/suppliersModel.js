const mongoose = require('mongoose'); //import mongoose 
const { customAlphabet } = require('nanoid');
const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz'; // أرقام وحروف صغيرة
const nanoid = customAlphabet(alphabet, 12); // ID بطول 8 خانات 

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
        trim: true // إزالة المسافات الزائدة
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true, // إزالة المسافات الزائدة
        lowercase: true // تحويل البريد الإلكتروني إلى حروف صغيرة
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
        trim: true // إزالة المسافات الزائدة
    },
    Category: {
        type: String,
        default: "",
        trim: true // إزالة المسافات الزائدة
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
        timestamps: true // إضافة التواريخ createdAt و updatedAt
    });


module.exports = mongoose.model('Suppliers', supplierSchema);