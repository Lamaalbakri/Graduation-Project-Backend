const express = require('express');
const { createTransportRequest } = require('../services/assignTransporterService');
const router = express.Router();

// POST request to create a new transport request
router.post('/', createTransportRequest);

module.exports = router;
  