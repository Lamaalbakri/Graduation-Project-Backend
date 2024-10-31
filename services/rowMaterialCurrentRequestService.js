const slugify = require('slugify');
const asyncHandler = require('express-async-handler')
const RawMaterialCurrentRequestModel = require('../models/rawMaterialCurrentRequestModel');
const mongoose = require('mongoose');

// @desc Get list of Raw Material Request for a specific Supplier or Manufacturer
// @route GET /api/v1/rawMaterialCurrentRequest
// @access Public
exports.getRawMaterialCurrentRequests = asyncHandler(async (req, res) => {
    // const page = req.query.page * 1 || 1;//To divide data into pages
    // const limit = req.query.limit * 1 || 5;//Number of data to appear on each page
    // const skip = (page - 1) * limit;//If I was on page  (2), I would skip the number of previous pages minus the page I am on multiplied by the number of data in it.
    const userType = req.user.userType;
    const userId = req.user._id;

    // Filter requests based on userType
    const filter = userType === 'manufacturer' ? { manufacturerId: userId } : { supplierId: userId };

    const RawMaterialCurrentRequests = await RawMaterialCurrentRequestModel.find(filter);//.skip(skip).limit(limit)
    res.status(200).json({ data: RawMaterialCurrentRequests });//results: RawMaterialCurrentRequests.length, , page
});

// @desc Get Specific Raw Material Request by ID for authorized Supplier or Manufacturer
// @route GET /api/v1/rawMaterialCurrentRequest/:id
// @access Public
exports.getRawMaterialCurrentRequestById = asyncHandler(async (req, res) => {
    const { id } = req.params; // take id from / :id
    const userType = req.user.userType;
    const userId = req.user._id;
    console.log(userId)

    if (!id || id.trim() === '') {
        return res.status(400).json({ msg: 'ID is required.' });
    }

    // تحقق من أن الشورت ID يتوافق مع النمط المحدد
    const shortIdPattern = /^m[0-9a-z]{8}$/; // Regex for # followed by 8 characters (numbers or lowercase letters)

    // تحقق من أن ID مكون من 9 أحرف
    if (id.length !== 9 || !shortIdPattern.test(id)) {
        console.log("مر من هنا")
        return res.status(400).json({ msg: `Invalid shortId format: ${id}` });


    }

    // البحث باستخدام shortId
    const request = await RawMaterialCurrentRequestModel.findOne({ shortId: id });

    // check if the request is null or undefined
    if (!request) {
        console.log("2مر من هنا")
        return res.status(404).json({ msg: `There is no Request for this id: ${id}` });
    }

    const hasAccess =
        (userType === 'supplier' && request.supplierId.toString() === userId.toString()) ||
        (userType === 'manufacturer' && request.manufacturerId.toString() === userId.toString());

    if (!hasAccess) {
        return res.status(401).json({ msg: 'You do not have permission to access this request.' });
    }

    res.status(200).json({ data: request });
});


// @desc Get Specific Raw Material Request by manufacturer "slug"
// @route GET /api/v1/rawMaterialCurrentRequest/manufacturer/slug/:slug
// @access Public
exports.getRawMaterialCurrentRequestByMSlug = asyncHandler(async (req, res) => {
    const { slug } = req.params;//take  slug from / :slug
    const userType = req.user.userType; // Get user type (supplier or manufacturer)
    const userId = req.user._id; // Get user ID

    const request = await RawMaterialCurrentRequestModel.findOne({ slug });

    //check if the request is null or undefined
    if (!request) {
        return res.status(404).json({ msg: `There is no Request for this manufacturer slug: ${slug}` });
    }

    // تحقق مما إذا كان المستخدم هو المورد أو المصنع المرتبط بالطلب
    if (
        (userType === 'supplier' && request.supplierId.toString() !== userId.toString()) ||
        (userType === 'manufacturer' && request.manufacturerId.toString() !== userId.toString())
    ) {
        return res.status(403).json({ msg: 'You do not have permission to access this request.' });
    }

    res.status(200).json({ data: request });
});

// @desc Get Specific Raw Material Request by Manufacturer Name (for Supplier only)
// @route GET /api/v1/rawMaterialCurrentRequest//manufacturerName/:manufacturerName
// @access Public
exports.getRawMaterialCurrentRequestByMName = asyncHandler(async (req, res) => {
    const { manufacturerName } = req.params;
    const userType = req.user.userType; // Get user type (supplier or manufacturer)
    const userId = req.user._id; // Get user ID

    const requests = await RawMaterialCurrentRequestModel.find({ manufacturerName: new RegExp(`^${manufacturerName}$`, "i") });

    //check if the request is null or undefined
    if (requests.length === 0) {
        return res.status(404).json({ msg: `No requests found for manufacturer name: ${manufacturerName}` });
    }

    const accessibleRequests = requests.filter((request) =>
        (userType === 'supplier' && request.supplierId.toString() === userId.toString()) ||
        (userType === 'manufacturer' && request.manufacturerId.toString() === userId.toString())
    );

    if (accessibleRequests.length === 0) {
        return res.status(403).json({ msg: 'You do not have permission to access these requests.' });
    }

    res.status(200).json({ data: accessibleRequests });
});

