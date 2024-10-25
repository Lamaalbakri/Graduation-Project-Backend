const express = require('express');
const authService = require("../services/authService")
const router = express.Router();
const { login, getLoggedUserData, getOne } = require('../services/userService');


router.get('/getMe', authService.verifyToken, getLoggedUserData, getOne)
router.post('/', login);

module.exports = router;
