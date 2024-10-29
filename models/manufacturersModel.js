const mongoose = require("mongoose");
const { customAlphabet } = require('nanoid');
const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz'; // أرقام وحروف صغيرة
const nanoid = customAlphabet(alphabet, 12); // ID بطول 8 خانات 

const manufacturerSchema = new mongoose.Schema({
  shortId: {
    type: String,
    unique: true, // إضافة فهرس للتأكد من أن القيم فريدة
    default: () => `m${nanoid()}`,
    immutable: true // اجعل القيمة غير قابلة للتعديل
  },
  full_name: {
    type: String,
    required: true,
    trim: true, // إزالة المسافات من البداية والنهاية
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true, // إزالة المسافات من البداية والنهاية
    lowercase: true // تحويل البريد الإلكتروني إلى أحرف صغيرة
  },
  phone_number: {
    type: String,
    required: true,
    trim: true // إزالة المسافات من البداية والنهاية
  },
  password: {
    type: String,
    required: true // يمكن هنا تجنب `trim` نظرًا لأن كلمة المرور قد تتطلب مسافات
  },
  userType: {
    type: String,
    default: 'Manufacturer' // نوع المستخدم
  },
  category: {
    type: String,
    trim: true, // إزالة المسافات من البداية والنهاية
    default: '' // القيمة الافتراضية لتكون حقلًا اختياريًا
  },
  suppliersList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Suppliers' // إشارة إلى الموردين
    }
  ],
  manufacturerGoodsList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ManufacturerGoods' // إشارة إلى قائمة البضائع المصنعة
    }
  ],
  addresses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Address' // إشارة إلى عناوين المصنع
    }
  ]
});

module.exports = mongoose.model('Manufacturers', manufacturerSchema);