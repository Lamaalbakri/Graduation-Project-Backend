const jwt = require('jsonwebtoken');
const { getModelByUserType } = require("../models/userModel");

// Create a JWT token
function createToken(userId, userType) {
    return jwt.sign({ id: userId, userType: userType }, getJwtSecret(), {
        expiresIn: process.env.JWT_EXPIRE_TIME,
    });
}

function verifyToken(req, res, next) {

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
        if (err) return res.status(500).send('Failed to authenticate token.'); // التوكن غير صالح أو انتهت صلاحيته

        try {
            console.log("User type:", decoded.userType);
            console.log("Decoded ID:", decoded.id);

            // Get the appropriate model based on userType
            const UserModel = getModelByUserType(decoded.userType);
            console.log("UserModel after calling getModelByUserType:", UserModel);

            // Check if user exists in the database
            try {
                const currentUser = await UserModel.findById(decoded.id); // البحث عن المستخدم في قاعدة البيانات
                console.log("Current user:", currentUser);

                if (!currentUser) {
                    return res.status(401).send('The user that belongs to this token does not exist anymore.');
                }

                req.userId = decoded.id;
                req.userType = decoded.userType;
                next();

            } catch (error) {
                console.error("Error in findById:", error);
                return res.status(500).send('Error fetching user: ' + error.message);
            }
            
        } catch (error) {
            return res.status(500).send('Error fetching user.'); //  حدث خطأ أثناء جلب بيانات المستخدم من قاعدة البيانات
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