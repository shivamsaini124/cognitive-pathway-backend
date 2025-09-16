const {Router} = require("express");
const bcrypt = require("bcrypt");
const {z} = require("zod");

const {UserModel} = require("../db");
const { generateAccessToken, generateRefreshToken, verifyToken, userAuth } = require("../middlewares/user");

require("dotenv").config();

const userRouter = Router();

userRouter.post("/register",async (req, res) => {
    const bodyZodObj = z.object({
        firstName : z.string().min(3).max(50),
        lastName : z.string().min(3).max(50),
        email : z.string().min(3).max(50).email(),
        password : z.string().min(6).max(15)
    })

    const parsedObj = bodyZodObj.safeParse(req.body);

    if(!parsedObj.success){
        res.status(400).json({
            message : "Please enter valid Credentials"
        })
        return;
    }

    const {firstName, lastName, email, password} = req.body;
    const hashedPassword = await bcrypt.hash(password, 5);

    try{
        const newUser = await UserModel.create({
            firstName:firstName,
            lastName:lastName,
            email:email,
            password:hashedPassword
        });
        
        // Generate tokens for immediate login after registration
        const accessToken = generateAccessToken(newUser._id, newUser.email);
        const refreshToken = generateRefreshToken(newUser._id);
        
        res.status(201).json({
            success: true,
            message: "Account created successfully",
            user: {
                id: newUser._id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email
            },
            tokens: {
                accessToken,
                refreshToken
            }
        });
    }
    catch(err){
        console.error('Registration error:', err);
        
        let message = "Registration failed";
        if (err.code === 11000) {
            message = "Email already exists";
        }
        
        res.status(400).json({
            success: false,
            message: message
        });
    }
})

userRouter.post("/login",async (req, res) => {
    const bodyZodObj = z.object({
        email : z.string(),
        password : z.string()
    })

    const parsedObj = bodyZodObj.safeParse(req.body);

    if(!parsedObj.success){
        res.status(400).json({
            message : "Please enter valid Credentials"
        })
        return;
    }

    const {email, password} = req.body;

    const user = await UserModel.findOne({
        email:email
    })

    if(!user){
        return res.status(400).json({
            success: false,
            message: "User does not exist"
        });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if(isValidPassword){
        try {
            // Generate both access and refresh tokens
            const accessToken = generateAccessToken(user._id, user.email);
            const refreshToken = generateRefreshToken(user._id);
            
            res.json({
                success: true,
                message: "Login successful",
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email
                },
                tokens: {
                    accessToken,
                    refreshToken
                }
            });
        } catch (tokenError) {
            console.error('Token generation error:', tokenError);
            return res.status(500).json({
                success: false,
                message: "Login failed - token generation error"
            });
        }
    }
    else{
        res.status(401).json({
            success: false,
            message: "Incorrect credentials"
        });
    }

})

// POST /api/users/refresh - Refresh access token using refresh token
userRouter.post("/refresh", async (req, res) => {
    try {
        const { refreshToken } = req.body;
        
        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: "Refresh token is required"
            });
        }
        
        // Verify refresh token
        const payload = verifyToken(refreshToken);
        
        if (payload.type !== 'refresh') {
            return res.status(400).json({
                success: false,
                message: "Invalid token type"
            });
        }
        
        // Get user details
        const user = await UserModel.findById(payload.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        // Generate new access token
        const newAccessToken = generateAccessToken(user._id, user.email);
        
        res.json({
            success: true,
            message: "Token refreshed successfully",
            tokens: {
                accessToken: newAccessToken
            }
        });
        
    } catch (error) {
        console.error('Token refresh error:', error);
        
        let message = "Token refresh failed";
        if (error.name === 'TokenExpiredError') {
            message = "Refresh token has expired. Please login again";
        } else if (error.name === 'JsonWebTokenError') {
            message = "Invalid refresh token";
        }
        
        res.status(401).json({
            success: false,
            message
        });
    }
});

// GET /api/users/profile - Get user profile (protected route)
userRouter.get("/profile", userAuth, async (req, res) => {
    try {
        const user = await UserModel.findById(req.userId).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        res.json({
            success: true,
            message: "Profile retrieved successfully",
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                createdAt: user.createdAt
            }
        });
        
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve profile"
        });
    }
});

// POST /api/users/logout - Logout (in a real app, you'd blacklist the tokens)
userRouter.post("/logout", userAuth, (req, res) => {
    // In a production app, you would:
    // 1. Add tokens to a blacklist/redis cache
    // 2. Or maintain a session store
    // For now, we'll just return success (client should discard tokens)
    
    res.json({
        success: true,
        message: "Logged out successfully. Please discard your tokens."
    });
});

module.exports = userRouter;
