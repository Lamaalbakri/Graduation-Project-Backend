const jwt = require('jsonwebtoken');
const { getModelByUserType } = require('../services/userService');

// Create a JWT token
function createToken(userId, userType) {
    return jwt.sign({ id: userId, userType: userType }, getJwtSecret(), {
        expiresIn: process.env.JWT_EXPIRE_TIME,
    });
}

/*function verifyToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).send('No token provided.');

    // add lama
    // Extract the actual token (Bearer token)  
    const bearerToken = token.split(' ')[1];

    jwt.verify(bearerToken, getJwtSecret(), (err, decoded) => {
        if (err) return res.status(500).send('Failed to authenticate token.');
        req.userId = decoded.id;
        req.userType = decoded.userType;
        next();
    });
}*/
function verifyToken(req, res, next) {
    //console.log(req.headers);

    // Check if token exist
    let token;
    if ( req.headers.authorization && req.headers.authorization.startsWith('Bearer') ) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return res.status(403).send('No token provided.');
    }

    // Verify token
    jwt.verify(token, getJwtSecret(), async (err, decoded) => {
        if (err) return res.status(500).send('Failed to authenticate token.');

        try {
            // Get the appropriate model based on userType
            const UserModel = getModelByUserType(decoded.userType);
            // Check if user exists in the database
            const currentUser = await UserModel.findById(decoded.id);
            
            if (!currentUser) {
                return res.status(401).send('The user that belongs to this token does not exist anymore.');
            }

            req.userId = decoded.id;
            req.userType = decoded.userType;
            next();
        } catch (error) {
            return res.status(500).send('Error fetching user.');
        }
    });
}

function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        console.error("Missing JWT Secret");
        process.exit(1);
    }

    return secret;
}
module.exports = { verifyToken, getJwtSecret, createToken };