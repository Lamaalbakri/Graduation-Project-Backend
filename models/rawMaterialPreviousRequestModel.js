const mongoose = require('mongoose');//import mongoose 
const { customAlphabet } = require('nanoid');
const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz'; // أرقام وحروف صغيرة
const nanoid = customAlphabet(alphabet, 8); // ID بطول 8 خانات 

//1-create schema
// const RawMaterialPreviousRequestSchema = new mongoose.Schema(
//     {
//         manufacturerId: {
//             type: mongoose.Schema.Types.ObjectId,
//             //Uncomment when the Manufacturer model is available
//             // required: true,
//             // ref: 'Manufacturer',
//         },
//         manufacturerName: {
//             type: String,
//             required: true,
//         },
//         supplyingItems: {
//             type: [String],
//             required: true,
//         },
//         quantity: {
//             type: [Number],
//             required: true,
//         },
//         price: {
//             type: Number,
//             required: true,
//         },
//         status: {
//             type: String,
//             enum: ['pending', 'accepted', 'inProgress', 'delivered', 'rejected'],
//             default: 'pending',
//         },
//         arrivalCity: {
//             type: String,
//             required: true
//         },
//         transporterId: {
//             type: mongoose.Schema.Types.ObjectId,
//             //Uncomment when the Transporter model is available
//             // required: true,
//             // ref: 'Transporter'
//         },
//         notes: {
//             type: String,
//             default: '',
//         },
//         trackingInfo: {
//             type: String,
//             default: '',
//         },
//         slug: {
//             type: String,
//             lowercase: true,
//         }, shortId: {
//             type: String,
//             unique: true, // إضافة فهرس للتأكد من أن القيم فريدة
//             default: () => `m${nanoid()}`,
//             immutable: true // اجعل القيمة غير قابلة للتعديل
//         }
//     },
//     { timestamps: true }
// );

const RawMaterialPreviousRequestSchema = new mongoose.Schema(
    {
        shortId: {
            type: String,
            required: true,
        },
        supplierId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Suppliers',
            required: true,
        },
        supplierName: {//who will receive the order
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        manufacturerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Manufacturers',
            required: true,
        },
        manufacturerName: {//who will send the order
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        supplyingRawMaterials: [{
            rawMaterial_id: {
                type: String,
                required: true,
                trim: true,
            },
            rawMaterial_name: {
                type: String,
                required: true,
                trim: true,
            },
            quantity: {
                type: Number,
                required: true,
                min: 1,
            },
            unit_price: {
                type: Number,
                required: true,
                min: 0,
            },
            subtotal: {
                type: Number,
                required: true,
                min: 0,
            },
            unit: { // وحدة القياس
                type: String,
                required: true,
                trim: true,
            },
            options: [ // الخيارات المرتبطة بالمادة الخام
                {
                    optionType: {
                        type: String,
                        trim: true,
                    },
                    values: [{
                        type: String,
                        trim: true,
                    }]
                }
            ],
        }],
        total_price: {
            type: Number,
            required: true,
            min: 0,
        },
        payment_method: {
            type: String,
            required: true,
            trim: true,
        },
        status: {
            type: String,
            enum: ['delivered', 'rejected'],
            required: true,
        },
        arrivalAddress: {//manufacturer address
            street: {
                type: String,
                required: true,
                trim: true,
                lowercase: true,
            },
            city: {
                type: String,
                required: true,
                trim: true,
                lowercase: true,
            },
            postal_code: {
                type: String,
                trim: true,
            },
            neighborhood: { // الحي
                type: String,
                required: true,
                trim: true,
                lowercase: true, // تحويل إلى أحرف صغيرة
            },
            country: {
                type: String,
                required: true,
                trim: true,
                lowercase: true,
            },
        },
        departureAddress: {//supplier address
            street: {
                type: String,
                trim: true,
                lowercase: true,
            },
            city: {
                type: String,
                trim: true,
                lowercase: true,
            },
            neighborhood: { // الحي
                type: String,
                trim: true,
                lowercase: true, // تحويل إلى أحرف صغيرة
            },
            postal_code: {
                type: String,
                trim: true,
            },
            country: {
                type: String,
                trim: true,
                lowercase: true,
            },
        },
        transporterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Transporters',
        },
        transporterName: {
            type: String,
            trim: true,
            lowercase: true,
        },
        estimated_delivery_date: {
            type: Date,
        },
        actual_delivery_date: {
            type: Date,
        },
        notes: {
            type: String,
            default: '',
            trim: true,
        },
        tracking_number: {
            type: String,
            trim: true,
        },
        transportRequest_id: {
            type: String,
            trim: true,
        },
        contract_id: {
            type: String,
            trim: true,
        },
    }, { timestamps: true })
    ;

//2- create model
const RawMaterialPreviousRequestModel = mongoose.model('Raw-Material-Previous-Request', RawMaterialPreviousRequestSchema);

module.exports = RawMaterialPreviousRequestModel