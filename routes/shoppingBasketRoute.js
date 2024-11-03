const express = require('express');//import the express library
const authService = require("../services/authService")
const { addItemToBasket } = require('../services/shoppingBasketService');
const router = express.Router();

router.route('/')
    .post(authService.verifyToken, authService.allowedTo('manufacturer', 'distrebuter', 'retailer'), addItemToBasket);
// router.route('/:id')
//     .get(authService.verifyToken, authService.allowedTo('supplier', 'manufacturer'), getRawMaterialCurrentRequestById)
//     .put(authService.verifyToken, authService.allowedTo('supplier'), updateRawMaterialCurrentRequest)
//     .delete(authService.verifyToken, authService.allowedTo('supplier'), deleteRawMaterialCurrentRequest); // Define a special path for ObjectId
// router.route('/manufacturer/slug/:slug')
//     .get(authService.verifyToken, authService.allowedTo('supplier', 'manufacturer'), getRawMaterialCurrentRequestByMSlug); // Path to search for manufacturer slug
// router.route('/manufacturerName/:manufacturerName')
//     .get(authService.verifyToken, authService.allowedTo('supplier'), getRawMaterialCurrentRequestByMName);

module.exports = router;