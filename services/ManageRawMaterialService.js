const RawMaterialModel = require('../models/ManageRawMaterialModel');
const slugify = require('slugify');
const asyncHandler = require('express-async-handler')
const Supplier = require('../models/suppliersModel')

/* in each function i used try catch block. it is good for error handling because we can send different types of
error like 400, 401. 404,500 etc. each error has particular meaning and it is good to handle in frontend. we can know looking at this status what kind of error it is. only in getMaterials and getMaterialById try block is not used. we can use it here too. i have also received data in three controllers below in body. body is considered more secure coz params are seen in address bar*/



// @desc get ManageRawMaterial
// @route PIST /api/v1/ManageRawMaterial
// @accesss punlic
exports.getMaterials = asyncHandler(async (req, res) => {

  const materials = await RawMaterialModel.find({});
  res.status(200).json({ results: materials.length, data: materials });
});

// @desc    Get specific Material  by id
// @route   GET /api/v1/ManageRawMaterial/:id
// @access  Public
exports.getMaterialById = asyncHandler(async (req, res) => {
  // const { id } = req.params;
  // const material = await RawMaterialModel.findById(id);
  // if (!material) {
  //   res.status(404).json({ msg: `No material for this id ${id}` });
  // }
  // res.status(200).json({ data: material });
  const { id } = req.params; // take id from / :id

  // تحقق مما إذا كان id فارغًا
  if (!id || id.trim() === '') {
    return res.status(400).json({ msg: 'ID is required.' });
  }

  // تحقق من أن الشورت ID يتوافق مع النمط المحدد
  const shortIdPattern = /^[0-9a-z]{8}$/; // Regex for exactly 8 digits

  // تحقق من أن ID مكون من 9 أحرف
  if (id.length !== 8 || !shortIdPattern.test(id)) {
    return res.status(400).json({ msg: `Invalid shortId format: ${id}` });
  }

  // البحث باستخدام shortId
  const material = await RawMaterialModel.findOne({ shortId: id });

  // check if the request is null or undefined
  if (!material) {
    return res.status(404).json({ msg: `There is no Material for this id: ${id}` });
  }

  res.status(200).json({ data: material });
});


// @desc Get Specific Material by material name 
// @route GET /api/v1/manageRawMaterial/materialName/:name
// @access Public
exports.getMaterialByNameOrId = async (req, res) => {
  const { query } = req.params; // Get query from route parameters

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

  console.log('createMaterial', req.body);

  // req.body.slug = slugify(req.body.name);
  // console.log('createMaterial',req.body);

  // const material = await RawMaterialModel.create(req.body);
  // res.status(201).json({ data: material });
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

    // Update the user's addresses list with the new address ID
    await Supplier.findByIdAndUpdate(
      userId,
      { $addToSet: { rawMaterialList: material._id } }, // استخدم $addToSet لتجنب التكرار
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
  console.log('updateMaterial', req.body);

  try {
    const material = await RawMaterialModel.findOneAndUpdate(
      { shortId }, req.body, { new: true }
    );

    if (!material) {
      res.status(404).json({ msg: `No Material for this id ${shortId}` });
    }
    res.status(200).json({ success: true, data: material });

  } catch (error) {
    console.error('Error updating material:', error);
    res.status(500).json({ message: 'Error adding material', error });
  }
};

// @desc    Delete specific RawMaterial
// @route   DELETE /api/v1/ManageRawMaterial/:id
// @access  Private
exports.deleteRawMaterial = async (req, res) => {
  console.log('deleteRawMaterialbody', req.body);
  const shortId = req.body.data.shortId;

  console.log('deleteRawMaterial', req.body.data.shortId);


  try {
    // Ensure you're querying by the correct field. Assuming shortId is the field name in your DB:
    const material = await RawMaterialModel.findOneAndDelete({ shortId });

    if (!material) {
      return res.status(404).json({ message: `No Material found with shortId ${shortId}` });
    }

    return res.status(200).json({ success: true, msg: 'Material successfully deleted' }); // Changed status to 200
  } catch (error) {
    console.error('Error deleting material:', error);
    return res.status(500).json({ message: 'Error deleting material', error });
  }
};


