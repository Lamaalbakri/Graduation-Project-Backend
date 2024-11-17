require("dotenv").config();
const mongoose = require('mongoose');
const { ethers } = require('ethers');
const asyncHandler = require('express-async-handler');
const contractABI = require('../artifacts/contracts/SupplyChainContract.sol/SupplyChainContract.json').abi; // تأكد من تحميل ABI للعقد
const contractAddress = process.env.CONTRACT_ADDRESS;// عنوان العقد المنشأ
const ContractModel = require('../models/contractModel');
const TransporterCurrentRequestModel = require('../models/transporterCurrentRequestModel');
const RawMaterialCurrentRequestModel = require('../models/rawMaterialCurrentRequestModel');
const { getModelByUserType } = require("../models/userModel");

// إعداد مزود الشبكة لشبكة Sepolia عبر Alchemy
const provider = new ethers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);
const wallet = new ethers.Wallet(process.env.SEPOLIA_PRIVATE_KEY, provider);
// إعداد العقد
const supplyChainContract = new ethers.Contract(contractAddress, contractABI, wallet);

// دالة لإنشاء عقد جديد

exports.createContract = asyncHandler(async (req, res) => {
    try {
        const { transportOId: extractedTransportOrderId, purchaseOId: extractedPurchaseOrderId } = req.body;

        // الخطوة 1: البحث في TransportCurrentRequest
        const transportRequest = await TransporterCurrentRequestModel.findOne({ shortId: extractedTransportOrderId });

        if (!transportRequest) {
            return res.status(404).json({ message: "Transport request not found." });
        }

        const {
            senderId,//seller _id
            sender_type,
            receiver_id,//buyer _id
            receiver_type,
            transporterId: collectionTransporterId,//_id
            temperature,//transportType
            weight: collectionWeight,//weight
            totalPrice: extractedTotalTransportPayment,
            arrivalAddress,//buyerAddress
            departureAddress,//sellerAddress
            estimated_delivery_date//estimatedDeliveryTimes
        } = transportRequest;


        // استخدام الدالة لاختيار الموديل المناسب بناءً على `sender_type` و `receiver_type`
        const sellerModel = getModelByUserType(sender_type);
        const buyerModel = getModelByUserType(receiver_type);
        const transporterModel = getModelByUserType('transporter');
        // استعلام للحصول على معلومات المرسل والمستقبل
        const [sellerInfo, buyerInfo, transporterInfo] = await Promise.all([
            sellerModel.findOne({ _id: senderId }, "shortId full_name"), // استعلام للمرسل
            buyerModel.findOne({ _id: receiver_id }, "shortId full_name"), // استعلام للمستقبل
            transporterModel.findOne({ _id: collectionTransporterId }, "shortId full_name"), // استعلام للناقل
        ]);

        if (!sellerInfo || !buyerInfo || !transporterInfo) {
            return res.status(404).json({ message: "User information not found for one or more users." });
        }

        const extractedSellerName = sellerInfo.full_name;
        const extractedSellerShortId = sellerInfo.shortId;

        const extractedBuyerName = buyerInfo.full_name;
        const extractedBuyerShortId = buyerInfo.shortId;

        const extractedTransporterName = transporterInfo.full_name;
        const extractedTransporterId = transporterInfo.shortId;


        // تحديد الكولكشن بناءً على sender_type
        let requestData, extractedData;
        switch (sender_type) {
            case "supplier":
                requestData = await RawMaterialCurrentRequestModel.findOne({ shortId: extractedPurchaseOrderId });
                if (!requestData) {
                    return res.status(404).json({ message: "Purchase request not found in RawMaterialCurrentRequestModel." });
                }
                const supplyingItem = requestData.supplyingRawMaterials.map(item => {
                    // استخراج البيانات المطلوبة من كل عنصر
                    const options = item.options.map(option => `${option.optionType} ${option.values}`).join(", ");
                    return {
                        itemName: item.rawMaterial_name,  // اسم المادة الخام
                        quantity: item.quantity,          // الكمية
                        options: options,                 // الخيارات (مثل: سمك، لون)
                    };
                });

                extractedData = {
                    extractedItems: supplyingItem,
                    extractedTotalBuyerPayment: requestData.total_price,
                };
                break;
            case "manufacturer":
                // requestData = await ManufacturerGoodsCurrentRequestModel.findOne({ _id: purchaseOrderId });
                break;
            case "distributor":
                //requestData = await DistributorGoodsCurrentRequestModel.findOne({ _id: purchaseOrderId });
                break;
            default:
                return res.status(400).json({ message: "Invalid sender type." });
        }

        // // الخطوة 2: تنسيق البيانات
        const transportType = temperature === "Refrigerated Delivery" ? 1 : 0;
        const weight = collectionWeight === "3 to 7 tons" ? 0 : collectionWeight === "7 to 15 tons" ? 1 : 2;

        const estimatedDeliveryTimes = estimated_delivery_date.map(date => Math.floor(new Date(date).getTime() / 1000));

        const purchaseOrderId = ethers.encodeBytes32String(extractedPurchaseOrderId);
        const transportOrderId = ethers.encodeBytes32String(extractedTransportOrderId);
        const sellerShortId = ethers.encodeBytes32String(extractedSellerShortId);
        const sellerName = ethers.encodeBytes32String(extractedSellerName);
        const buyerShortId = ethers.encodeBytes32String(extractedBuyerShortId);
        const buyerName = ethers.encodeBytes32String(extractedBuyerName);
        const transporterId = ethers.encodeBytes32String(extractedTransporterId);
        const transporterName = ethers.encodeBytes32String(extractedTransporterName);
        const totalBuyerPayment = Math.round(extractedData.extractedTotalBuyerPayment * 100);
        const totalTransportPayment = Math.round(extractedTotalTransportPayment * 100);

        const sellerAddress = [departureAddress.city, departureAddress.neighborhood,
        departureAddress.street].filter(Boolean).join(", ");

        const buyerAddress = [departureAddress.city, arrivalAddress.neighborhood,
        arrivalAddress.street].filter(Boolean).join(", ");

        const itemNames = extractedData.extractedItems.map((item) => ethers.encodeBytes32String(item.itemName));
        const quantities = extractedData.extractedItems.map((item) => item.quantity);
        const options = extractedData.extractedItems.map((item) => item.options);

        console.log("Item Names:", itemNames);
        console.log("Quantities:", quantities);
        console.log("Options:", options);

        const tx = await supplyChainContract.createContract(
            purchaseOrderId,
            transportOrderId,
            sellerShortId,
            sellerName,
            buyerShortId,
            buyerName,
            transporterId,
            transporterName,
            totalBuyerPayment,
            totalTransportPayment,
            estimatedDeliveryTimes,
            sellerAddress,
            buyerAddress,
            itemNames,
            quantities,
            options,
            transportType,
            weight
        );

        // // الانتظار حتى يتم تأكيد المعاملة
        const receipt = await tx.wait();
        console.log(receipt)
        const newContractCounter = Number(receipt.logs[0].args[0]);

        // // تجهيز قائمة العناصر (items)
        const items = itemNames.map((name, index) => ({
            itemName: ethers.decodeBytes32String(name),
            quantity: quantities[index],
            options: options[index].split(",").map(opt => opt.trim()),
        }));
        console.log(items)

        const estimatedDates = estimatedDeliveryTimes.map(time => new Date(time * 1000));


        // إعداد بيانات العقد للتخزين
        const contractData = {
            purchaseOrderId: ethers.decodeBytes32String(purchaseOrderId),
            transportOrderId: ethers.decodeBytes32String(transportOrderId),
            sellerShortId: ethers.decodeBytes32String(sellerShortId),
            sellerName: ethers.decodeBytes32String(sellerName),
            buyerShortId: ethers.decodeBytes32String(buyerShortId),
            buyerName: ethers.decodeBytes32String(buyerName),
            transporterId: ethers.decodeBytes32String(transporterId),
            transporterName: ethers.decodeBytes32String(transporterName),
            totalBuyerPayment: totalBuyerPayment / 100,
            totalTransportPayment: totalTransportPayment / 100,
            estimatedDeliveryDate: estimatedDates,
            sellerAddress,
            buyerAddress,
            contractCounter: newContractCounter,
            items,
            transportType: temperature,
            weight: collectionWeight,
            blockNumber: receipt.blockNumber,
            transactionHash: receipt.hash,
        };

        console.log(contractData)
        const result = await ContractModel.create(contractData);
        res.status(200).json({ message: "Contract created successfully", data: result });
    } catch (error) {
        res.status(500).json({ error: "Failed to create contract", details: error.message });
    }
});

