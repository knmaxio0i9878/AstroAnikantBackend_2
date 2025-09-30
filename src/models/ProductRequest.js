const mongoose = require("mongoose")
const Schema = mongoose.Schema  // Fix: Capital 'S' in Schema

const productRequestSchema = new Schema({  // Fix: Create actual schema
    productName:{
        type: String,  // Fix: Capital 'S'
        required: true  // Fix: 'required' not 'require'
    },
    fullName:{  // Fix: Matches your controller
        type: String,
        required: true
    },
    phoneNo:{
        type: String,  // Changed to String for better phone handling
        required: true
    },
    email:{
        type: String,
        required: true
    },
    additionalDetails:{
        type: String,
        required: false  // Optional field
    },
}, { timestamps: true })

module.exports = mongoose.model("productRequest", productRequestSchema)