const mongoose = require("mongoose");
const { customAlphabet } = require('nanoid');
const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz'; // أرقام وحروف صغيرة
const nanoid = customAlphabet(alphabet, 12); // ID بطول 8 خانات 

const retailerSchema = new mongoose.Schema(
  {
    shortId: {
      type: String,
      unique: true, // إضافة فهرس للتأكد من أن القيم فريدة
      default: () => `r${nanoid()}`,
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
      trim: true, // إزالة المسافات
      lowercase: true // تحويل إلى أحرف صغيرة
    },
    phone_number: {
      type: String,
      required: true,
      trim: true // إزالة المسافات
    },
    password: {
      type: String,
      required: true
    },
    userType: {
      type: String,
      default: 'Retailer' // نوع المستخدم
    },
    addresses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address' // الربط مع كولكشن العناوين
      }
    ],
    distributorsList: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Distributors' // الربط مع كولكشن الموردين
      }
    ]
  }
);

module.exports = mongoose.model('Retailers', retailerSchema);
