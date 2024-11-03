const mongoose = require('mongoose');//import mongoose 
const { customAlphabet } = require('nanoid');
const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz'; // أرقام وحروف صغيرة
const nanoid = customAlphabet(alphabet, 8); // ID بطول 8 خانات 

const TransporterPreviousRequestSchema = new mongoose.Schema(
    {
        shortId: {
            type: String,
            required: true,
        },
        request_id: { // The request id that will come to the transporter ( #m - #d - #r)
            type: String,
            required: true,
        },
        senderId: { // The ID of the stakeholder who sent the request to the transporter
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: 'sender_type',
        },
        sender_type: {
            type: String,
            required: true,
            enum: ['supplier', 'manufacturer', 'distributor'],
            trim: true,
        },
        receiver_id: { // The ID of the stakeholder who will receive the request from the transporter
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: 'receiver_type',
        },
        receiver_type: {
            type: String,
            required: true,
            enum: ['manufacturer', 'distributor', 'retailer'],
            trim: true,
        },
        transporterId: { // The ID of  transporter responsible for the request
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
            min: 0,
        },
        estimated_delivery_date: {
            type: [Date], 
            required: true
        },
        actual_delivery_date: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ['delivered', 'rejected'],
            required: true,
        },
        arrivalAddress: {  // Arrival address (e.g. manufacturer, distributor, or retailer)
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
        departureAddress: { // Departure address (e.g. supplier, manufacturer, or distributor)
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
        tracking_number: { // Tracking number for the shipment
            type: String,
            trim: true,
        },
        contract_id: { 
            type: String,
            trim: true,
        },
    },
    { timestamps: true }
)

const TransporterPreviousRequestModel = mongoose.model('Transporter-Previous-Request', TransporterPreviousRequestSchema);

module.exports = TransporterPreviousRequestModel