const express = require('express');
const { searchManufacturers } = require('../services/manufacturersService');
const router = express.Router();
const authService = require("../services/authService")

router.get('/:category/:searchText', authService.verifyToken, searchManufacturers);
module.exports = router; 