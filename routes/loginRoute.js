const express = require('express');
const authService = require("../services/authService")
const router = express.Router();
const { login, getLoggedUserData, getOne , getOneWithSupplier , getOneWithManufacturer , getMeWithDistributor} = require('../services/userService');


router.get('/getMe', authService.verifyToken, getLoggedUserData, getOne)
router.get('/getMeWithSuppliers', authService.verifyToken, getLoggedUserData, getOneWithSupplier)
router.get('/getMeWithManufacturers', authService.verifyToken, getLoggedUserData, getOneWithManufacturer)
router.get('/getMeWithDistributors', authService.verifyToken, getLoggedUserData, getMeWithDistributor)
router.post('/', login);

module.exports = router;