const mongoose = require("mongoose");
const { customAlphabet } = require('nanoid');
const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz'; // أرقام وحروف صغيرة
const nanoid = customAlphabet(alphabet, 12); // ID بطول 8 خانات 

const distributorSchema = new mongoose.Schema(
  {
    shortId: {
      type: String,
      unique: true, // إضافة فهرس للتأكد من أن القيم فريدة
      default: () => `d${nanoid()}`,
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
      default: 'Distributor' // نوع المستخدم
    },
    category: {
      type: String,
      trim: true, // إزالة المسافات من البداية والنهاية
      default: '' // القيمة الافتراضية لتكون حقلًا اختياريًا
    },
    addresses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address' // الربط مع كولكشن العناوين
      }
    ],
    manufacturersList: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Manufacturers' // الربط مع كولكشن المصانع
      }
    ],
    distributorGoodsList: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Manage-Goods-Distributors' // الربط مع كولكشن السلع التي يمتلكها الموزع
      }
    ]
  }
);

module.exports = mongoose.model('Distributors', distributorSchema);