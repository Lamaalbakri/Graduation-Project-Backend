const express = require('express');//import the express library
const authService = require("../services/authService")
const { createContract, getContract, updateContract } = require('../services/contractService');
const router = express.Router();

router.route('/create-contract')
    .post(createContract);
router.route('/view-contract/:orderId')
    .get(authService.verifyToken, getContract);
router.route('/update-contract')
    .put(authService.verifyToken, updateContract);

module.exports = router;