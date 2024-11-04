const express = require('express');
const router = express.Router();
const authService = require("../services/authService")
const { getTransporterCurrentRequest, createTransporterCurrentRequest, getTransporterCurrentRequestById, updateTransporterCurrentRequest, deleteTransporterCurrentRequest } = require('../services/transporterCurrentRequestService');

router.route('/')
    .get(authService.verifyToken, authService.allowedTo('transporter'), getTransporterCurrentRequest)
    .post(authService.verifyToken, authService.allowedTo('supplier', 'manufacturer', 'distributor'), createTransporterCurrentRequest);
router.route('/:id')
    .get(authService.verifyToken, authService.allowedTo('transporter'), getTransporterCurrentRequestById)
    .put(authService.verifyToken, authService.allowedTo('transporter'), updateTransporterCurrentRequest)
    .delete(authService.verifyToken, authService.allowedTo('transporter'), deleteTransporterCurrentRequest);

module.exports = router;