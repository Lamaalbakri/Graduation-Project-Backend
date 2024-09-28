const mongoose = require('mongoose'); //import mongoose 

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
        }
    },
    { timestamps: true }
);

//2- create model
module.exports = mongoose.model('TransportRequests', assignTransporterSchema);