const express = require('express');
const router = express.Router();
const authService = require("../services/authService")
const { getTransporterPreviousRequest, createTransporterPreviousRequest, getTransporterPreviousRequestById, updateTransporterPreviousRequest, deleteTransporterPreviousRequest } = require('../services/transporterPreviousRequestService');

router.route('/')
    .get(authService.verifyToken, authService.allowedTo('transporter'), getTransporterPreviousRequest)
    .post(authService.verifyToken, createTransporterPreviousRequest);
router.route('/:id')
    .get(authService.verifyToken, authService.allowedTo('transporter'), getTransporterPreviousRequestById)
    .put(authService.verifyToken, authService.allowedTo('transporter'), updateTransporterPreviousRequest)
    .delete(authService.verifyToken, authService.allowedTo('transporter'), deleteTransporterPreviousRequest);

module.exports = router;