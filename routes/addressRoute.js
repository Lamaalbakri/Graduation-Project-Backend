const express = require('express');//import the express library
const authService = require("../services/authService")
const { createAddress, getAddressByUserId, updateAddress } = require("../services/addressService");


const router = express.Router();

//Routes
router.route('/')
    .get(authService.verifyToken, authService.allowedTo("supplier", "manufacturer", "distributor", "retailer"), getAddressByUserId)
    .post(authService.verifyToken, authService.allowedTo("supplier", "manufacturer", "distributor", "retailer"), createAddress);
router.route('/:id')
    .put(authService.verifyToken, authService.allowedTo("supplier", "manufacturer", "distributor", "retailer"), updateAddress);
module.exports = router;

