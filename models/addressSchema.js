const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
    // address id :ObjectID will be created automatically.
    user_id: {//how own this address
        type: mongoose.Schema.Types.ObjectId, // إذا كنت تستخدم ObjectId
        required: true,
        trim: true,
    },
    user_type: {
        type: String,
        required: true,
        enum: ['supplier', 'manufacturer', 'distributor', 'retailer'],
        trim: true,
    },
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
    neighborhood: { // الحي
        type: String,
        required: true,
        trim: true,
        lowercase: true, // تحويل إلى أحرف صغيرة
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
    is_default: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Address', addressSchema);