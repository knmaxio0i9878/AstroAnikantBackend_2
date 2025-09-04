const mongoose = require("mongoose")
const schema = mongoose.schema


const productRequest = {
    productName:{
        type:String,
        require:true
    },
    fullName:{
        type:String,
        require:true
    },
    phoneNo:{
        type:Number,
        require:true
    },
    email:{
        type:String,
        require:true
    },
    additionalDetails:{
        type:String,
        require:true
    },
}

module.exports = mongoose.model("productRequest",productRequest)