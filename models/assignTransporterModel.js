const mongoose = require('mongoose'); //import mongoose 
const { customAlphabet } = require('nanoid');
const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz'; // أرقام وحروف صغيرة
const nanoid = customAlphabet(alphabet, 8); // ID بطول 8 خانات 


//1-create schema
const assignTransporterSchema = new mongoose.Schema(
    {
        /*serviceID: {
            type: String,
            required: true
        },*/
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
        company: { // price
            type: String,
            required: true
        },
        dateRange: {
            type: [Date],  // تعديل الحقل ليكون مصفوفة من التواريخ
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'inProgress', 'delivered', 'rejected'],
            default: 'pending',
        },
        /*arrivalCity: {
            type: String,
            //enum: ['Jeddah', 'Makkah', 'Taif', 'Riyadh', 'Al-Khobar', 'Abha'],
            required: true
        },*/
        departureCity: {
            type: String,
            required: true
        },
        shortId: {
            type: String,
            unique: true, // إضافة فهرس للتأكد من أن القيم فريدة
            default: () => `t${nanoid()}`,
            immutable: true // اجعل القيمة غير قابلة للتعديل
        }
    },
    { timestamps: true }
);

//2- create model
module.exports = mongoose.model('TransportRequests', assignTransporterSchema);