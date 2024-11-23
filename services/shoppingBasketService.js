const asyncHandler = require('express-async-handler')
const ShoppingBasketModel = require('../models/shoppingBasketModel');
const RawMaterialModel = require('../models/ManageRawMaterialModel');
const ManufacturedGoodsModel = require('../models/ManageGoodsManufacturerModel');
const DistributoredGoodsModel = require('../models/ManageGoodsDistributorModel');
const { getItemModelByUserType } = require('../models/itemModel');
const mongoose = require('mongoose');

//function to check options in basket Are Equal option user try to add
function optionsAreEqual(options1, options2) {
    if (options1.length !== options2.length) return false;
    return options1.every((opt1, index) => {
        const opt2 = options2[index];
        return opt1.optionType === opt2.optionType && JSON.stringify(opt1.values) === JSON.stringify(opt2.values);
    });
}

// Function to calculate the total number of items in one basket
function calculateBasketItemCount(basket) {
    return basket.ShoppingBasketItems.reduce((total, item) => total + item.quantity, 0);
}

// Function to calculate the total number of items in all baskets
function calculateTotalItems(baskets) {
    return baskets.reduce((total, basket) => {
        return total + basket.ShoppingBasketItems.reduce((basketTotal, item) => {
            return basketTotal + item.quantity;
        }, 0);
    }, 0);
}

// Function to calculate subtotal_items, shipping_cost and total_price
function calculateBasketTotals(basket, shippingPercentage = 10) {
    let subtotal = 0;

    // Calculate subtotal_items based on the sum of (price * quantity) for each item
    basket.ShoppingBasketItems.forEach((item) => {
        subtotal += item.unit_price * item.quantity;
    });

    // Calculate the shipping as a percentage of subtotal
    const shippingCost = (subtotal * shippingPercentage) / 100;

    // Calculate the total
    const total = subtotal + shippingCost;

    return {
        subtotal_items: subtotal,
        shipping_cost: shippingCost,
        total_price: total
    };
}

// @desc ADD Item to Basket
// @route Post /api/v1/ShoppingBasket
// @access Private/user
exports.addItemToBasket = asyncHandler(async (req, res, next) => {
    const userType = req.user.userType;
    const buyerId = req.user._id;
    const { item_id, quantity, options, sellerName, sellerId } = req.body;

    const ItemModel = getItemModelByUserType(userType);
    const item = await ItemModel.findById(req.body.item_id);
    if (!item) {
        return res.status(404).json({ message: "Item not found" });
    }

    // Make sure quantity and unit_price are converted to numbers.
    const quantityNumber = Number(quantity);
    const unitPrice = Number(item.price);

    // Check numeric values ​​to make sure there is no NaN
    if (isNaN(quantityNumber) || isNaN(unitPrice)) {
        return res.status(400).json({ message: "Invalid quantity or unit price" });
    }

    //1)Get Basket for logged user
    let basket = await ShoppingBasketModel.findOne({ buyerId, sellerId });

    if (!basket) {
        //create basket for logged user with item
        basket = await ShoppingBasketModel.create({
            buyerId,
            buyerName: req.user.full_name,
            sellerId,
            sellerName,
            ShoppingBasketItems: [{
                item_id: item._id,
                item_name: item.name,
                image: item.image,
                quantity: quantityNumber,
                unit_price: item.price,
                unit: item.units[0],
                options
            }],
            subtotal_items: quantityNumber * unitPrice,
            shipping_cost: 0,//temporary until it counted in next step
            total_price: 0,//temporary until it counted in next step
        });

    } else {
        //if item is exist in basket ,then  update quantity
        const itemIndex = basket.ShoppingBasketItems.findIndex(
            (i) => i.item_id.toString() === item_id.toString() &&
                optionsAreEqual(i.options, options));


        if (itemIndex > -1) {
            const basketItem = basket.ShoppingBasketItems[itemIndex];
            basketItem.quantity += quantityNumber;
            basket.ShoppingBasketItems[itemIndex] = basketItem;
        } else {
            //item not exist,  puch it to basket
            basket.ShoppingBasketItems.push({
                item_id: item._id,
                item_name: item.name,
                image: item.image,
                quantity: quantityNumber,
                unit_price: item.price,
                unit: item.units[0],
                options
            });
        }
    }

    // Calculate final values ​​using the outer function
    const { subtotal_items, shipping_cost, total_price } = calculateBasketTotals(basket, 10);

    basket.subtotal_items = subtotal_items;
    basket.shipping_cost = shipping_cost;
    basket.total_price = total_price;

    await basket.save();

    const totalItems = calculateBasketItemCount(basket);

    res.status(200).json({ numberOfBasketItems: totalItems, message: "Items added to Basket successfly", data: basket });
});

