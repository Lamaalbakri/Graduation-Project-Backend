const SupplierModel = require("../models/suppliersModel");
const bcrypt = require("bcryptjs");

exports.registerSupplier = async (req, res) => {

  console.log("Received request body:", req.body); // تأكد من وصول البيانات

  try {
    const { full_name, email, phone_number, password, confirm_password, userType } = req.body;

    // التحقق إذا كان المستخدم موجود بالفعل
    const existingSupplier = await SupplierModel.findOne({ email });
    if (existingSupplier) {
      //throw new Error("This email is already registered.");
      return res.status(400).json({ error: "This email is already registered." });
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10);

    // إنشاء وحفظ مستخدم جديد
    const newSupplier = new SupplierModel({
      full_name,
      email,
      phone_number,
      password: hashedPassword,
      userType,
    });

    await newSupplier.save();
    res.status(201).json({ message: "Supplier registered successfully!" });

  } catch (error) {
    console.error("Error in POST /register:", error); // سجل أي أخطاء
    res.status(500).json({ message: 'Server error' });
  }
}