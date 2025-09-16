const jwt = require("jsonwebtoken");

require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN;

// JWT Utility Functions
const generateAccessToken = (userId, email) => {
    if (!JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured');
    }
    
    return jwt.sign(
        { 
            userId: userId,
            email: email,
            type: 'access',
            iat: Math.floor(Date.now() / 1000)
        },
        JWT_SECRET,
        { 
            expiresIn: JWT_EXPIRES_IN || '1h',
            issuer: 'cognitive-pathways-backend',
            audience: 'cognitive-pathways-frontend'
        }
    );
};

const generateRefreshToken = (userId) => {
    if (!JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured');
    }
    
    return jwt.sign(
        { 
            userId: userId,
            type: 'refresh',
            iat: Math.floor(Date.now() / 1000)
        },
        JWT_SECRET,
        { 
            expiresIn: JWT_REFRESH_EXPIRES_IN || '7d',
            issuer: 'cognitive-pathways-backend',
            audience: 'cognitive-pathways-frontend'
        }
    );
};

const verifyToken = (token) => {
    if (!JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured');
    }
    
    return jwt.verify(token, JWT_SECRET, {
        issuer: 'cognitive-pathways-backend',
        audience: 'cognitive-pathways-frontend'
    });
};


const userAuth = (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: "Access denied. No token provided or invalid format. Expected: Bearer <token>"
            });
        }
        
        // Extract token from "Bearer <token>"
        const token = authHeader.split(' ')[1];
        
        if (!token || token === 'null' || token === 'undefined') {
            return res.status(401).json({
                success: false,
                message: "Access denied. No token provided"
            });
        }
        
        // Check for obvious test/placeholder tokens
        if (token === 'your-jwt-token-here' || token.length < 10) {
            console.warn(`[JWT] Placeholder/invalid token attempted from ${req.ip || 'unknown IP'}`);
            return res.status(401).json({
                success: false,
                message: "Access denied. Invalid token format"
            });
        }
        
        // Verify token using our utility function
        const payload = verifyToken(token);
        
        // Ensure it's an access token
        if (payload.type !== 'access') {
            return res.status(401).json({
                success: false,
                message: "Access denied. Invalid token type"
            });
        }
        
        // Add user info to request object
        req.userId = payload.userId;
        req.userEmail = payload.email;
        
        next();
        
    } catch (err) {
        // Enhanced error logging
        const errorType = err.name || 'Unknown';
        const endpoint = req.originalUrl || req.url;
        const timestamp = new Date().toISOString();
        
        console.error(`[${timestamp}] JWT Error - Type: ${errorType}, Endpoint: ${endpoint}, IP: ${req.ip || 'unknown'}`);
        
        // Return appropriate error message
        let message = "Access denied. Invalid token";
        let statusCode = 401;
        
        switch (err.name) {
            case 'JsonWebTokenError':
                message = "Access denied. Malformed token";
                break;
            case 'TokenExpiredError':
                message = "Access denied. Token has expired";
                break;
            case 'NotBeforeError':
                message = "Access denied. Token not yet valid";
                break;
            case 'Error':
                if (err.message.includes('JWT_SECRET')) {
                    message = "Server configuration error";
                    statusCode = 500;
                }
                break;
        }
        
        res.status(statusCode).json({
            success: false,
            message
        });
    }
};

module.exports = {
    userAuth,
    generateAccessToken,
    generateRefreshToken,
    verifyToken
}
