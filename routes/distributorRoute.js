const express = require('express');
const { searchDistributors } = require('../services/distributorsService');
const router = express.Router();
const authService = require("../services/authService")

router.get('/:category/:searchText', authService.verifyToken, searchDistributors);
module.exports = router; 