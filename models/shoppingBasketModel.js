const mongoose = require('mongoose');

const ShoppingBasketModel = new mongoose.Schema({
    // معرف البائع
    sellerId: {
        type: mongoose.Schema.Types.ObjectId, // إذا كنت تستخدم ObjectId
        required: true,
        trim: true, // Assuming there is a User collection for sellers
    },
    // معرف المشتري
    buyerId: {
        type: mongoose.Schema.Types.ObjectId, // إذا كنت تستخدم ObjectId
        required: true,
        trim: true, // Assuming there is a User collection for buyers
    },
    // اسم البائع
    sellerName: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    // اسم المشتري
    buyerName: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    // المواد الخام المضافة إلى السلة
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
            type: String, // يمكن تغييره إلى ObjectId إذا كنت تستخدم GridFS لتخزين الصور
            // required: [true, "Product Image is required"],
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
    // المجموع الفرعي لكل المواد في السلة
    subtotal_items: {
        type: Number,
        required: true,
        min: 0,
    },
    // تكلفة الشحن
    shipping_cost: {
        type: Number,
        required: true,
        min: 0,
    },
    // السعر الإجمالي للسلة بعد إضافة الشحن
    total_price: {
        type: Number,
        required: true,
        min: 0,
    }
}, { timestamps: true });

module.exports = mongoose.model('Shopping-Basket', ShoppingBasketModel);
