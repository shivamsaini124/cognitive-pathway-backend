const {Router} = require("express");
const bcrypt = require("bcrypt");
const {z} = require("zod");
const jwt = require("jsonwebtoken");

const {UserModel} = require("../db");

require("dotenv").config();
const JWT_USER_PASSWORD = process.env.JWT_USER_PASSWORD;

const userRouter = Router();

userRouter.post("/signup",async (req, res) => {
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
        await UserModel.create({
            firstName:firstName,
            lastName:lastName,
            email:email,
            password:hashedPassword
        })
        res.json({
            message:"Signed Up successfully"
        })
    }
    catch(err){
        res.status(400).json({
            message:"Email already exists",
            // error:err
        })
    }
})

userRouter.post("/signin",async (req, res) => {
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
        res.status(400).json({
            message: "User does not exist"
        })
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if(isValidPassword){
        const token = jwt.sign({
            userId:user._id
        },JWT_USER_PASSWORD);

        res.json({
            token: token
        })
    }
    else{
        res.status(401).message({
            message: "Incorrect Credentials"
        })
    }

})



module.exports = userRouter;