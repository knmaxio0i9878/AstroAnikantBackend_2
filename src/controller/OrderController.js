const orderSchema = require("../models/OrderModel")

const createOrder = async(req,res) =>{
    const order = {
        order:req.body.order,
    }
    const response = await orderSchema.create(order)
    if(response){
        res.status(200).json({
            data:response,
            message:"Order Placed Successfully"
        })
    }
    else{
        res.status(404).json({
            message:"Order Failed"
        })
    }
}

module.exports = {
    createOrder
}