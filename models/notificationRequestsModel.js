const mongoose = require('mongoose');

const NotificationRequestsSchema = new mongoose.Schema(
    {
        userId: { // المستخدم الذي سيتم إرسال الإشعار إليه
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: 'user_type', 
        },
        user_type: {
            type: String,
            required: true,
            enum: ['supplier', 'manufacturer', 'distributor'],
            trim: true,
        },
        message: { 
            type: String,
            required: true,
        },
        read: {
            type: Boolean,
            default: false,
        },
        date: new Date(),
    },
    { timestamps: true }
);

const NotificationRequests = mongoose.model('Notification-Requests', NotificationRequestsSchema);

module.exports = NotificationRequests;