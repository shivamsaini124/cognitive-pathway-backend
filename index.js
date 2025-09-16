require("dotenv").config();
PORT = process.env.PORT;
const DB_URL = process.env.DB_URL;

const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());


const main = async () => {
    try{
        await mongoose.connect(DB_URL);
        app.listen(PORT);
        console.log(`Server is live at ${PORT}`);
    }
    catch(err){
        console.log(err);
    }
}


main();