const slugify = require('slugify');
const asyncHandler = require('express-async-handler')
const RawMaterialPreviousRequestModel = require('../models/rawMaterialPreviousRequestModel');
const mongoose = require('mongoose');

// @desc Get list of Raw Material Request 
// @route GET /api/v1/rawMaterialPreviousRequest
// @access Public
exports.getRawMaterialPreviousRequests = asyncHandler(async (req, res) => {
    // const page = req.query.page * 1 || 1;//To divide data into pages
    // const limit = req.query.limit * 1 || 5;//Number of data to appear on each page
    // const skip = (page - 1) * limit;//If I was on page  (2), I would skip the number of previous pages minus the page I am on multiplied by the number of data in it.

    const RawMaterialPreviousRequests = await RawMaterialPreviousRequestModel.find({});//.skip(skip).limit(limit)
    res.status(200).json({ data: RawMaterialPreviousRequests });//results: RawMaterialPreviousRequests.length, , page
});

// @desc Get Specific Raw Material Request by id
// @route GET /api/v1/rawMaterialPreviousRequest/ :id
// @access Public
exports.getRawMaterialPreviousRequestById = asyncHandler(async (req, res) => {
    const { id } = req.params;//take id from / :id

    //Check if the id is valid as an ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ msg: 'Invalid ID format' });
    }
    const request = await RawMaterialPreviousRequestModel.findById(id);

    //check if the request is null or undefined
    if (!request) {
        return res.status(404).json({ msg: `There is no Request for this id: ${id}` });
    }
    res.status(200).json({ data: request });
});

// @desc Get Specific Raw Material Request by manufacturer name "slug"
// @route GET /api/v1/rawMaterialPreviousRequest/manufacturer/slug/:slug
// @access Public
exports.getRawMaterialPreviousRequestByMSlug = asyncHandler(async (req, res) => {
    const { slug } = req.params;//take  slug from / :slug

    const request = await RawMaterialPreviousRequestModel.findOne({ slug });

    //check if the request is null or undefined
    if (!request) {
        return res.status(404).json({ msg: `There is no Request for this manufacturer slug: ${slug}` });
    }
    res.status(200).json({ data: request });
});

// @desc Get Specific Raw Material Request by manufacturer name 
// @route GET /api/v1/rawMaterialPreviousRequest/manufacturerName/:manufacturerName
// @access Public
exports.getRawMaterialPreviousRequestByMName = asyncHandler(async (req, res) => {
    const { manufacturerName } = req.params;

    const request = await RawMaterialPreviousRequestModel.findOne({ manufacturerName: new RegExp(`^${manufacturerName}$`, "i") });

    //check if the request is null or undefined
    if (!request) {
        return res.status(404).json({ msg: `There is no Request for this manufacturer Name: ${manufacturerName}` });
    }
    res.status(200).json({ data: request });
});

// @desc Create Raw Material Request 
// @route POST /api/v1/rawMaterialPreviousRequest
// @access Public
exports.createRawMaterialPreviousRequest = asyncHandler(async (req, res) => {
    const {
        _id,
        manufacturerName,
        supplyingItems,
        quantity,
        arrivalCity,
        price,
        status,
        notes,
        trackingInfo
    } = req.body;

    //Async Await Syntax 
    const rawMaterialRequestData = {
        manufacturerName,
        supplyingItems,
        quantity,
        arrivalCity,
        price,
        status,
        notes,
        trackingInfo,
        slug: slugify(manufacturerName),
    };

    // إذا كان الـ _id موجودًا، نضيفه إلى البيانات المرسلة
    if (_id) {
        rawMaterialRequestData._id = _id;
    }

    const RawMaterialPreviousRequest = await RawMaterialPreviousRequestModel.create(rawMaterialRequestData);
    res.status(201).json({ data: RawMaterialPreviousRequest });
});


// @desc Update Specific Raw Material Request 
// @route PUT /api/v1/rawMaterialPreviousRequest/:id
// @access Private
exports.updateRawMaterialPreviousRequest = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const request = await RawMaterialPreviousRequestModel.findOneAndUpdate(
        { _id: id },//identifier to find the request 
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
// @route DELETE /api/v1/rawMaterialPreviousRequest/:id
// @access Private
exports.deleteRawMaterialPreviousRequest = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const request = await RawMaterialPreviousRequestModel.findByIdAndDelete(id);

    //check if the request is null or undefined
    if (!request) {
        return res.status(404).json({ msg: `There is no Request for this id: ${id}` });
    }
    res.status(204).send();
});