// @desc Get ShoppingBasket Details
// @route POST /api/v1/ShoppingBasket/details
// @access Private/user
exports.getShoppingBasketDetails = asyncHandler(async (req, res, next) => {

    const userType = req.user.userType;
    const buyerId = req.user._id;
    const { basketId } = req.body;

    //1)Get Basket for logged user
    let basket = await ShoppingBasketModel.findOne({ _id: basketId });

    if (!basket) {
        return res.status(404).json({ message: "Basket not found for this user" });
    }

    // 2) Define the model map
    const modelMap = {
        manufacturer: RawMaterialModel,
        distributor: ManufacturedGoodsModel,
        retailer: DistributoredGoodsModel,
    };

    const Model = modelMap[userType];

    if (!Model) {
        return res.status(400).json({ message: "Invalid user type" });
    }

    // 3) Fetch details of each item in the basket from the appropriate model
    const detailedItems = await Promise.all(
        basket.ShoppingBasketItems.map(async (basketItem) => {
            // Get item details using the determined model
            const itemDetails = await Model.findById(basketItem.item_id);
            // Determine stock status
            let stockStatus = "Available"; // Default to available
            let stockQuantity = itemDetails.quantity;
            if (itemDetails) {
                if (stockQuantity === 0) {
                    stockStatus = "Out of Stock";
                } else if (stockQuantity < 10) {
                    stockStatus = "Stock is Low";
                }
            }

            // Return the basket item with additional details
            return {
                ...basketItem.toObject(),
                stockStatus,
                stockQuantity,
            };
        })
    );

    // Replace original items with detailed items
    basket = {
        ...basket.toObject(),
        ShoppingBasketItems: detailedItems,
    };

    // 4) Calculate the total number of items
    const totalItems = calculateBasketItemCount(basket);

    // 5) Send the response
    res.status(200).json({ numberOfBasketItems: totalItems, data: basket });
});

// @desc Get ShoppingBasket List
// @route GET /api/v1/ShoppingBasket
// @access Private/user
exports.getShoppingBasketList = asyncHandler(async (req, res, next) => {
    const userType = req.user.userType;
    const buyerId = req.user._id;

    //1)Get Basket for logged user
    let baskets = await ShoppingBasketModel.find({ buyerId });

    if (!baskets || baskets.length === 0) {
        return res.status(404).json({ message: "Basket not found for this user" });
    }

    // 2) Calculate the total number of items across all baskets
    const totalItems = calculateTotalItems(baskets);

    res.status(200).json({ numberOfBasketItems: totalItems, data: baskets });
});

// @desc Remove Item from basket
// @route Delete /api/v1/ShoppingBasket/:itemId
// @access Private/user
//This item will be removed the item with its quantity from the basket 
exports.removeSpecificBasketItem = asyncHandler(async (req, res, next) => {
    const userType = req.user.userType;
    const buyerId = req.user._id;
    const { itemId, basketId } = req.body;

    // Validate itemId as a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
        return res.status(400).json({ message: "Invalid item ID format" });
    }

    let basket = await ShoppingBasketModel.findOneAndUpdate(
        { _id: basketId },
        {
            $pull: { ShoppingBasketItems: { _id: itemId } }
        }, {
        new: true
    }
    );

    // Calculate final values ​​using the outer function
    const { subtotal_items, shipping_cost, total_price } = calculateBasketTotals(basket);

    basket.subtotal_items = subtotal_items;
    basket.shipping_cost = shipping_cost;
    basket.total_price = total_price;


    const totalItems = calculateBasketItemCount(basket);
    await basket.save();

    res.status(200).json({ numberOfBasketItems: totalItems, data: basket });
});

// @desc  Item quantity from the basket
// @route PUT /api/v1/ShoppingBasket/itemId
// @access Private/user
exports.updateBasketItemQuantity = asyncHandler(async (req, res, next) => {
    const userType = req.user.userType;
    const buyerId = req.user._id;
    const { basketId, quantity, itemId } = req.body;

    let basket = await ShoppingBasketModel.findOne({ _id: basketId });
    if (!basket) {
        return res.status(404).json({ message: "Basket not found" });
    }

    //if item is exist in basket ,then update quantity
    const itemIndex = basket.ShoppingBasketItems.findIndex(
        (i) => i._id.toString() === itemId);

    if (itemIndex > -1) {
        const basketItem = basket.ShoppingBasketItems[itemIndex];
        basketItem.quantity = quantity;
        basket.ShoppingBasketItems[itemIndex] = basketItem;
    } else {
        //item not exist,  puch it to basket
        return res.status(404).json({ message: "item not exist" });
    }
    // Calculate final values ​​using the outer function
    const { subtotal_items, shipping_cost, total_price } = calculateBasketTotals(basket, 10);

    basket.subtotal_items = subtotal_items;
    basket.shipping_cost = shipping_cost;
    basket.total_price = total_price;

    await basket.save();

    const totalItems = calculateBasketItemCount(basket);

    res.status(200).json({ numberOfBasketItems: totalItems, message: "Item quantity updated successfully", data: basket });

});

// @desc Clear user basket from DB
// @route Delete /api/v1/ShoppingBasket/
// @access Private/user
exports.clearBasket = asyncHandler(async (req, res, next) => {
    const userType = req.user.userType;
    const buyerId = req.user._id;
    const { basketId } = req.body;

    let basket = await ShoppingBasketModel.findOneAndDelete({ _id: basketId });

    if (!basket) {
        return res.status(404).json({ error: "Basket not found" });
    }

    const remainingBaskets = await ShoppingBasketModel.countDocuments({ buyerId });

    res.status(200).json({
        message: "Basket deleted successfully",
        numberOfBasketItems: remainingBaskets
    });
});