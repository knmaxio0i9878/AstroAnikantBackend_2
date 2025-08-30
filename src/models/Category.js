const mongoose = require("mongoose")
const schema = mongoose.Schema

const CategorySchema = {
    name:{
        type:String,
        // required:true
    },
    
}

module.exports = mongoose.model("Category",CategorySchema)