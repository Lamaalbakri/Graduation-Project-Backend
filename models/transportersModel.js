const mongoose = require("mongoose");
const { customAlphabet } = require('nanoid');
const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz'; // أرقام وحروف صغيرة
const nanoid = customAlphabet(alphabet, 12); // ID بطول 12 خانات 

const transporterSchema = new mongoose.Schema(
  {
    shortId: {
      type: String,
      unique: true, // إضافة فهرس للتأكد من أن القيم فريدة
      default: () => `m${nanoid()}`,
      immutable: true // اجعل القيمة غير قابلة للتعديل
    },
    full_name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      unique: true,
      required: true
    },
    phone_number: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    userType: {
      type: String,
      default: 'Transporter' // نوع المستخدم
    }
});

module.exports = mongoose.model('Transporters', transporterSchema);