exports.getContract = asyncHandler(async (req, res) => {
    try {
        const userId = req.user.shortId;
        const orderId = req.params.orderId;
        console.log(orderId); // تحقق من القيمة المرسلة

        const contract = await ContractModel.findOne({
            $or: [
                { purchaseOrderId: orderId },
                { transportOrderId: orderId }
            ]
        });

        if (!contract) {
            return res.status(404).json({ message: "Contract not found for this order." });
        }
        const contractCounter = contract.contractCounter;

        // استرجاع عنوان الشركة من العقد الذكي
        const companyAddress = await supplyChainContract.companyAddress();
        console.log(companyAddress)
        // استرجاع العقد من العقد الذكي باستخدام companyAddress و contractCounter
        const smartContractData = await supplyChainContract.getContract(companyAddress, contractCounter);

        // تحديد نوع النقل والوزن استنادًا إلى القيم المخزنة في العقد الذكي
        const transportType = Number(smartContractData.transportType); // إذا كانت 0 أو 1
        const weight = Number(smartContractData.weight); // إذا كانت 0 أو 1 أو 2

        // تحديد خيارات النقل والوزن بناءً على القيم المسترجعة
        const transportTypeText = transportType === 0 ? "Regular Delivery" : "Refrigerated Delivery";
        const weightText = weight === 0 ? "3 to 7 tons" : weight === 1 ? "7 to 15 tons" : "over 15 tons";


        const formattedContract = {
            purchaseOrderId: ethers.decodeBytes32String(smartContractData.purchaseOrderId),
            transportOrderId: ethers.decodeBytes32String(smartContractData.transportOrderId),
            sellerShortId: ethers.decodeBytes32String(smartContractData.sellerShortId),
            sellerName: ethers.decodeBytes32String(smartContractData.sellerName),
            buyerShortId: ethers.decodeBytes32String(smartContractData.buyerShortId),
            buyerName: ethers.decodeBytes32String(smartContractData.buyerName),
            transporterId: ethers.decodeBytes32String(smartContractData.transporterId),
            transporterName: ethers.decodeBytes32String(smartContractData.transporterName),
            totalBuyerPayment: Number(smartContractData.totalBuyerPayment) / 100,
            totalTransportPayment: Number(smartContractData.totalTransportPayment) / 100,
            estimatedDeliveryTimes: smartContractData.estimatedDeliveryTimes.map(time =>
                new Date(Number(time) * 1000).toISOString() // إرسال التاريخ بتنسيق ISO 8601
            ),
            actualDeliveryTime: smartContractData.actualDeliveryTime > 0
                ? new Date(Number(smartContractData.actualDeliveryTime) * 1000).toLocaleDateString("en-US")
                : "Not delivered yet", // عرض null إذا لم يتم تعيين الوقت
            purchaseOrderStatus: Number(smartContractData.purchaseOrderStatus) === 0
                ? "inProgress"
                : "delivered", // تحويل الحالة إلى نصوص
            sellerAddress: smartContractData.sellerAddress,
            buyerAddress: smartContractData.buyerAddress,
            transportType: transportTypeText,  // إضافة نوع النقل
            weight: weightText, // إضافة الوزن
            items: smartContractData.items.map(item => ({
                itemName: ethers.decodeBytes32String(item.itemName),
                quantity: Number(item.quantity),
                options: item.options
            })),
            transactionHash: contract.transactionHash,
            blockNumber: contract.blockNumber
        };

        // إعادة البيانات إلى العميل
        res.status(200).json({
            message: "Contract fetched successfully",
            data: formattedContract
        });

    } catch (error) {
        res.status(500).json({ error: "Failed to fetch contract", details: error.message });
    }
});



