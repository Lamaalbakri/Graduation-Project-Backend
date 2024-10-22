const express = require('express');
const router = express.Router();
const { login } = require('../services/userService');

router.post('/', login);

module.exports = router;
