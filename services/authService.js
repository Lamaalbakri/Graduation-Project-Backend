const jwt = require('jsonwebtoken');
const { getModelByUserType } = require("../models/userModel");

//@desc Create a JWT token
function createToken(userId, userType) {
    return jwt.sign({ id: userId, userType: userType }, getJwtSecret(), {
        expiresIn: process.env.JWT_EXPIRE_TIME,
    });
}

//@desc make sure that the user is logged in
function verifyToken(req, res, next) {

    // Check if token exist
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).send('You are not login, Please login to get access');
    }

    // Verify token
    jwt.verify(token, getJwtSecret(), async (err, decoded) => {
        if (err) return res.status(500).send('Failed to authenticate token.'); //Token is invalid or expired

        try {
            // Get the appropriate model based on userType
            const UserModel = getModelByUserType(decoded.userType);
            // Check if user exists in the database
            try {
                const currentUser = await UserModel.findById(decoded.id);


                if (!currentUser) {
                    return res.status(401).send('The user that belongs to this token does not exist anymore.');
                }
                req.user = currentUser;
                req.userId = decoded.id;
                req.userType = decoded.userType;
                next();

            } catch (error) {
                return res.status(500).send('Error fetching user: ' + error.message);
            }

        } catch (error) {
            return res.status(500).send('Error fetching user.');
        }
    });
}

function allowedTo(...roles) {
    return (req, res, next) => {
        if (!roles.includes(req.user.userType)) {
            return res.status(403).send('You are not allowed to access this route');
        }
        next();
    };
};

function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        process.exit(1);
    }

    return secret;
}
module.exports = { verifyToken, getJwtSecret, createToken, allowedTo };