exports.updateContract = asyncHandler(async (req, res) => {
    try {
        const userId = req.user.shortId;
        const orderId = req.body.orderId;
        const contract = await ContractModel.findOne({
            $or: [
                { purchaseOrderId: orderId },
                { transportOrderId: orderId }
            ]
        });

        if (!contract) {
            return res.status(404).json({ message: "Contract not found for this order." });
        }
        const contractCounter = contract.contractCounter;
        console.log(contractCounter);
        // استدعاء الوقت الحالي (new Date) مرة واحدة
        const currentDate = new Date();

        // تحويل الوقت إلى uint (عدد الثواني منذ بداية Epoch)
        const currentTimeInSeconds = Math.floor(currentDate.getTime() / 1000);

        const companyAddress = await supplyChainContract.companyAddress();

        // استرجاع عنوان الشركة من العقد الذكي
        const tx = await supplyChainContract.markContractAsDelivered(companyAddress, contractCounter, currentTimeInSeconds);

        // انتظار تأكيد المعاملة
        const receipt = await tx.wait();

        // استرجاع المعلومات الجديدة من العقد الذكي
        const smartContractData = await supplyChainContract.getContract(companyAddress, contractCounter);

        // تحديث العقد في MongoDB
        const updatedContract = await ContractModel.findOneAndUpdate(
            {
                $or: [
                    { purchaseOrderId: orderId },
                    { transportOrderId: orderId }
                ]
            },
            {
                actualDeliveryDate: currentDate,
                purchaseOrderStatus: Number(smartContractData.purchaseOrderStatus) === 0 ? "inProgress" : "delivered",
                blockNumber: receipt.blockNumber,
                transactionHash: receipt.hash
            },
            { new: true } // استرجاع العقد المحدث
        );

        // إعادة العقد المحدث إلى العميل
        res.status(200).json({
            message: "Contract updated to delivered successfully",
            data: updatedContract
        });

    } catch (error) {
        res.status(500).json({ error: "Failed to update contract", details: error.message });
    }
});

