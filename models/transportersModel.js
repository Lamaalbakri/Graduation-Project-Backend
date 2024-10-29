const mongoose = require("mongoose");
const { customAlphabet } = require('nanoid');
const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz'; // أرقام وحروف صغيرة
const nanoid = customAlphabet(alphabet, 12); // ID بطول 12 خانات 

const transporterSchema = new mongoose.Schema({
  shortId: {
    type: String,
    unique: true, // إضافة فهرس للتأكد من أن القيم فريدة
    default: () => `t${nanoid()}`,
    immutable: true // اجعل القيمة غير قابلة للتعديل
  },
  full_name: {
    type: String,
    required: true,
    trim: true // إزالة المسافات من البداية والنهاية
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
    default: 'Transporter' // نوع المستخدم
  }
});

module.exports = mongoose.model('Transporters', transporterSchema);
