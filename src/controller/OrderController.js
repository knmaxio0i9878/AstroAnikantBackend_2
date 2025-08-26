const orderSchema = require("../models/OrderModel")

const createOrder = async (req, res) => {
    const order = {
        cart: req.body.cart,
    }
    const response = await orderSchema.create(order)
    if (response) {
        res.status(200).json({
            data: response,
            message: "Order Placed Successfully"
        })
    }
    else {
        res.status(404).json({
            message: "Order Failed"
        })
    }
}
const getAllOrder = async (req, res) => {

    const order = await orderSchema.find().populate("cart").populate({
        path: "cart",
        populate: {
            path: "user"
        }
    }).populate({
        path: "cart",
        populate: {
            path: "product"
        }
    })
    res.status(201).json({
        data: order,
        message: "Successfully got all the orders"
    })
}



const getSingleOrder = async (req, res) => {
    const id = req.params.id;

    try {
        // Fetch order and populate the necessary fields
        const order = await orderSchema.findById(id).populate("cart").populate({
            path:"cart",
            populate:{
                path:"user"
            }
        }).populate({
            path:"cart",
            populate:{
                path:"product"
            }
        })
            
        if (order) {
            return res.status(200).json({
                data: order,
                message: "Single Order Retrieved Successfully",
            });
        } else {
            return res.status(404).json({
                message: "Order Not Found",
            });
        }
    } catch (err) {
        console.error(err);        
        res.status(500).json({
            message: "Server Error",
            error: err.message, 
        });
    }
};

const deleteOrder = async (req, res) => {
    const id = req.params.id;
    const deleteOrder = await orderSchema.findByIdAndDelete(id)
    console.log(deleteOrder);
    if (deleteOrder) {
        res.status(201).json({
            data: deleteOrder,
            message: 'Ordder deleted Successfully'
        })
    }
    else {
        res.status(404).json({
            message: 'No such State found'
        })
    }
}
// const updateOrderComplete = async (req, res) => {
//     const id = req.params.id
    

//     try {
//         const order = await orderschema.findById(id).populate("user_id")
//         const email = order?.user?.email
//         console.log("email", email);
//         const orderstatus = {
//             status: req.body.status,
//             halfamount: req.body.halfamount,
//             remainingamount: req.body.remainingamount
//         }

//         const response = await orderschema.findByIdAndUpdate(id, orderstatus)
//         await mail.sendingMail(email, "AdVUE Order Success", emailBody)
//         if (response) {
//             res.status(201).json({
//                 data: response,
//                 message: 'Order updated Successfully'
//             })
//         }
//         else {
//             res.status(404).json({
//                 message: 'No such Order found'
//             })
//         }
//     }
//     catch (error) {
//         console.log(error);

//     }



// }
// const updateOrderCancel = async (req, res) => {
//     const id = req.params.id
//     const emailBody = `
//   <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
//     <h3 style="color: #333;">We are sorry to say you that your order is being cancelled due to unpaid payment !</h3><br/>
//     <h3 style="color: #333;">If you want to continue then pay the remaining payment. The number of days will not be added to your advertisement.</h3><br/>
//     <h3 style="color: #333;">You can pay the remaining amount that we provided bank details on your previous email.</h3><br/>
//     <h3 style="color: #333;">Here is the upi details also : <b><ul>pmakwana1908@ohkhdhc</ul></b></h3><br/>



    
    
//     <p style="margin-top: 20px; color: #555;">If you have any questions, feel free to contact us.</p> <br />

//     <p style="margin-top: 20px; color: #555;">AdVUE Office : 8140952934 </p> <br />

//   </div>
// `;

//     try {
//         const order = await orderschema.findById(id).populate("user_id")
//         const email = order?.user_id?.email
//         console.log("email", email);
//         const orderstatus = {
//             status: req.body.status,
//             halfamount: req.body.halfamount,
//             remainingamount: req.body.remainingamount
//         }

//         const response = await orderschema.findByIdAndUpdate(id, orderstatus)
//         await mail.sendingMail(email, "AdVUE Order Cancelled", emailBody)
//         if (response) {
//             res.status(201).json({
//                 data: response,
//                 message: 'Order updated Successfully'
//             })
//         }
//         else {
//             res.status(404).json({
//                 message: 'No such Order found'
//             })
//         }
//     }
//     catch (error) {
//         console.log(error);

//     }

// }

module.exports = {
    createOrder,
    getAllOrder,
    getSingleOrder,
    deleteOrder
}