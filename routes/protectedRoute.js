// routes/protectedRoute.js
const express = require('express');
const { verifyToken } = require('../services/authService');

const router = express.Router();

router.get('/protected', verifyToken, (req, res) => {
    // يمكنك استخدام req.userId و req.userType هنا
    res.send('This is a protected route. Welcome!');
});

module.exports = router;