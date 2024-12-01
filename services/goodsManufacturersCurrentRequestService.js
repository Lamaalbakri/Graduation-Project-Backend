const asyncHandler = require('express-async-handler')
const GoodsManufacturersCurrentRequestModel = require('../models/goodsManufacturersCurrentRequestModel');
const ManageGoodsManufacturerModel = require('../models/ManageGoodsManufacturerModel');

exports.getGoodsManufacturerCurrentRequests = asyncHandler(async (req, res) => {

    const userType = req.user.userType;
    const userId = req.user._id;

    // Filter requests based on userType
    const filter = userType === 'distributor' ? { distributorId: userId } : { manufacturerId: userId };


    const GoodsCurrentRequests = await GoodsManufacturersCurrentRequestModel.find(filter);
    res.status(200).json({ data: GoodsCurrentRequests });
});


exports.getGoodsManufacturerCurrentRequestById = asyncHandler(async (req, res) => {
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
    const request = await GoodsManufacturersCurrentRequestModel.findOne({ shortId: id });

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


exports.getGoodsManufacturerCurrentRequestByMSlug = asyncHandler(async (req, res) => {
    const { slug } = req.params;//take  slug from / :slug
    const userType = req.user.userType;
    const userId = req.user._id; // Get user ID

    const request = await GoodsManufacturersCurrentRequestModel.findOne({ slug });

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


exports.getGoodsManufacturerCurrentRequestByName = asyncHandler(async (req, res) => {
    const { distributorName } = req.params;
    const userType = req.user.userType;
    const userId = req.user._id; // Get user ID

    const requests = await GoodsManufacturersCurrentRequestModel.find({ distributorName: new RegExp(`^${distributorName}$`, "i") });

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


exports.createGoodsManufacturerCurrentRequest = asyncHandler(async (req, res) => {
    const userId = req.user._id; // Get user ID
    const userType = req.user.userType;

    if (userType !== 'distributor') {
        return res.status(403).json({ msg: 'Access denied: Only distributors can create goods requests.' });
    }

    const manufacturerId = req.body.manufacturerId;
    const manufacturerName = req.body.manufacturerName;
    const distributorName = req.body.distributorName;
    const goodsForDistributors = req.body.goodsForDistributors;
    const subtotal_items = req.body.subtotal_items;
    const shipping_cost = req.body.shipping_cost;
    const total_price = req.body.total_price;
    const payment_method = req.body.payment_method;
    const status = req.body.status || 'pending';
    const arrivalAddress = req.body.arrivalAddress;
    const departureAddress = req.body.departureAddress || null;
    const transporterId = req.body.transporterId || null;
    const transporterName = req.body.transporterName || '';
    const estimated_delivery_date = req.body.estimated_delivery_date || null;
    const actual_delivery_date = req.body.actual_delivery_date || null;
    const notes = req.body.notes || '';
    const tracking_number = req.body.tracking_number || '';
    const transportRequest_id = req.body.transportRequest_id || '';
    const contract_id = req.body.contract_id || ''

    // Check the available quantity before proceeding to create the order
    const insufficientItems = [];
    for (let i = 0; i < goodsForDistributors.length; i++) {
        const item = goodsForDistributors[i];
        const goods = await ManageGoodsManufacturerModel.findOne({ _id: item.goods_id, manufacturerId: manufacturerId });
        if (!goods || goods.quantity < item.quantity) {
            // If the quantity requested is greater than the quantity available
            insufficientItems.push({
                goodsName: item.goods_name,
                requestedQuantity: item.quantity,
                availableQuantity: goods ? goods.quantity : 0
            });
        }
    }

    if (insufficientItems.length > 0) {
        return res.status(400).json({ error: 'Some items are unavailable or have insufficient stock.', insufficientItems });
    }


    // Check quantity before updating using Optimistic Locking
    for (let i = 0; i < goodsForDistributors.length; i++) {

        const item = goodsForDistributors[i];
        const goods = await ManageGoodsManufacturerModel.findOne({ _id: item.goods_id, manufacturerId: manufacturerId });
        if (goods && goods.quantity >= item.quantity) {

            // Update quantity by checking version
            const updateGoods = await ManageGoodsManufacturerModel.findOneAndUpdate(
                {
                    _id: item.goods_id,
                    manufacturerId: manufacturerId,
                    quantity: { $gte: item.quantity },
                },
                {
                    $inc: {
                        quantity: -item.quantity,
                        version: 1
                    }
                },
                { new: true }
            );

            if (!updateGoods) {
                console.log('Data has been updated by another user.');
                return res.status(400).json({
                    error: 'Data has been updated by another user, please try again.'
                });
            }
        }
    }

    //Async Await Syntax 
    const GoodsManufacturerCurrentRequest = await GoodsManufacturersCurrentRequestModel.create({
        manufacturerId,
        manufacturerName,
        distributorId: userId,
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
    });

    res.status(201).json({ data: GoodsManufacturerCurrentRequest });

});


exports.updateGoodsManufacturerCurrentRequest = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id; // Get user ID
    const userType = req.user.userType;
    const { status } = req.body;

    // Find the request to check if it is related to the user
    const request = await GoodsManufacturersCurrentRequestModel.findOne({ shortId: id });

    // Check if the request exists
    if (!request) {
        return res.status(404).json({ msg: `There is no Request for this id: ${id}` });
    }

    // Check if the user is associated with the request
    if (userType === 'manufacturer' && request.manufacturerId.toString() !== userId.toString()) {
        return res.status(403).json({ msg: 'You do not have permission to access this request.' });
    }

    const updatedRequest = await GoodsManufacturersCurrentRequestModel.findOneAndUpdate(
        { shortId: id },//identifier to find the request 
        { status },//the data will update
        { new: true }//to return data after ubdate
    );

    res.status(200).json({ data: updatedRequest });
});


exports.deleteGoodsManufacturerCurrentRequest = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Find the request to check if it is related to the user
    const request = await GoodsManufacturersCurrentRequestModel.findOne({ shortId: id });

    //check if the request is null or undefined
    if (!request) {
        return res.status(404).json({ msg: `There is no Request for this id: ${id}` });
    }

    //Delete request
    await GoodsManufacturersCurrentRequestModel.findOneAndDelete({ shortId: id });

    res.status(204).send();
});


exports.getGoodsCurrentRequestsforDistributor = asyncHandler(async (req, res) => {
    const userId = req.user._id; // Get user ID
    const userType = req.user.userType;
    const GoodsCurrentRequests = await GoodsManufacturersCurrentRequestModel.find({ distributorId: userId });
    res.status(200).json({ data: GoodsCurrentRequests });
});