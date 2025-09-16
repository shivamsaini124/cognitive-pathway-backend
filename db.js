const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const userSchema = new Schema({
    firstName: String,
    lastName: String,
    email: {type: String, unique: true},
    password: String, 
})


const UserModel = mongoose.model("user",userSchema);


module.exports = {UserModel};