const mongoose = require('mongoose');//import mongoose 
const { customAlphabet } = require('nanoid');
const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz'; // أرقام وحروف صغيرة
const nanoid = customAlphabet(alphabet, 8); // ID بطول 8 خانات 

const TransporterCurrentRequestSchema = new mongoose.Schema(
    {
        shortId: {
            type: String,
            unique: true,
            default: () => `t${nanoid()}`,
            immutable: true,
        },
        request_id: { // id الطلب
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            trim: true,
        },
        senderId: { // id الذي أرسل الطلب
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: 'user_type', // تحديد الكوليكشن بناءً على قيمة user_type
        },
        user_type: {
            type: String,
            required: true,
            enum: ['supplier', 'manufacturer', 'distributor'],
            trim: true,
        },
        transporterId: { // الناقل المسؤول عن الطلب
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Transporters',
        },
        transporterName: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        temperature: {
            type: String,
            required: true
        },
        weight: {
            type: String,
            required: true
        },
        distance: {
            type: String,
            required: true
        },
        totalPrice: {
            type: Number,
            required: true,
        },
        estimated_delivery_date: {
            type: [Date],  // مصفوفة من التواريخ
            required: true
        },
        actual_delivery_date: {
            type: Date,
        },
        status: {
            type: String,
            enum: ['pending', 'inProgress', 'delivered', 'rejected'],
            default: 'pending',
        },
        arrivalAddress: {  // عنوان الوصول (مثلاً للمصنع أو المزود)
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
        departureAddress: { // عنوان المغادرة (مثلاً المورد أو المصنع)
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
        },
        tracking_number: { // رقم التتبع الخاص بالشحنة
            type: String,
            trim: true,
        },
        contract_id: { // معرف العقد إذا كانت الشحنة تتطلب اتفاقية نقل
            type: String,
            trim: true,
        },
    }
)

const TransporterCurrentRequestModel = mongoose.model('Transporter-Current-Request', TransporterCurrentRequestSchema);

module.exports = TransporterCurrentRequestModel