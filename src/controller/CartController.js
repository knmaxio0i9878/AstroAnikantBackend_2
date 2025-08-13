const cartSchema = require("../models/Cart")

const createCart = async(req,res)=>{
    console.log("dsknk");
    
    const cart = {
        user:req.body.user,
        product:req.body.product,
        order_dt:req.body.order_dt,
        status:req.body.status
    }
    const response = await cartSchema.create(cart)
    if(response){
        res.status(200).json({
            data:cart,
            message:"Created Cart"
        })
    }
    else{
        res.status(404).json({
           message:"Failed Cart"
        })
    }
}


const getAllCart = async(req,res) =>{
    
     const cart = await cartSchema.find().populate("user").populate("product");
       res.status(201).json({
           data: cart,
           message: "Successfully got all the cart"
       })
}

module.exports ={
    createCart,
    getAllCart
}