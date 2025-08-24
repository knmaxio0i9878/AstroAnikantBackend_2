const mongoose = require("mongoose")
const schema = mongoose.Schema

const AdminSchema = {
    email:{
        type:String,
        // required:true
    },
    password:{
        type:String,
        // required:true
    }
}

module.exports = mongoose.model("Admin",AdminSchema)