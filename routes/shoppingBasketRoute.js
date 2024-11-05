const express = require('express');//import the express library
const authService = require("../services/authService")
const { addItemToBasket, getShoppingBasketList, getShoppingBasketDetails, removeSpecificBasketItem } = require('../services/shoppingBasketService');
const router = express.Router();

router.route('/')
    .post(authService.verifyToken, authService.allowedTo('manufacturer', 'distrebuter', 'retailer'), addItemToBasket)
    .get(authService.verifyToken, authService.allowedTo('manufacturer', 'distrebuter', 'retailer'), getShoppingBasketList)
router.route('/details')
    .get(authService.verifyToken, authService.allowedTo('manufacturer', 'distrebuter', 'retailer'), getShoppingBasketDetails);
// router.route('/:itemId')
//     .delete(authService.verifyToken, authService.allowedTo('manufacturer', 'distrebuter', 'retailer'), removeSpecificBasketItem);

module.exports = router;