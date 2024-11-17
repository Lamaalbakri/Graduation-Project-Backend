const mongoose = require('mongoose');//import mongoose 
const { customAlphabet } = require('nanoid');
const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz';
const nanoid = customAlphabet(alphabet, 8);

const contractSchema = new mongoose.Schema(
    {
        contractShortId: {
            type: String,
            unique: true,
            default: () => nanoid(),
            immutable: true,
        },
        purchaseOrderId: {
            type: String,
            required: true,
        },
        transportOrderId: {
            type: String,
            required: true,
        },
        sellerShortId: {
            type: String,
            required: true,
        },
        sellerName: {
            type: String,
            required: true,
        },
        buyerShortId: {
            type: String,
            required: true,
        },
        buyerName: {
            type: String,
            required: true,
        },
        transporterId: {
            type: String,
            required: true,
        },
        transporterName: {
            type: String,
            required: true,
        },
        items: [{
            itemName: {
                type: String,
                required: true,
                trim: true,
            },
            quantity: {
                type: Number,
                required: true,
                min: 1,
            },
            options:
            {
                type: [String],
                trim: true,
            },
        }],
        transportType: {
            type: String,
            required: true
        },
        weight: {
            type: String,
            required: true
        },
        totalBuyerPayment: {
            type: Number,
            required: true,
            min: 1,
        },
        totalTransportPayment: {
            type: Number,
            required: true,
            min: 1,
        },
        estimatedDeliveryDate: {
            type: [Date],
        },
        actualDeliveryDate: {
            type: Date,
        },
        purchaseOrderStatus: {
            type: String,
            enum: ['inProgress', 'delivered'],
            default: 'inProgress',
        },
        buyerAddress: {
            type: [String],
            required: true,
            trim: true,
        },
        sellerAddress: {
            type: [String],
            required: true,
            trim: true,
        },
        contractCounter: {
            type: Number,
            trim: true,
        },
        transactionHash: {
            type: String,
            trim: true,
        },
        blockNumber: {
            type: Number,
            trim: true,
        },
        trackingNumber: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true }
);

const contractModel = mongoose.model('contracts', contractSchema);

module.exports = contractModel