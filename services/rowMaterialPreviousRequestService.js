const slugify = require('slugify');
const asyncHandler = require('express-async-handler')
const RawMaterialPreviousRequestModel = require('../models/rawMaterialPreviousRequestModel');
const mongoose = require('mongoose');

// @desc Get list of Raw Material Request 
// @route GET /api/v1/rawMaterialPreviousRequest
// @access Public
exports.getRawMaterialPreviousRequests = asyncHandler(async (req, res) => {
    const userType = req.user.userType;
    const userId = req.user._id;

    // Filter requests based on userType
    const filter = userType === 'manufacturer' ? { manufacturerId: userId } : { supplierId: userId };

    const RawMaterialPreviousRequests = await RawMaterialPreviousRequestModel.find(filter);//.skip(skip).limit(limit)
    res.status(200).json({ data: RawMaterialPreviousRequests });//results: RawMaterialPreviousRequests.length, , page
});

// @desc Get Specific Raw Material Request by id
// @route GET /api/v1/rawMaterialPreviousRequest/ :id
// @access Public
exports.getRawMaterialPreviousRequestById = asyncHandler(async (req, res) => {
    const { id } = req.params; // take id from / :id
    const userType = req.user.userType;
    const userId = req.user._id;

    //check if id is empty
    if (!id || id.trim() === '') {
        return res.status(400).json({ msg: 'ID is required.' });
    }

    // Check that the short ID matches the specified pattern
    const shortIdPattern = /^m[0-9a-z]{8}$/; // Regex for # followed by 8 characters (numbers or lowercase letters)

    // Check that the ID is 9 characters long.
    if (id.length !== 9 || !shortIdPattern.test(id)) {
        return res.status(400).json({ msg: `Invalid shortId format: ${id}` });
    }

    // Search using shortId
    const request = await RawMaterialPreviousRequestModel.findOne({ shortId: id });

    // check if the request is null or undefined
    if (!request) {
        return res.status(404).json({ msg: `There is no Request for this id: ${id}` });
    }

    // Check if the user is the supplier or manufacturer associated with the order
    const hasAccess =
        (userType === 'supplier' && request.supplierId.toString() === userId.toString()) ||
        (userType === 'manufacturer' && request.manufacturerId.toString() === userId.toString());

    if (!hasAccess) {
        return res.status(401).json({ msg: 'You do not have permission to access this request.' });
    }

    res.status(200).json({ data: request });
});

// @desc Get Specific Raw Material Request by manufacturer name "slug"
// @route GET /api/v1/rawMaterialPreviousRequest/manufacturer/slug/:slug
// @access Public
exports.getRawMaterialPreviousRequestByMSlug = asyncHandler(async (req, res) => {
    const { slug } = req.params;//take  slug from / :slug
    const userType = req.user.userType; // Get user type (supplier or manufacturer)
    const userId = req.user._id; // Get user ID

    const request = await RawMaterialPreviousRequestModel.findOne({ slug });

    //check if the request is null or undefined
    if (!request) {
        return res.status(404).json({ msg: `There is no Request for this manufacturer slug: ${slug}` });
    }

    // Check if the user is the supplier or manufacturer associated with the order
    if (
        (userType === 'supplier' && request.supplierId.toString() !== userId.toString()) ||
        (userType === 'manufacturer' && request.manufacturerId.toString() !== userId.toString())
    ) {
        return res.status(403).json({ msg: 'You do not have permission to access this request.' });
    }

    res.status(200).json({ data: request });
});

// @desc Get Specific Raw Material Request by manufacturer name 
// @route GET /api/v1/rawMaterialPreviousRequest/manufacturerName/:manufacturerName
// @access Public
exports.getRawMaterialPreviousRequestByMName = asyncHandler(async (req, res) => {
    const { manufacturerName } = req.params;
    const userType = req.user.userType; // Get user type (supplier or manufacturer)
    const userId = req.user._id; // Get user ID

    const requests = await RawMaterialPreviousRequestModel.findOne({ manufacturerName: new RegExp(`^${manufacturerName}$`, "i") });

    //check if the request is null or undefined
    if (!requests) {
        return res.status(404).json({ msg: `There is no requests for this manufacturer Name: ${manufacturerName}` });
    }

    const accessibleRequests = requests.filter((request) =>
        (userType === 'supplier' && request.supplierId.toString() === userId.toString()) ||
        (userType === 'manufacturer' && request.manufacturerId.toString() === userId.toString())
    );

    if (accessibleRequests.length === 0) {
        return res.status(403).json({ msg: 'You do not have permission to access these requests.' });
    }

    res.status(200).json({ data: accessibleRequests });
});

