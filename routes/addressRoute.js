const express = require('express');//import the express library
const authService = require("../services/authService")
const { createAddress, getAddressById, updateAddress } = require("../services/addressService");


const router = express.Router();

//Routes
router.route('/')
    .post(authService.verifyToken, authService.allowedTo("supplier", "manufacturer", "distributor", "retailer"), createAddress);
router.route('/:id')
    .get(authService.verifyToken, authService.allowedTo("supplier", "manufacturer", "distributor", "retailer"), getAddressById)
    .put(authService.verifyToken, authService.allowedTo("supplier", "manufacturer", "distributor", "retailer"), updateAddress);
module.exports = router;

//const addressRoute = require('./routes/addressRoute');
//app.use('/api/v1/address', addressRoute);
