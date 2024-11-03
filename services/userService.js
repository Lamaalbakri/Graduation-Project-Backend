const bcrypt = require('bcrypt');
const transportersService = require("../services/transportersService");
const suppliersService = require("../services/suppliersService");
const manufacturersService = require("../services/manufacturersService");
const distributorsService = require("../services/distributorsService");
const retailersService = require("../services/retailersService");
const { createToken } = require('../services/authService');
const { getModelByUserType } = require("../models/userModel");
const asyncHandler = require('express-async-handler')


// Login method
async function login(req, res) {
  const { email, password, userType } = req.body;
  console.log(`${userType} login successfully`);

  try {
    const UserModel = getModelByUserType(userType);
    console.log('User model retrieved successfully');

    // Find the user in the database
    const user = await UserModel.findOne({ email });
    // console.log('User found in the database');

    if (!user) {
      return res.status(404).json({ message: 'No user found with this email and user type.' });
    }

    // When checking the password during login
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password comparison done');

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Incorrect password or email.' });
    }

    // Create a JWT token
    const token = createToken(user._id, userType);

    res.cookie('token', token, {
      httpOnly: true,       // يجعل الكوكي غير قابل للقراءة من جانب العميل
      secure: true,         // الكوكي يُرسل فقط عبر HTTPS
      sameSite: 'Strict',   // يحمي من هجمات CSRF
      maxAge: 7200000       // مدة الصلاحية للكوكي
    });

    // إرجاع معلومات إضافية مع استجابة النجاح
    return res.status(200).json({
      message: 'Login successful',
      userId: user._id,          // يمكنك إرجاع ID المستخدم
      userRole: userType         // إرجاع نوع المستخدم
    });
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
}

// Register method
async function register(req, res) {
  const { userType } = req.body;
  const { category } = req.body;
  console.log(`Registering ${userType}`);
  console.log(`Registering ${category}`);

  try {
    let result;
    switch (userType) {
      case "transporter":
        result = await transportersService.registerTransporter(req.body);
        break;
      case "supplier":
        result = await suppliersService.registerSupplier(req.body);
        break;
      case "manufacturer":
        result = await manufacturersService.registerManufacturer(req.body);
        break;
      case "distributor":
        result = await distributorsService.registerDistributor(req.body);
        break;
      case "retailer":
        result = await retailersService.registerRetailer(req.body);
        break;
      default:
        return res.status(400).json({ error: "Invalid user type." });
    }

    res.status(201).json(result);
  } catch (error) {
    console.error("Error in registration:", error);
    res.status(500).json({ error: error.message });
  }
}


const getOne = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { userType } = req.query; // نوع المستخدم يمكن أن يتم تمريره في الـ query

  try {
    // احصل على الموديل بناءً على نوع المستخدم
    const UserModel = getModelByUserType(userType);
    console.log(`Retrieved model for userType: ${userType}`);

    // ابحث عن المستخدم في قاعدة البيانات بناءً على ID
    const document = await UserModel.findById(id);
    console.log(`User document found with ID: ${id}`);

    if (!document) {
      return res.status(404).json({ error: "No document found for this id." });
    }

    // ارجع بيانات المستخدم
    console.log('Sending user data:', document);
    res.status(200).json({ data: document });
  } catch (error) {
    console.error('Error during fetching user:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});


// bring all the supplier list in the view page 
const getOneWithSupplier = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { userType } = req.query; // نوع المستخدم يمكن أن يتم تمريره في الـ query

  try {
    // احصل على الموديل بناءً على نوع المستخدم
    const UserModel = getModelByUserType(userType);
    console.log(`Retrieved model for userType: ${userType}`);

    // ابحث عن المستخدم في قاعدة البيانات بناءً على ID
    const document = await UserModel.findById(id).populate('suppliersList');
    console.log(`User document found with ID: ${id}`);

    if (!document) {
      return res.status(404).json({ error: "No document found for this id." });
    }

    // ارجع بيانات المستخدم
    console.log('Sending user data:', document);
    res.status(200).json({ data: document });
  } catch (error) {
    console.error('Error during fetching user:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});


const getLoggedUserData = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  req.query.userType = req.user.userType; // إضافة userType للطلب
  next();
});

// Update User method
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userType } = req.query;
  console.log("Received userType:", userType);
  console.log('Updating user with ID:', id);
  console.log('Update data:', req.body);

  try {
    const UserModel = getModelByUserType(userType);

    const updateData = req.body;

    const updatedUser = await UserModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ message: `${userType} updated successfully.`, data: updatedUser });
    console.log(`${userType} updated successfully.`, updatedUser);
  } catch (error) {
    console.error('Error updating:', error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

module.exports = {
  login,
  register,
  getOne,
  getLoggedUserData,
  updateUser,
  getOneWithSupplier

};