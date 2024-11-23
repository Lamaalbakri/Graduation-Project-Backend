const express = require('express');
const { searchSuppliers } = require('../services/suppliersService');
const router = express.Router();
const authService = require("../services/authService")

router.get('/:category/:searchText', authService.verifyToken, searchSuppliers);
module.exports = router; 