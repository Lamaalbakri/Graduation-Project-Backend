// routes/protectedRoute.js
const express = require('express');
const { verifyToken } = require('../services/authService');

const router = express.Router();

router.get('/protected', verifyToken, (req, res) => {
    res.send(`This is a protected route. Welcome! ${req.userType}.`);
});

module.exports = router;