const mongoose = require('mongoose');

const ShoppingBasketModel = new mongoose.Schema({
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        trim: true,
    },
    buyerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        trim: true,
    },
    sellerName: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    buyerName: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    ShoppingBasketItems: [{
        item_id: {
            type: mongoose.Schema.ObjectId,
            required: true,
        },
        item_name: {
            type: String,
            required: true,
            trim: true,
        },
        image: {
            type: String,
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
    }
}, { timestamps: true });

module.exports = mongoose.model('Shopping-Basket', ShoppingBasketModel);
