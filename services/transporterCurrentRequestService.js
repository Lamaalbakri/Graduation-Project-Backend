const TransporterCurrentRequestModel = require('../models/transporterCurrentRequestModel');
const asyncHandler = require('express-async-handler')

exports.getTransporterCurrentRequest = asyncHandler(async (req, res) => {

    const userType = req.user.userType;
    const userId = req.user._id;

    let filter;
    if (userType === 'transporter') {
        filter = { transporterId: userId };
    } else {
        return res.status(403).json({ msg: 'Access denied: Only transporters can access their requests.' });
    }

    try {
        const transporterCurrentRequests = await TransporterCurrentRequestModel.find(filter);
        res.status(200).json({ data: transporterCurrentRequests });
    } catch (error) {
        res.status(500).json({ msg: 'Error retrieving requests', error: error.message });
    }
    
});

exports.createTransporterCurrentRequest = asyncHandler(async (req, res) => {

    const userId = req.user._id; // Get user ID
    const userType = req.user.userType; // Get user type 

    const request_id = req.body.request_id;
    const senderId = req.body.senderId;
    const sender_type = req.body.sender_type;
    const receiver_id = req.body.receiver_id;
    const receiver_type = req.body.receiver_type;
    const transporterId = req.body.transporterId;
    const transporterName = req.body.transporterName;
    const temperature = req.body.temperature;
    const weight = req.body.weight;
    const distance = req.body.distance;
    const totalPrice = req.body.totalPrice;
    const estimated_delivery_date = req.body.estimated_delivery_date;
    const actual_delivery_date = req.body.actual_delivery_date || null;
    const status = req.body.status || 'pending';
    const arrivalAddress = req.body.arrivalAddress || null;
    const departureAddress = req.body.departureAddress;
    const tracking_number = req.body.tracking_number || '';
    const contract_id = req.body.contract_id || '';

    if (!['supplier', 'manufacturer', 'distributor'].includes(userType)) {
        return res.status(403).json({ msg: 'Access denied: Only suppliers, manufacturers, and distributors can create transport requests.' });
    }

    try{
        const TransporterCurrentRequest = await TransporterCurrentRequestModel.create({
            request_id,
            senderId: userId,
            sender_type,
            receiver_id,
            receiver_type,
            transporterId,
            transporterName,
            temperature,
            weight,
            distance,
            totalPrice,
            estimated_delivery_date,
            actual_delivery_date,
            status,
            arrivalAddress,
            departureAddress,
            tracking_number,
            contract_id,
            });
        
            res.status(201).json({ data: TransporterCurrentRequest });
    } catch (error){
        console.error('Error creating transport request:', error);
        return res.status(400).json({ msg: 'Validation Error', errors: error.errors });
        throw error;
    }

});