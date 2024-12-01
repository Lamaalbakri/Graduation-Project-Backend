require("dotenv").config();
const mongoose = require('mongoose');
const { ethers } = require('ethers');
const asyncHandler = require('express-async-handler');
const contractABI = require('../artifacts/contracts/SupplyChainContract.sol/SupplyChainContract.json').abi; // Make sure to download the ABI for the contract.
const contractAddress = process.env.CONTRACT_ADDRESS;// Title of the contract originating
const ContractModel = require('../models/contractModel');
const TransporterCurrentRequestModel = require('../models/transporterCurrentRequestModel');
const RawMaterialCurrentRequestModel = require('../models/rawMaterialCurrentRequestModel');
const GoodsDistributorsCurrentRequestModel = require('../models/goodsDistributorsCurrentRequestModel');
const GoodsManufacturersCurrentRequestModel = require('../models/goodsManufacturersCurrentRequestModel');
const { getModelByUserType } = require("../models/userModel");

// Setting up a Sepolia Network Provider via Alchemy
const provider = new ethers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);
const wallet = new ethers.Wallet(process.env.SEPOLIA_PRIVATE_KEY, provider);
// Contract preparation
const supplyChainContract = new ethers.Contract(contractAddress, contractABI, wallet);

// Function to create a new contract
exports.createContract = asyncHandler(async (req, res) => {
    try {
        const { transportOId: extractedTransportOrderId, purchaseOId: extractedPurchaseOrderId } = req.body;
        //Step 1: Find and collect all the data that will be stored in the contract.
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

        const sellerModel = getModelByUserType(sender_type);
        const buyerModel = getModelByUserType(receiver_type);
        const transporterModel = getModelByUserType('transporter');
        const [sellerInfo, buyerInfo, transporterInfo] = await Promise.all([
            sellerModel.findOne({ _id: senderId }, "shortId full_name"),
            buyerModel.findOne({ _id: receiver_id }, "shortId full_name"),
            transporterModel.findOne({ _id: collectionTransporterId }, "shortId full_name"),
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

        let requestData, extractedData;
        switch (sender_type) {
            case "supplier":
                requestData = await RawMaterialCurrentRequestModel.findOne({ shortId: extractedPurchaseOrderId });
                if (!requestData) {
                    return res.status(404).json({ message: "Purchase request not found in RawMaterialCurrentRequestModel." });
                }
                const supplyingItem = requestData.supplyingRawMaterials.map(item => {

                    const options = item.options.map(option => `${option.optionType} ${option.values}`).join(", ");
                    return {
                        itemName: item.rawMaterial_name,
                        quantity: item.quantity,
                        options: options,
                    };
                });

                extractedData = {
                    extractedItems: supplyingItem,
                    extractedTotalBuyerPayment: requestData.total_price,
                };
                break;
            case "manufacturer":
                requestData = await GoodsManufacturersCurrentRequestModel.findOne({ shortId: extractedPurchaseOrderId });
                if (!requestData) {
                    return res.status(404).json({ message: "Purchase request not found in GoodsManufacturersCurrentRequestModel." });
                }
                const manufacturedItem = requestData.goodsForDistributors.map(item => {

                    const options = item.options.map(option => `${option.optionType} ${option.values}`).join(", ");
                    return {
                        itemName: item.goods_name,
                        quantity: item.quantity,
                        options: options,
                    };
                });

                extractedData = {
                    extractedItems: manufacturedItem,
                    extractedTotalBuyerPayment: requestData.total_price,
                };
                break;
            case "distributor":
                requestData = await GoodsDistributorsCurrentRequestModel.findOne({ shortId: extractedPurchaseOrderId });
                if (!requestData) {
                    return res.status(404).json({ message: "Purchase request not found in GoodsDistributorsCurrentRequestModel." });
                }
                const distributedItem = requestData.goodsForRetailers.map(item => {

                    const options = item.options.map(option => `${option.optionType} ${option.values}`).join(", ");
                    return {
                        itemName: item.goods_name,
                        quantity: item.quantity,
                        options: options,
                    };
                });

                extractedData = {
                    extractedItems: distributedItem,
                    extractedTotalBuyerPayment: requestData.total_price,
                };
                break;
            default:
                return res.status(400).json({ message: "Invalid sender type." });
        }

        //Step 2: Format the data
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

        const sellerAddress = [departureAddress.city, departureAddress.neighborhood].filter(Boolean).join(", ");

        const buyerAddress = [arrivalAddress.city, arrivalAddress.neighborhood].filter(Boolean).join(", ");

        const itemNames = extractedData.extractedItems.map((item) => ethers.encodeBytes32String(item.itemName));
        const quantities = extractedData.extractedItems.map((item) => item.quantity);
        const options = extractedData.extractedItems.map((item) => item.options);

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

        // Wait for the transaction to be confirmed
        const receipt = await tx.wait();
        const newContractCounter = Number(receipt.logs[0].args[0]);

        const items = itemNames.map((name, index) => ({
            itemName: ethers.decodeBytes32String(name),
            quantity: quantities[index],
            options: options[index].split(",").map(opt => opt.trim()),
        }));

        const estimatedDates = estimatedDeliveryTimes.map(time => new Date(time * 1000));

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

        const companyAddress = await supplyChainContract.companyAddress();

        const smartContractData = await supplyChainContract.getContract(companyAddress, contractCounter);


        const transportType = Number(smartContractData.transportType);
        const weight = Number(smartContractData.weight);

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
                new Date(Number(time) * 1000).toISOString()
            ),
            actualDeliveryTime: smartContractData.actualDeliveryTime > 0
                ? new Date(Number(smartContractData.actualDeliveryTime) * 1000).toLocaleDateString("en-US")
                : "Not delivered yet",
            purchaseOrderStatus: Number(smartContractData.purchaseOrderStatus) === 0
                ? "inProgress"
                : "delivered",
            sellerAddress: smartContractData.sellerAddress,
            buyerAddress: smartContractData.buyerAddress,
            transportType: transportTypeText,
            weight: weightText,
            items: smartContractData.items.map(item => ({
                itemName: ethers.decodeBytes32String(item.itemName),
                quantity: Number(item.quantity),
                options: item.options
            })),
            transactionHash: contract.transactionHash,
            blockNumber: contract.blockNumber
        };


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

        const currentDate = new Date();


        const currentTimeInSeconds = Math.floor(currentDate.getTime() / 1000);
        const companyAddress = await supplyChainContract.companyAddress();
        const tx = await supplyChainContract.markContractAsDelivered(companyAddress, contractCounter, currentTimeInSeconds);

        const receipt = await tx.wait();

        const smartContractData = await supplyChainContract.getContract(companyAddress, contractCounter);

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
            { new: true }
        );

        res.status(200).json({
            message: "Contract updated to delivered successfully",
            data: updatedContract
        });

    } catch (error) {
        res.status(500).json({ error: "Failed to update contract", details: error.message });
    }
});

