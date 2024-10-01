const slugify = require('slugify');
const asyncHandler = require('express-async-handler')
const RawMaterialCurrentRequestModel = require('../models/rawMaterialCurrentRequestModel');
const mongoose = require('mongoose');

// @desc Get list of Raw Material Request 
// @route GET /api/v1/rawMaterialCurrentRequest
// @access Public
exports.getRawMaterialCurrentRequests = asyncHandler(async (req, res) => {
    // const page = req.query.page * 1 || 1;//To divide data into pages
    // const limit = req.query.limit * 1 || 5;//Number of data to appear on each page
    // const skip = (page - 1) * limit;//If I was on page  (2), I would skip the number of previous pages minus the page I am on multiplied by the number of data in it.

    const RawMaterialCurrentRequests = await RawMaterialCurrentRequestModel.find({});//.skip(skip).limit(limit)
    res.status(200).json({ data: RawMaterialCurrentRequests });//results: RawMaterialCurrentRequests.length, , page
});

// @desc Get Specific Raw Material Request by id
// @route GET /api/v1/rawMaterialCurrentRequest/:id
// @access Public
exports.getRawMaterialCurrentRequestById = asyncHandler(async (req, res) => {
    const { id } = req.params; // take id from / :id

    // تحقق مما إذا كان id فارغًا
    if (!id || id.trim() === '') {
        return res.status(400).json({ msg: 'ID is required.' });
    }

    // تحقق من أن الشورت ID يتوافق مع النمط المحدد
    const shortIdPattern = /^m[0-9a-z]{8}$/; // Regex for # followed by 8 characters (numbers or lowercase letters)

    // تحقق من أن ID مكون من 9 أحرف
    if (id.length !== 9 || !shortIdPattern.test(id)) {
        return res.status(400).json({ msg: `Invalid shortId format: ${id}` });
    }

    // البحث باستخدام shortId
    const request = await RawMaterialCurrentRequestModel.findOne({ shortId: id });

    // check if the request is null or undefined
    if (!request) {
        return res.status(404).json({ msg: `There is no Request for this id: ${id}` });
    }

    res.status(200).json({ data: request });
});


// @desc Get Specific Raw Material Request by manufacturer "slug"
// @route GET /api/v1/rawMaterialCurrentRequest/manufacturer/slug/:slug
// @access Public
exports.getRawMaterialCurrentRequestByMSlug = asyncHandler(async (req, res) => {
    const { slug } = req.params;//take  slug from / :slug

    const request = await RawMaterialCurrentRequestModel.findOne({ slug });

    //check if the request is null or undefined
    if (!request) {
        return res.status(404).json({ msg: `There is no Request for this manufacturer slug: ${slug}` });
    }
    res.status(200).json({ data: request });
});

// @desc Get Specific Raw Material Request by manufacturer name 
// @route GET /api/v1/rawMaterialCurrentRequest//manufacturerName/:manufacturerName
// @access Public
exports.getRawMaterialCurrentRequestByMName = asyncHandler(async (req, res) => {
    const { manufacturerName } = req.params;

    const request = await RawMaterialCurrentRequestModel.findOne({ manufacturerName: new RegExp(`^${manufacturerName}$`, "i") });

    //check if the request is null or undefined
    if (!request) {
        return res.status(404).json({ msg: `There is no Request for this manufacturer Name: ${manufacturerName}` });
    }
    res.status(200).json({ data: request });
});

// @desc Create Raw Material Request 
// @route POST /api/v1/rawMaterialCurrentRequest
// @access Public
exports.createRawMaterialCurrentRequest = asyncHandler(async (req, res) => {
    const manufacturerName = req.body.manufacturerName;
    const supplyingItems = req.body.supplyingItems;
    const quantity = req.body.quantity;
    const arrivalCity = req.body.arrivalCity;
    const price = req.body.price;
    const status = req.body.status;
    const notes = req.body.notes;
    const trackingInfo = req.body.trackingInfo;

    //Async Await Syntax 
    const RawMaterialCurrentRequest = await RawMaterialCurrentRequestModel.create({
        manufacturerName,
        supplyingItems,
        quantity,
        arrivalCity,
        price,
        status,
        notes,
        trackingInfo,
        slug: slugify(manufacturerName)
    });
    res.status(201).json({ data: RawMaterialCurrentRequest });

});


// @desc Update Specific Raw Material Request 
// @route PUT /api/v1/rawMaterialCurrentRequest/:id
// @access Private
exports.updateRawMaterialCurrentRequest = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const request = await RawMaterialCurrentRequestModel.findOneAndUpdate(
        { shortId: id },//identifier to find the request 
        { status },//the data will update
        { new: true }//to return data after ubdate
    );

    //check if the request is null or undefined
    if (!request) {
        return res.status(404).json({ msg: `There is no Request for this id: ${id}` });
    }
    res.status(200).json({ data: request });
});

// @desc Delete Specific Raw Material Request 
// @route DELETE /api/v1/rawMaterialCurrentRequest/:id
// @access Private
exports.deleteRawMaterialCurrentRequest = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const request = await RawMaterialCurrentRequestModel.findOneAndDelete({ shortId: id });
    //check if the request is null or undefined
    if (!request) {
        return res.status(404).json({ msg: `There is no Request for this id: ${id}` });
    }
    res.status(204).send();
});
