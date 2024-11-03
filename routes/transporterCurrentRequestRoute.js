const express = require('express');
const router = express.Router();
const authService = require("../services/authService")
const { getTransporterCurrentRequest, createTransporterCurrentRequest } = require('../services/transporterCurrentRequestService');

router.route('/').get(authService.verifyToken, authService.allowedTo('transporter'), getTransporterCurrentRequest)
    .post(authService.verifyToken, authService.allowedTo('supplier', 'manufacturer', 'distributor'), createTransporterCurrentRequest);

module.exports = router;