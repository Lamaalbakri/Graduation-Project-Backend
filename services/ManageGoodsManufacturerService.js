const GoodsManufacturerModel = require('../models/ManageGoodsManufacturerModel');
const asyncHandler = require('express-async-handler')
const Manufacturer = require('../models/manufacturersModel');
const Distributor = require('../models/distributorsModel')

exports.getGoodsForListOfManufacturer = asyncHandler(async (req, res) => {
  const userId = req.user._id; // Retrieve user ID from token
  const userType = req.user.userType; // Retrieve user type from token
  if (userType !== 'distributor') {
    return res.status(403).json({ message: "Unauthorized access" });
  }
  // Find the distributor by user ID
  const distributor = await Distributor.findById(userId)
    .select('manufacturersList')
    .populate({
      path: 'manufacturersList',
      select: 'full_name _id'
    });

  if (!distributor) {
    res.status(404);
    throw new Error('Distributor not found');
  }

  // Fetch goods associated with the manufacturers
  const goods = await GoodsManufacturerModel.find({
    manufacturerId: { $in: distributor.manufacturersList.map(manufacturer => manufacturer._id) }
  }).populate({
    path: 'manufacturerId',
    select: 'full_name _id'
  });

  res.status(200).json({ results: goods.length, data: goods });
});


exports.getGoods = asyncHandler(async (req, res) => {
  const userId = req.user._id; // Retrieve user ID from token

  const goods = await GoodsManufacturerModel.find({ manufacturerId: userId });
  res.status(200).json({ results: goods.length, data: goods });
});


exports.getGoodsById = asyncHandler(async (req, res) => {
  const { id } = req.params; // take id from / :id
  const userType = req.user.userType;
  const userId = req.user._id;

  if (!id || id.trim() === '') {
    return res.status(400).json({ msg: 'ID is required.' });
  }

  const shortIdPattern = /^[0-9a-z]{8}$/; // Regex for exactly 8 digits

  if (id.length !== 8 || !shortIdPattern.test(id)) {
    return res.status(400).json({ msg: `Invalid shortId format: ${id}` });
  }

  const goods = await GoodsManufacturerModel.findOne({ shortId: id });

  // check if the request is null or undefined
  if (!goods) {
    return res.status(404).json({ msg: `There is no goods for this id: ${id}` });
  }
  const hasAccess =
    (userType === 'manufacturer' && goods.manufacturerId.toString() === userId.toString());

  if (!hasAccess) {
    return res.status(401).json({ msg: 'You do not have permission to get the result.' });
  }

  res.status(200).json({ data: goods });
});


exports.getGoodsByNameOrId = async (req, res) => {
  const { query } = req.params; // Get query from route parameters
  const userType = req.user.userType;
  const userId = req.user._id; // Get user ID

  try {
    // Use findOne to get a single goods that matches the name or shortId
    const goods = await GoodsManufacturerModel.findOne({
      $or: [
        { name: new RegExp(`^${query}$`, "i") },
        { shortId: query }
      ]
    });

    if (!goods) {
      return res.status(404).json({ message: `There is no goods for this query: ${query}` });
    }

    if (userType === 'manufacturer' && goods.manufacturerId.toString() !== userId.toString()) {
      return res.status(403).json({ msg: 'You do not have permission to get this goods.' });
    }

    res.status(200).json({ success: true, data: goods });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching goods', error });
  }
};


exports.createGoods = async (req, res) => {
  const userId = req.user._id; // Retrieve user ID from token
  const userType = req.user.userType; // Retrieve user type from token

  try {
    const { name, quantity, description, storageInfo, price, image, goodsOption, units } = req.body;
    const goods = new GoodsManufacturerModel({
      name,
      quantity,
      description,
      storageInfo,
      manufacturerId: userId,
      price,
      image,
      goodsOption,
      units
    });

    await Manufacturer.findByIdAndUpdate(
      userId,
      { $addToSet: { manufacturerGoodsList: goods._id } },
      { new: true }
    );
    await goods.save();
    res.status(201).json({ success: true, message: 'Goods added successfully', data: goods });

  } catch (error) {
    res.status(500).json({ message: 'Error adding goods', error });
  }
};


exports.updateGoods = async (req, res) => {
  const { shortId } = req.body;
  const userId = req.user._id; // Get user ID
  const userType = req.user.userType;

  try {
    const goods = await GoodsManufacturerModel.findOne({ shortId });
    if (!goods) {
      res.status(404).json({ msg: `No goods for this id ${shortId}` });
    }
    // Check if the user is associated with the request
    if (userType === 'manufacturer' && goods.manufacturerId.toString() !== userId.toString()) {
      return res.status(403).json({ msg: 'You do not have permission to update this goods.' });
    }
    const updateGoods = await GoodsManufacturerModel.findOneAndUpdate(
      { shortId }, req.body, { new: true }
    );

    res.status(200).json({ success: true, data: updateGoods });

  } catch (error) {
    res.status(500).json({ message: 'Error adding goods', error });
  }
};


exports.deleteGoods = async (req, res) => {
  const shortId = req.body.data.shortId;
  const userId = req.user._id; // Get user ID
  const userType = req.user.userType;

  try {
    // Ensure you're querying by the correct field. Assuming shortId is the field name in your DB:
    const goods = await GoodsManufacturerModel.findOne({ shortId });

    if (!goods) {
      return res.status(404).json({ message: `No goods found with shortId ${shortId}` });
    }
    if (userType === 'manufacturer' && goods.manufacturerId.toString() !== userId.toString()) {
      return res.status(403).json({ msg: 'Access denied: You do not have permission to delete this goods.' });
    }

    //delete after check permission 
    await GoodsManufacturerModel.findOneAndDelete({ shortId });

    return res.status(200).json({ success: true, msg: 'Goods successfully deleted' }); // Changed status to 200
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting goods', error });
  }
};