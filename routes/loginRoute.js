const express = require('express');
const authService = require("../services/authService")
const router = express.Router();
const { login, getLoggedUserData, getOne , getOneWithSupplier} = require('../services/userService');


router.get('/getMe', authService.verifyToken, getLoggedUserData, getOne)
//return the supplier data for specific manufacturers
router.get('/getMeWithSuppliers', authService.verifyToken, getLoggedUserData, getOneWithSupplier)
router.post('/', login);

module.exports = router;
