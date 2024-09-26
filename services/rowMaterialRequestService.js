const slugify = require('slugify');
const asyncHandler = require('express-async-handler')
const RawMaterialRequestModel = require('../models/RawMaterialRequestModel');
const mongoose = require('mongoose');

// @desc Get list of Raw Material Request 
// @route GET /api/v1/rawMaterialRequest
// @access Public
exports.getRawMaterialRequests = asyncHandler(async (req, res) => {
    const page = req.query.page * 1 || 1;//To divide data into pages
    const limit = req.query.limit * 1 || 5;//Number of data to appear on each page
    const skip = (page - 1) * limit;//If I was on page  (2), I would skip the number of previous pages minus the page I am on multiplied by the number of data in it.
    const RawMaterialRequests = await RawMaterialRequestModel.find({}).skip(skip).limit(limit);
    res.status(200).json({ results: RawMaterialRequests.length, page, data: RawMaterialRequests });
});

// @desc Get Specific Raw Material Request by id
// @route GET /api/v1/rawMaterialRequest/ :id
// @access Public
exports.getRawMaterialRequestById = asyncHandler(async (req, res) => {
    const { id } = req.params;//take id from / :id

    //Check if the id is valid as an ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ msg: 'Invalid ID format' });
    }
    const request = await RawMaterialRequestModel.findById(id);

    //check if the request is null or undefined
    if (!request) {
        return res.status(404).json({ msg: `There is no Request for this id: ${id}` });
    }
    res.status(200).json({ data: request });
});

// @desc Get Specific Raw Material Request by manufacturer name "slug"
// @route GET /api/v1/rawMaterialRequest/manufacturer/slug/:slug
// @access Public
exports.getRawMaterialRequestByMSlug = asyncHandler(async (req, res) => {
    const { slug } = req.params;//take  slug from / :slug

    const request = await RawMaterialRequestModel.findOne({ slug });

    //check if the request is null or undefined
    if (!request) {
        return res.status(404).json({ msg: `There is no Request for this manufacturer slug: ${slug}` });
    }
    res.status(200).json({ data: request });
});

// @desc Create Raw Material Request 
// @route POST /api/v1/rawMaterialRequest
// @access Public
exports.createRawMaterialRequest = asyncHandler(async (req, res) => {
    const manufacturerName = req.body.manufacturerName;
    const supplyingItems = req.body.supplyingItems;
    const quantity = req.body.quantity;
    const arrivalCity = req.body.arrivalCity;
    const price = req.body.price;
    const status = req.body.status;
    const notes = req.body.notes;
    const trackingInfo = req.body.trackingInfo;

    //Async Await Syntax 
    const RawMaterialRequest = await RawMaterialRequestModel.create({ manufacturerName, supplyingItems, quantity, arrivalCity, price, status, notes, trackingInfo, slug: slugify(manufacturerName) });
    res.status(201).json({ data: RawMaterialRequest });

});


// @desc Update Specific Raw Material Request 
// @route PUT /api/v1/rawMaterialRequest/:id
// @access Private
exports.updateRawMaterialRequest = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const request = await RawMaterialRequestModel.findOneAndUpdate(
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
// @route DELETE /api/v1/rawMaterialRequest/:id
// @access Private
exports.deleteRawMaterialRequest = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const request = await RawMaterialRequestModel.findByIdAndDelete(id);

    //check if the request is null or undefined
    if (!request) {
        return res.status(404).json({ msg: `There is no Request for this id: ${id}` });
    }
    res.status(204).send();
});
