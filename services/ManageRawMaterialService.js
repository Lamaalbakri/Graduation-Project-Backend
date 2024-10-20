const RawMaterialModel = require('../models/ManageRawMaterialModel');
const slugify = require('slugify');
const asyncHandler = require('express-async-handler')


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
exports.getMaterialByName = asyncHandler(async (req, res) => {
  const { name } = req.params;

  const material = await RawMaterialModel.findOne({ name: new RegExp(`^${name}$`, "i") });

  //check if the request is null or undefined
  if (!material) {
    return res.status(404).json({ msg: `There is no raw material for this Name: ${name}` });
  }
  res.status(200).json({ data: material });
});

// @desc create ManageRawMaterial
// @route PIST /api/v1/ManageRawMaterial
// @accesss Privete
exports.createMaterial = asyncHandler(async (req, res) => {
  req.body.slug = slugify(req.body.name);
  const material = await RawMaterialModel.create(req.body);
  res.status(201).json({ data: material });

});

// @desc    Update specific RawMaterial
// @route   PUT /api/v1/ManageRawMaterial/:id
// @access  Private
exports.updateMaterial = asyncHandler(async (req, res) => {
  const { id } = req.params;
  req.body.slug = slugify(req.body.name);

  const material = await RawMaterialModel.findOneAndUpdate(
    { shortId: id }, req.body, { new: true }
  );

  if (!material) {
    res.status(404).json({ msg: `No Material for this id ${id}` });
  }
  res.status(200).json({ data: material });
});

// @desc    Delete specific RawMaterial
// @route   DELETE /api/v1/ManageRawMaterial/:id
// @access  Private
exports.deleteRawMaterial = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const material = await RawMaterialModel.findOneAndDelete({ shortId: id });

  if (!material) {
    res.status(404).json({ msg: `No Material for this id ${id}` });
  }
  res.status(204).send();
});


