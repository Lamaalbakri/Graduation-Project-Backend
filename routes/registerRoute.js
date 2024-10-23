const express = require("express");
const router = express.Router();
const { register } = require('../services/userService');

router.route('/').post(register);

module.exports = router;