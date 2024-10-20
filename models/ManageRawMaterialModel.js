const mongoose = require('mongoose'); //import mongoose 
const { customAlphabet } = require('nanoid');
const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz';
const nanoid = customAlphabet(alphabet, 8);
//npm uninstall nanoid  
//npm install nanoid@3.3.4 
const ManageRawMaterialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    lowercase: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  description: {
    type: String,
    required: true,
    minlength: [10, "Description must be at least 10 characters long"],
  },
  storageInfo: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
    trim: true

  },
  image: {
    type: String, // if using GridFS for image storage change this to an ObjectID  
    required: [true, "Proudect Image is require"],
  },
  shortId: {
    type: String,
    unique: true, // إضافة فهرس للتأكد من أن القيم فريدة
    default: () => nanoid(),
    immutable: true // اجعل القيمة غير قابلة للتعديل
  }


}, { timestamps: true }

);


//2- create model
module.exports = mongoose.model('Manage-Raw-Materials', ManageRawMaterialSchema);
