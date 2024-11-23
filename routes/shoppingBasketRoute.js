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
    .post(authService.verifyToken, authService.allowedTo('manufacturer', 'distributor', 'retailer'), addItemToBasket)
    .get(authService.verifyToken, authService.allowedTo('manufacturer', 'distributor', 'retailer'), getShoppingBasketList)
    .delete(authService.verifyToken, authService.allowedTo('manufacturer', 'distributor', 'retailer'), clearBasket)
router.route('/details')
    .post(authService.verifyToken, authService.allowedTo('manufacturer', 'distributor', 'retailer'), getShoppingBasketDetails);
router.route('/itemId')
    .put(authService.verifyToken, authService.allowedTo('manufacturer', 'distributor', 'retailer'), updateBasketItemQuantity)
    .delete(authService.verifyToken, authService.allowedTo('manufacturer', 'distributor', 'retailer'), removeSpecificBasketItem)

module.exports = router;