const asyncHandler = require('express-async-handler')
const GoodsManufacturersPreviousRequestModel = require('../models/goodsMauufacturersPreviousRequestModel');

exports.getGoodsManufacturerPreviousRequests = asyncHandler(async (req, res) => {

    const userType = req.user.userType;
    const userId = req.user._id;

    // Filter requests based on userType
    const filter = userType === 'distributor' ? { distributorId: userId } : { manufacturerId: userId };


    const GoodsPreviousRequests = await GoodsManufacturersPreviousRequestModel.find(filter);
    res.status(200).json({ data: GoodsPreviousRequests });
});


exports.getGoodsManufacturerPreviousRequestById = asyncHandler(async (req, res) => {
    const { id } = req.params; // take id from / :id
    const userType = req.user.userType;
    const userId = req.user._id;

    //check if id is empty
    if (!id || id.trim() === '') {
        return res.status(400).json({ msg: 'ID is required.' });
    }

    // Check that the short ID matches the specified pattern.
    const shortIdPattern = /^d[0-9a-z]{8}$/; // Regex for # followed by 8 characters (numbers or lowercase letters)

    // Check that the ID is 9 characters long.
    if (id.length !== 9 || !shortIdPattern.test(id)) {
        return res.status(400).json({ msg: `Invalid shortId format: ${id}` });
    }

    // Search using shortId
    const request = await GoodsManufacturersPreviousRequestModel.findOne({ shortId: id });

    // check if the request is null or undefined
    if (!request) {
        return res.status(404).json({ msg: `There is no Request for this id: ${id}` });
    }

    const hasAccess =
        (userType === 'manufacturer' && request.manufacturerId.toString() === userId.toString()) ||
        (userType === 'distributor' && request.distributorId.toString() === userId.toString());

    if (!hasAccess) {
        return res.status(401).json({ msg: 'You do not have permission to access this request.' });
    }

    res.status(200).json({ data: request });
});


exports.getGoodsManufacturerPreviousRequestByMSlug = asyncHandler(async (req, res) => {
    const { slug } = req.params;//take  slug from / :slug
    const userType = req.user.userType; 
    const userId = req.user._id; // Get user ID

    const request = await GoodsManufacturersPreviousRequestModel.findOne({ slug });

    //check if the request is null or undefined
    if (!request) {
        return res.status(404).json({ msg: `There is no Request for this distributor slug: ${slug}` });
    }

    if (
        (userType === 'manufacturer' && request.manufacturerId.toString() !== userId.toString()) ||
        (userType === 'distributor' && request.distributorId.toString() !== userId.toString())
    ) {
        return res.status(403).json({ msg: 'You do not have permission to access this request.' });
    }

    res.status(200).json({ data: request });
});


exports.getGoodsManufacturerPreviousRequestByName = asyncHandler(async (req, res) => {
    const { distributorName } = req.params;
    const userType = req.user.userType; 
    const userId = req.user._id; // Get user ID

    const requests = await GoodsManufacturersPreviousRequestModel.find({ distributorName: new RegExp(`^${distributorName}$`, "i") });

    //check if the request is null or undefined
    if (requests.length === 0) {
        return res.status(404).json({ msg: `No requests found for distributor name: ${distributorName}` });
    }

    const accessibleRequests = requests.filter((request) =>
        (userType === 'manufacturer' && request.manufacturerId.toString() === userId.toString()) ||
        (userType === 'distributor' && request.distributorId.toString() === userId.toString())
    );

    if (accessibleRequests.length === 0) {
        return res.status(403).json({ msg: 'You do not have permission to access these requests.' });
    }

    res.status(200).json({ data: accessibleRequests });
});


exports.createGoodsManufacturerPreviousRequest = asyncHandler(async (req, res) => {

    const {
        _id,
        shortId,
        manufacturerId,
        manufacturerName,
        distributorId,
        distributorName,
        goodsForDistributors,
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
    const goodsRequestData = {
        _id,
        shortId,
        manufacturerId,
        manufacturerName,
        distributorId,
        distributorName,
        goodsForDistributors,
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

    const goodsPreviousRequest = await GoodsManufacturersPreviousRequestModel.create(goodsRequestData);
    console.log('done here previous serves')
    res.status(201).json({ data: goodsPreviousRequest });
});


exports.updateGoodsManufacturerPreviousRequest = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id; // Get user ID
    const userType = req.user.userType; 
    const { status } = req.body;

    const request = await GoodsManufacturersPreviousRequestModel.findOne({ shortId: id });

    // Check if the request exists
    if (!request) {
        return res.status(404).json({ msg: `There is no Request for this id: ${id}` });
    }

    // Check if the user is associated with the request
    if (userType === 'manufacturer' && request.manufacturerId.toString() !== userId.toString()) {
        return res.status(403).json({ msg: 'You do not have permission to access this request.' });
    }

    const updatedRequest = await GoodsManufacturersPreviousRequestModel.findOneAndUpdate(
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


exports.deleteGoodsManufacturerPreviousRequest = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id; // Get user ID
    const userType = req.user.userType;

    // Find the request to check if it is related to the user
    const request = await GoodsManufacturersPreviousRequestModel.findOne({ shortId: id });

    //check if the request is null or undefined
    if (!request) {
        return res.status(404).json({ msg: `There is no Request for this id: ${id}` });
    }

    if (userType === 'manufacturer' && request.manufacturerId.toString() !== userId.toString()) {
        return res.status(403).json({ msg: 'Access denied: You do not have permission to delete this request.' });
    }

    //Delete request
    await GoodsManufacturersPreviousRequestModel.findOneAndDelete({ shortId: id });

    res.status(204).send();
});


exports.getGoodsPreviousRequestsforDistributor = asyncHandler(async (req, res) => {
    const userId = req.user._id; // Get user ID
    const userType = req.user.userType;
    const GoodsPreviousRequests = await GoodsManufacturersPreviousRequestModel.find({ distributorId: userId });
    res.status(200).json({ data: GoodsPreviousRequests });
});