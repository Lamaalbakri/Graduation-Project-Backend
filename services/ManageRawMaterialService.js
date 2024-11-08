const RawMaterialModel = require('../models/ManageRawMaterialModel');
const asyncHandler = require('express-async-handler')
const Supplier = require('../models/suppliersModel')
const Manufacturer = require('../models/manufacturersModel');

/* in each function i used try catch block. it is good for error handling because we can send different types of
error like 400, 401. 404,500 etc. each error has particular meaning and it is good to handle in frontend. we can know looking at this status what kind of error it is. only in getMaterials and getMaterialById try block is not used. we can use it here too. i have also received data in three controllers below in body. body is considered more secure coz params are seen in address bar*/


// @desc get MaterialForListOfSupplier
// @route Post /api/v1/ManageRawMaterial
// @accesss punlic
exports.getMaterialForListOfSupplier = asyncHandler(async (req, res) => {
  const userId = req.user._id; // Retrieve user ID from token
  const userType = req.user.userType; // Retrieve user type from token
  if (userType !== 'manufacturer') {
    return res.status(403).json({ message: "Unauthorized access" });
  }
  // Find the manufacturer by user ID
  const manufacturer = await Manufacturer.findById(userId)
    .select('suppliersList')
    .populate({
      path: 'suppliersList',
      select: 'full_name _id' // جلب الحقول المطلوبة فقط
    });

  console.log(manufacturer);
  if (!manufacturer) {
    res.status(404);
    throw new Error('Manufacturer not found');
  }

  // Fetch raw materials associated with the suppliers
  const materials = await RawMaterialModel.find({
    supplierId: { $in: manufacturer.suppliersList.map(supplier => supplier._id) }
  }).populate({
    path: 'supplierId',
    select: 'full_name _id' // جلب الحقول المطلوبة فقط
  });

  res.status(200).json({ results: materials.length, data: materials });
});

// @desc get ManageRawMaterial
// @route PIST /api/v1/ManageRawMaterial
// @accesss punlic
exports.getMaterials = asyncHandler(async (req, res) => {
  const userId = req.user._id; // Retrieve user ID from token
  const userType = req.user.userType; // Retrieve user type from token

  const materials = await RawMaterialModel.find({ supplierId: userId });
  res.status(200).json({ results: materials.length, data: materials });
});

// @desc Get specific Material  by id
// @route GET /api/v1/ManageRawMaterial/:id
// @access Public
exports.getMaterialById = asyncHandler(async (req, res) => {
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

  const material = await RawMaterialModel.findOne({ shortId: id });

  // check if the request is null or undefined
  if (!material) {
    return res.status(404).json({ msg: `There is no Material for this id: ${id}` });
  }
  const hasAccess =
    (userType === 'supplier' && material.supplierId.toString() === userId.toString());

  if (!hasAccess) {
    return res.status(401).json({ msg: 'You do not have permission to get the result.' });
  }

  res.status(200).json({ data: material });
});


// @desc Get Specific Material by material name 
// @route GET /api/v1/manageRawMaterial/materialName/:name
// @access Public
exports.getMaterialByNameOrId = async (req, res) => {
  const { query } = req.params; // Get query from route parameters
  const userType = req.user.userType; // Get user type (supplier or manufacturer)
  const userId = req.user._id; // Get user ID

  try {
    // Use findOne to get a single material that matches the name or shortId
    const material = await RawMaterialModel.findOne({
      $or: [
        { name: new RegExp(`^${query}$`, "i") },
        { shortId: query }
      ]
    });

    if (!material) {
      return res.status(404).json({ message: `There is no raw material for this query: ${query}` });
    }

    // Check if the user is the supplier or manufacturer associated with the order
    if (userType === 'supplier' && material.supplierId.toString() !== userId.toString()) {
      return res.status(403).json({ msg: 'You do not have permission to get this material.' });
    }

    res.status(200).json({ success: true, data: material });
  } catch (error) {
    console.error('Error fetching material:', error);
    res.status(500).json({ message: 'Error fetching material', error });
  }
};
// @desc create ManageRawMaterial
// @route PIST /api/v1/ManageRawMaterial
// @accesss Privete
exports.createMaterial = async (req, res) => {
  const userId = req.user._id; // Retrieve user ID from token
  const userType = req.user.userType; // Retrieve user type from token

  try {
    const { name, quantity, description, storageInfo, price, image, materialOption, units } = req.body;
    const material = new RawMaterialModel({
      name,
      quantity,
      description,
      storageInfo,
      supplierId: userId,
      price,
      image,
      materialOption, // Add materialOption to the model
      units // Add units to the model
    });

    // Update the Supplier's raw Material list with the new raw Material ID
    await Supplier.findByIdAndUpdate(
      userId,
      { $addToSet: { rawMaterialList: material._id } },
      { new: true }
    );
    await material.save();
    res.status(201).json({ success: true, message: 'Raw material added successfully', data: material });

  } catch (error) {
    console.error('Error adding material:', error);
    res.status(500).json({ message: 'Error adding material', error });
  }
};

// @desc    Update specific RawMaterial
// @route   PUT /api/v1/ManageRawMaterial/:id
// @access  Private
exports.updateMaterial = async (req, res) => {
  const { shortId } = req.body;
  const userId = req.user._id; // Get user ID
  const userType = req.user.userType;

  try {
    const material = await RawMaterialModel.findOne({ shortId });
    if (!material) {
      res.status(404).json({ msg: `No Material for this id ${shortId}` });
    }
    // Check if the user is associated with the request
    if (userType === 'supplier' && material.supplierId.toString() !== userId.toString()) {
      return res.status(403).json({ msg: 'You do not have permission to update this material.' });
    }
    const updateMaterial = await RawMaterialModel.findOneAndUpdate(
      { shortId }, req.body, { new: true }
    );

    res.status(200).json({ success: true, data: updateMaterial });

  } catch (error) {
    console.error('Error updating material:', error);
    res.status(500).json({ message: 'Error adding material', error });
  }
};

// @desc    Delete specific RawMaterial
// @route   DELETE /api/v1/ManageRawMaterial/:id
// @access  Private
exports.deleteRawMaterial = async (req, res) => {
  const shortId = req.body.data.shortId;
  const userId = req.user._id; // Get user ID
  const userType = req.user.userType;


  try {
    // Ensure you're querying by the correct field. Assuming shortId is the field name in your DB:
    const material = await RawMaterialModel.findOne({ shortId });

    if (!material) {
      return res.status(404).json({ message: `No Material found with shortId ${shortId}` });
    }
    if (userType === 'supplier' && material.supplierId.toString() !== userId.toString()) {
      return res.status(403).json({ msg: 'Access denied: You do not have permission to delete this material.' });
    }

    //delete after check permission 
    await RawMaterialModel.findOneAndDelete({ shortId });

    return res.status(200).json({ success: true, msg: 'Material successfully deleted' }); // Changed status to 200
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting material', error });
  }
};


