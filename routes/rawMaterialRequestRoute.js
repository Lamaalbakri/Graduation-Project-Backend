const express = require('express');//import the express library

const { getRawMaterialRequest, createRawMaterialRequest } = require('../services/rowMaterialRequestService');


const router = express.Router();

//Routes
router.route('/').get(getRawMaterialRequest).post(createRawMaterialRequest);

module.exports = router;