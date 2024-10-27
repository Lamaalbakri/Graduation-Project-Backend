const express = require('express');
const authService = require("../services/authService")
const router = express.Router();
const { updateUser } = require('../services/userService');

router.put('/update/:id', authService.verifyToken, updateUser);

module.exports = router;