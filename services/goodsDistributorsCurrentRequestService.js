const asyncHandler = require('express-async-handler')
const GoodsDistributorsCurrentRequestModel = require('../models/goodsDistributorsCurrentRequestModel');
const ManageGoodsDistributorModel = require('../models/ManageGoodsDistributorModel');

exports.getGoodsDistributorCurrentRequests = asyncHandler(async (req, res) => {

    const userType = req.user.userType;
    const userId = req.user._id;

    // Filter requests based on userType
    const filter = userType === 'retailer' ? { retailerId: userId } : { distributorId: userId };


    const GoodsCurrentRequests = await GoodsDistributorsCurrentRequestModel.find(filter);
    res.status(200).json({ data: GoodsCurrentRequests });
});


exports.getGoodsDistributorCurrentRequestById = asyncHandler(async (req, res) => {
    const { id } = req.params; // take id from / :id
    const userType = req.user.userType;
    const userId = req.user._id;

    //check if id is empty
    if (!id || id.trim() === '') {
        return res.status(400).json({ msg: 'ID is required.' });
    }

    // Check that the short ID matches the specified pattern.
    const shortIdPattern = /^r[0-9a-z]{8}$/; // Regex for # followed by 8 characters (numbers or lowercase letters)

    // Check that the ID is 9 characters long.
    if (id.length !== 9 || !shortIdPattern.test(id)) {
        return res.status(400).json({ msg: `Invalid shortId format: ${id}` });
    }

    // Search using shortId
    const request = await GoodsDistributorsCurrentRequestModel.findOne({ shortId: id });

    // check if the request is null or undefined
    if (!request) {
        return res.status(404).json({ msg: `There is no Request for this id: ${id}` });
    }

    const hasAccess =
        (userType === 'distributor' && request.distributorId.toString() === userId.toString()) ||
        (userType === 'retailer' && request.retailerId.toString() === userId.toString());

    if (!hasAccess) {
        return res.status(401).json({ msg: 'You do not have permission to access this request.' });
    }

    res.status(200).json({ data: request });
});


exports.getGoodsDistributorCurrentRequestByMSlug = asyncHandler(async (req, res) => {
    const { slug } = req.params;//take  slug from / :slug
    const userType = req.user.userType; 
    const userId = req.user._id; // Get user ID

    const request = await GoodsDistributorsCurrentRequestModel.findOne({ slug });

    //check if the request is null or undefined
    if (!request) {
        return res.status(404).json({ msg: `There is no Request for this retailer slug: ${slug}` });
    }

    if (
        (userType === 'distributor' && request.distributorId.toString() !== userId.toString()) ||
        (userType === 'retailer' && request.retailerId.toString() !== userId.toString())
    ) {
        return res.status(403).json({ msg: 'You do not have permission to access this request.' });
    }

    res.status(200).json({ data: request });
});


exports.getGoodsDistributorCurrentRequestByName = asyncHandler(async (req, res) => {
    const { distributorName } = req.params;
    const userType = req.user.userType; 
    const userId = req.user._id; // Get user ID

    const requests = await GoodsDistributorsCurrentRequestModel.find({ distributorName: new RegExp(`^${distributorName}$`, "i") });

    //check if the request is null or undefined
    if (requests.length === 0) {
        return res.status(404).json({ msg: `No requests found for retailer name: ${distributorName}` });
    }

    const accessibleRequests = requests.filter((request) =>
        (userType === 'distributor' && request.distributorId.toString() === userId.toString()) ||
        (userType === 'retailer' && request.retailerId.toString() === userId.toString())
    );

    if (accessibleRequests.length === 0) {
        return res.status(403).json({ msg: 'You do not have permission to access these requests.' });
    }

    res.status(200).json({ data: accessibleRequests });
});


exports.createGoodsDistributorCurrentRequest = asyncHandler(async (req, res) => {
    const userId = req.user._id; // Get user ID
    const userType = req.user.userType; 

    if (userType !== 'retailer') {
        return res.status(403).json({ msg: 'Access denied: Only retailers can create goods requests.' });
    }

    const distributorId = req.body.distributorId;
    const distributorName = req.body.distributorName;
    const retailerName = req.body.retailerName;
    const goodsForRetailers = req.body.goodsForRetailers;
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
    for (let i = 0; i < goodsForRetailers.length; i++) {
        const item = goodsForRetailers[i];
        const goods = await ManageGoodsDistributorModel.findOne({ _id: item.goods_id, distributorId: distributorId });
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
    for (let i = 0; i < goodsForRetailers.length; i++) {

        const item = goodsForRetailers[i];
        const goods = await ManageGoodsDistributorModel.findOne({ _id: item.goods_id, distributorId: distributorId });
        if (goods && goods.quantity >= item.quantity) {
            console.log(item.quantity)

            // Update quantity by checking version
            const updateGoods = await ManageGoodsDistributorModel
            .findOneAndUpdate(
                {
                    _id: item.goods_id,
                    distributorId: distributorId,
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
            console.log('Checking optimistic locking...');
            if (!updateGoods) {
                console.log('Data has been updated by another user.');
                return res.status(400).json({
                    error: 'Data has been updated by another user, please try again.'
                });
            }
        }
    }

    //Async Await Syntax 
    const GoodsDistributorCurrentRequest = await GoodsDistributorsCurrentRequestModel.create({
        distributorId,
        distributorName,
        retailerId: userId,
        retailerName,
        goodsForRetailers,
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

    res.status(201).json({ data: GoodsDistributorCurrentRequest });

});


exports.updateGoodsDistributorCurrentRequest = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id; // Get user ID
    const userType = req.user.userType; 
    const { status } = req.body;
    console.log("Sending request to update status:", status, id);
    // Find the request to check if it is related to the user
    const request = await GoodsDistributorsCurrentRequestModel.findOne({ shortId: id });
    console.log(request)
    // Check if the request exists
    if (!request) {
        return res.status(404).json({ msg: `There is no Request for this id: ${id}` });
    }

    // Check if the user is associated with the request
    if (userType === 'distributor' && request.distributorId.toString() !== userId.toString()) {
        return res.status(403).json({ msg: 'You do not have permission to access this request.' });
    }

    const updatedRequest = await GoodsDistributorsCurrentRequestModel.findOneAndUpdate(
        { shortId: id },//identifier to find the request 
        { status },//the data will update
        { new: true }//to return data after ubdate
    );

    res.status(200).json({ data: updatedRequest });
});


exports.deleteGoodsDistributorCurrentRequest = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Find the request to check if it is related to the user
    const request = await GoodsDistributorsCurrentRequestModel.findOne({ shortId: id });

    //check if the request is null or undefined
    if (!request) {
        return res.status(404).json({ msg: `There is no Request for this id: ${id}` });
    }

    //Delete request
    await GoodsDistributorsCurrentRequestModel.findOneAndDelete({ shortId: id });

    res.status(204).send();
});


exports.getGoodsCurrentRequestsforRetalier = asyncHandler(async (req, res) => {
    const userId = req.user._id; // Get user ID
    const userType = req.user.userType;
    const GoodsCurrentRequests = await GoodsDistributorsCurrentRequestModel.find({ retailerId: userId });
    res.status(200).json({ data: GoodsCurrentRequests });
});