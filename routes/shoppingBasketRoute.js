const express = require('express');//import the express library
const authService = require("../services/authService")
const { addItemToBasket,
    getShoppingBasketList,
    getShoppingBasketDetails,
    removeSpecificBasketItem,
    clearBasket,
    updateBasketItemQuantity } = require('../services/shoppingBasketService');
const router = express.Router();

router.route('/')
    .post(authService.verifyToken, authService.allowedTo('manufacturer', 'distrebuter', 'retailer'), addItemToBasket)
    .get(authService.verifyToken, authService.allowedTo('manufacturer', 'distrebuter', 'retailer'), getShoppingBasketList)
    .delete(authService.verifyToken, authService.allowedTo('manufacturer', 'distrebuter', 'retailer'), clearBasket)
router.route('/details')
    .post(authService.verifyToken, authService.allowedTo('manufacturer', 'distrebuter', 'retailer'), getShoppingBasketDetails);
router.route('/itemId')
    .put(authService.verifyToken, authService.allowedTo('manufacturer', 'distrebuter', 'retailer'), updateBasketItemQuantity)
    .delete(authService.verifyToken, authService.allowedTo('manufacturer', 'distrebuter', 'retailer'), removeSpecificBasketItem)

module.exports = router;