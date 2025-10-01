const productRequest = require("../models/ProductRequest")

const insertProductRequest = async(req,res) =>{
    const request = {
        productName:req.body.name,
        fullName:req.body.fullName,
        phoneNo:req.body.phoneNo,
        email:req.body.email,
        additionalDetails:req.body.additionalDetails,
    }
    const response = await productRequest.create(request)
    if(response){
        res.status(201).json({
            data:response,
            message:"Request Get Successfully"
        })
    }
    else{
        res.status(400).json({
            message:"Request failed for product"
        })
    }
}

const getAllProductRequest = async(req,res)=>{
    const response  = await productRequest.find()
     if(response){
        res.status(201).json({
            data:response,
            message:"All Request Get Successfully"
        })
    }
    else{
        res.status(400).json({
            message:"All Request failed"
        })
    }
}

module.exports ={
    insertProductRequest,
    getAllProductRequest
}