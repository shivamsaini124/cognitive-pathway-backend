const jwt = require("jsonwebtoken");

require("dotenv").config();
const JWT_USER_PASSWORD = process.env.JWT_USER_PASSWORD;


const userAuth = (req, res,next) => {
    const token = req.headers.authentication;

    try{
        const payload = jwt.verify(token, JWT_USER_PASSWORD);
        req.userId = payload.userId;
        next();
    }
    catch(err){
        res.status(401).json({
            message:"Invalid Token"
        });
    }
}

module.exports = {
    userAuth
}