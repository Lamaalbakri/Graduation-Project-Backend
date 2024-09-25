const slugify = require('slugify');
const asyncHandler = require('express-async-handler')
const RawMaterialRequestModel = require('../models/RawMaterialRequestModel');

exports.getRawMaterialRequest = (req, res) => {
    // const name = req.body.name;
    // console.log(req.body);
    res.send();
};


// create Raw Material Request  
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

//delete 