// @desc Create Raw Material Request 
// @route POST /api/v1/rawMaterialCurrentRequest
// @access Public
exports.createRawMaterialCurrentRequest = asyncHandler(async (req, res) => {
    const userId = req.user._id; // Get user ID
    const userType = req.user.userType; // Get user type (supplier or manufacturer)

    const supplierId = req.body.supplierId;
    const supplierName = req.body.supplierName;
    //const manufacturerId= req.body.manufacturerId;
    const manufacturerName = req.body.manufacturerName;
    const supplyingRawMaterials = req.body.supplyingRawMaterials;
    const total_price = req.body.total_price; // ستكون 0 إذا لم يتم إرسال هذا الحقل
    const payment_method = req.body.payment_method;
    const status = req.body.status || 'pending'; // القيمة الافتراضية هي 'pending' إذا لم يتم إرسالها
    const arrivalAddress = req.body.arrivalAddress;
    const departureAddress = req.body.departureAddress || null;
    const transporterId = req.body.transporterId || null; // ستكون null إذا لم يتم إرسالها
    const transporterName = req.body.transporterName || ''; // ستكون نص فارغ إذا لم يتم إرسالها
    const estimated_delivery_date = req.body.estimated_delivery_date;
    const actual_delivery_date = req.body.actual_delivery_date || null;
    const notes = req.body.notes || '';
    const tracking_number = req.body.tracking_number || '';
    const transportRequest_id = req.body.transportRequest_id || '';
    const contract_id = req.body.contract_id || ''

    // تحقق من نوع المستخدم قبل إنشاء الطلب
    if (userType !== 'manufacturer') {
        return res.status(403).json({ msg: 'Access denied: Only manufacturers can create raw material requests.' });
    }
    //Async Await Syntax 
    const RawMaterialCurrentRequest = await RawMaterialCurrentRequestModel.create({
        supplierId,
        supplierName,
        manufacturerId: userId, // الربط بالمصنع
        manufacturerName,
        supplyingRawMaterials,
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
    res.status(201).json({ data: RawMaterialCurrentRequest });

});


// @desc Update Specific Raw Material Request 
// @route PUT /api/v1/rawMaterialCurrentRequest/:id
// @access Private
exports.updateRawMaterialCurrentRequest = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id; // Get user ID
    const userType = req.user.userType; // Get user type (supplier or manufacturer)
    const { status } = req.body;

    // البحث عن الطلب للتحقق من ارتباطه بالمستخدم
    const request = await RawMaterialCurrentRequestModel.findOne({ shortId: id });

    // تحقق مما إذا كان الطلب موجودًا
    if (!request) {
        return res.status(404).json({ msg: `There is no Request for this id: ${id}` });
    }

    // تحقق مما إذا كان المستخدم مرتبطًا بالطلب
    if (
        (userType === 'supplier' && request.supplierId.toString() !== userId.toString()) ||
        (userType === 'manufacturer' && request.manufacturerId.toString() !== userId.toString())
    ) {
        return res.status(403).json({ msg: 'You do not have permission to access this request.' });
    }


    const updatedRequest = await RawMaterialCurrentRequestModel.findOneAndUpdate(
        { shortId: id },//identifier to find the request 
        { status },//the data will update
        { new: true }//to return data after ubdate
    );

    //check if the request is null or undefined
    if (!request) {
        return res.status(404).json({ msg: `There is no Request for this id: ${id}` });
    }
    res.status(200).json({ data: updatedRequest });
});

// @desc Delete Specific Raw Material Request 
// @route DELETE /api/v1/rawMaterialCurrentRequest/:id
// @access Private
exports.deleteRawMaterialCurrentRequest = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id; // Get user ID
    const userType = req.user.userType; // Get user type (supplier or manufacturer)

    // البحث عن الطلب للتحقق من ارتباطه بالمستخدم
    const request = await RawMaterialCurrentRequestModel.findOne({ shortId: id });

    //check if the request is null or undefined
    if (!request) {
        return res.status(404).json({ msg: `There is no Request for this id: ${id}` });
    }

    if (userType === 'supplier' && request.supplierId.toString() !== userId.toString()) {
        return res.status(403).json({ msg: 'Access denied: You do not have permission to delete this request.' });
    }
    // حذف الطلب
    await RawMaterialCurrentRequestModel.findOneAndDelete({ shortId: id });

    res.status(204).send();
});
