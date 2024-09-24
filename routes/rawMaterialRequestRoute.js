const express = require('express');//import the express library

const { getRawMaterialRequest } = require('../services/rowMaterialRequestService');


const router = express.Router();

//Routes
router.get('/', getRawMaterialRequest);

module.exports = router;