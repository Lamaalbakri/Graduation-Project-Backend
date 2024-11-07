const TransporterPreviousRequestModel = require('../models/transporterPreviousRequestModel');
const asyncHandler = require('express-async-handler');

// @desc Get list of Transporter Previous Request for a transporter
// @route GET /api/v1/transportPreviousRequest
// @access Public
exports.getTransporterPreviousRequest = asyncHandler(async (req, res) => {

    const userType = req.user.userType;
    const userId = req.user._id;

    let filter;
    if (userType === 'transporter') {
        filter = { transporterId: userId };
    } else {
        return res.status(403).json({ msg: 'Access denied: Only transporters can access their requests.' });
    }

    try {
        const transporterPreviousRequests = await TransporterPreviousRequestModel.find(filter);
        res.status(200).json({ data: transporterPreviousRequests });
    } catch (error) {
        res.status(500).json({ msg: 'Error retrieving requests', error: error.message });
    }

});

// @desc Create Transporter Previous Request 
// @route POST /api/v1/transportPreviousRequest
// @access Public
exports.createTransporterPreviousRequest = asyncHandler(async (req, res) => {

    const {
        _id,
        shortId,
        request_id,
        senderId,
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
    } = req.body;

    //Async Await Syntax 
    const TransporterPreviousRequestData = {
        request_id,
        senderId,
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
        status,
        arrivalAddress,
        departureAddress,
        tracking_number,
        contract_id,
    };

    // If the shortId exists, we add it to the transmitted data.
    if (shortId) {
        TransporterPreviousRequestData.shortId = shortId;
    }
    // If the _id exists, we add it to the transmitted data.
    if (_id) {
        TransporterPreviousRequestData._id = _id;
    }
    if (status === 'delivered') {
        TransporterPreviousRequestData.actual_delivery_date = actual_delivery_date || Date.now();
    }

    const TransportPreviousRequest = await TransporterPreviousRequestModel.create(TransporterPreviousRequestData);
    res.status(201).json({ data: TransportPreviousRequest });
});

// @desc Get Specific Transporter Request by ID for authorized Transporter
// @route GET /api/v1/transportPreviousRequest/:id
// @access Public
exports.getTransporterPreviousRequestById = asyncHandler(async (req, res) => {
    const { id } = req.params; // take id from / :id
    const userType = req.user.userType;
    const userId = req.user._id;

    // Check if ID is empty
    if (!id || id.trim() === '') {
        return res.status(400).json({ msg: 'ID is required.' });
    }

    // Check that the short ID matches the specified pattern.
    const shortIdPattern = /^t[0-9a-z]{8}$/; // Regex for t followed by 8 characters (numbers or lowercase letters)

    // Check that the ID is 9 characters long.
    if (id.length !== 9 || !shortIdPattern.test(id)) {
        return res.status(400).json({ msg: `Invalid shortId format: ${id}` });
    }

    // Search using shortId
    const request = await TransporterPreviousRequestModel.findOne({ shortId: id });

    // Check if the request is null or undefined
    if (!request) {
        return res.status(404).json({ msg: `There is no Request for this id: ${id}` });
    }

    // Check if the user has access to this request
    const hasAccess = userType === 'transporter' && request.transporterId.toString() === userId.toString();

    if (!hasAccess) {
        return res.status(401).json({ msg: 'You do not have permission to access this request.' });
    }

    res.status(200).json({ data: request });
});

// @desc Update Specific Transport Request Status by Transporter
// @route PUT /api/v1/transportPreviousRequest/:id
// @access Private
exports.updateTransporterPreviousRequest = asyncHandler(async (req, res) => {
    const { id } = req.params; 
    const userId = req.user._id; // Get the user ID
    const userType = req.user.userType; // Get user type (should be transporter)
    const { status, actual_delivery_date } = req.body; // Get the new status from request body

    const updateData = {
        ...req.body,
    };

    // Check if the user is a transporter
    if (userType !== 'transporter') {
        return res.status(403).json({ msg: 'Only transporters can update the request status.' });
    }

    // Find the transport request to check if it is assigned to the transporter
    const request = await TransporterPreviousRequestModel.findOne({ shortId: id });

    // Check if the request exists
    if (!request) {
        return res.status(404).json({ msg: `There is no Request for this id: ${id}` });
    }

    // Verify that the transporter assigned to this request matches the current user
    if (request.transporterId.toString() !== userId.toString()) {
        return res.status(403).json({ msg: 'You do not have permission to access this request.' });
    }

    // if the status changes to delivered, select actual_delivery_date
    if (status === 'delivered' && !actual_delivery_date) {
        updateData.actual_delivery_date = Date.now();
    }

    // Update the status of the request
    const updatedRequest = await TransporterPreviousRequestModel.findOneAndUpdate(
        { shortId: id }, // identifier to find the request
        { status }, // the data to update
        { updateData },
        { new: true } // to return the updated data
    );

    // Send the updated request as response
    res.status(200).json({ data: updatedRequest });
});

// @desc Delete Specific Transport Request by Transporter
// @route DELETE /api/v1/transportPreviousRequest/:id
// @access Private
exports.deleteTransporterPreviousRequest = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id; // Get user ID
    const userType = req.user.userType; // Get user type (transporter)

    // Find the request to check if it is related to the user
    const request = await TransporterPreviousRequestModel.findOne({ shortId: id });

    //check if the request is null or undefined
    if (!request) {
        return res.status(404).json({ msg: `There is no Request for this id: ${id}` });
    }

    if (userType === 'transporter' && request.transporterId.toString() !== userId.toString()) {
        return res.status(403).json({ msg: 'Access denied: You do not have permission to delete this request.' });
    }
    //Delete request
    await TransporterPreviousRequestModel.findOneAndDelete({ shortId: id });

    res.status(204).send();
});