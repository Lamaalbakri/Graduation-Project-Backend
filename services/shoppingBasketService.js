const asyncHandler = require('express-async-handler')
const ShoppingBasketModel = require('../models/shoppingBasketModel');
const { getModelByUserType } = require('../models/userModel');
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

// @desc ADD Item to Basket
// @route Post /api/v1/ShoppingBasket
// @access Private/user
exports.addItemToBasket = asyncHandler(async (req, res, next) => {
    const userType = req.user.userType;
    const buyerId = req.user._id;
    const { item_id, quantity, options, sellerName } = req.body;

    const ItemModel = getItemModelByUserType(userType);
    const item = await ItemModel.findById(req.body.item_id);
    //console.log(item)
    if (!item) {
        return res.status(404).json({ message: "Item not found" });
    }
    // تأكد من تحويل quantity و unit_price إلى أرقام
    const quantityNumber = Number(quantity);
    const unitPrice = Number(item.price);

    // التحقق من القيم العددية للتأكد من عدم وجود NaN
    if (isNaN(quantityNumber) || isNaN(unitPrice)) {
        return res.status(400).json({ message: "Invalid quantity or unit price" });
    }

    const subtotal_items = unitPrice * quantityNumber;
    const shipping_cost = 1;
    const total_price = subtotal_items + shipping_cost;
    //1)Get Basket for logged user
    let basket = await ShoppingBasketModel.findOne({ buyerId });

    if (!basket) {
        //create basket for logged user with item
        basket = await ShoppingBasketModel.create({
            buyerId,
            buyerName: req.user.full_name,
            sellerId: item.supplierId,
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
            subtotal_items,
            shipping_cost,
            total_price,
        });

    } else {
        //if item is exist in basket ,then  update quantity
        const itemIndex = basket.ShoppingBasketItems.findIndex(
            (i) => i.item_id.toString() === item_id.toString() &&
                optionsAreEqual(i.options, options));
        console.log(itemIndex);


        if (itemIndex > -1) {
            const basketItem = basket.ShoppingBasketItems[itemIndex];
            // basket.ShoppingBasketItems[itemExistIndex].quantity += quantityNumber;
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
    await basket.save();
});