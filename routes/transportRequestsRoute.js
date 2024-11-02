const express = require('express');
const router = express.Router();
const authService = require("../services/authService")
const { getTransporters } = require('../services/transportersService');

router.route('/').get(authService.verifyToken, authService.allowedTo('supplier', 'manufacturer', 'distributor'), getTransporters);

module.exports = router;