// @desc Create Raw Material Request 
// @route POST /api/v1/rawMaterialPreviousRequest
// @access Public
exports.createRawMaterialPreviousRequest = asyncHandler(async (req, res) => {
    console.log('try to create previous here')
    const {
        _id,
        shortId,
        supplierId,
        supplierName,
        manufacturerName,
        manufacturerId,
        supplyingRawMaterials,
        subtotal_items,
        shipping_cost,
        total_price,
        payment_method,
        status,
        arrivalAddress,
        departureAddress,
        transporterId,
        transporterName,
        estimated_delivery_date,
        actual_delivery_date,
        notes,
        tracking_number,
        transportRequest_id,
        contract_id,
    } = req.body;


    if (!shortId || !_id) {
        console.log('here the error')
        return res.status(400).json({ error: "shortId and _id are  Missing" });
    }


    //Async Await Syntax 
    const rawMaterialRequestData = {
        _id,
        shortId,
        supplierId,
        supplierName,
        manufacturerName,
        manufacturerId,
        supplyingRawMaterials,
        subtotal_items,
        shipping_cost,
        total_price,
        payment_method,
        status,
        arrivalAddress,
        departureAddress,
        transporterId,
        transporterName,
        estimated_delivery_date,
        actual_delivery_date,
        notes,
        tracking_number,
        transportRequest_id,
        contract_id,
    };

    const RawMaterialPreviousRequest = await RawMaterialPreviousRequestModel.create(rawMaterialRequestData);
    console.log('done here previous serves')
    res.status(201).json({ data: RawMaterialPreviousRequest });
});


// @desc Update Specific Raw Material Request 
// @route PUT /api/v1/rawMaterialPreviousRequest/:id
// @access Private
exports.updateRawMaterialPreviousRequest = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id; // Get user ID
    const userType = req.user.userType; // Get user type (supplier or manufacturer)
    const { status } = req.body;

    // Find the request to check if it is related to the user
    const request = await RawMaterialPreviousRequestModel.findOne({ shortId: id });

    // Check if the request exists
    if (!request) {
        return res.status(404).json({ msg: `There is no Request for this id: ${id}` });
    }

    // Check if the user is associated with the request
    if (userType === 'supplier' && request.supplierId.toString() !== userId.toString()) {
        return res.status(403).json({ msg: 'You do not have permission to access this request.' });
    }

    const updatedRequest = await RawMaterialPreviousRequestModel.findOneAndUpdate(
        { shortId: id },//identifier to find the request 
        { status },//the data will update
        { new: true }//to return data after ubdate
    );

    //check if the request is null or undefined
    if (!request) {
        return res.status(404).json({ msg: `There is no Request for this id: ${id}` });
    }
    res.status(200).json({ data: updatedRequest });
});

// @desc Delete Specific Raw Material Request 
// @route DELETE /api/v1/rawMaterialPreviousRequest/:id
// @access Private
exports.deleteRawMaterialPreviousRequest = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id; // Get user ID
    const userType = req.user.userType; // Get user type (supplier or manufacturer)

    // Find the request to check if it is related to the user
    const request = await RawMaterialPreviousRequestModel.findOne({ shortId: id });

    //check if the request is null or undefined
    if (!request) {
        return res.status(404).json({ msg: `There is no Request for this id: ${id}` });
    }

    if (userType === 'supplier' && request.supplierId.toString() !== userId.toString()) {
        return res.status(403).json({ msg: 'Access denied: You do not have permission to delete this request.' });
    }

    //Delete request
    await RawMaterialPreviousRequestModel.findOneAndDelete({ shortId: id });

    res.status(204).send();
});

exports.getRawMaterialPreviousRequestsforManufacturer = asyncHandler(async (req, res) => {
    const userId = req.user._id; // Get user ID
    const userType = req.user.userType;
    const RawMaterialCurrentRequests = await RawMaterialPreviousRequestModel.find({ manufacturerId: userId });
    res.status(200).json({ data: RawMaterialCurrentRequests });
});