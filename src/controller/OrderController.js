const orderSchema = require("../models/OrderModel")
const mailUtil = require("../service/MailUtil")
const cartSchema = require("../models/Cart")


const createOrder = async (req, res) => {
    const order = {
        cart: req.body.cart,
        // Add other order-specific fields from req.body if needed
        typeOfPayment: req.body.typeOfPayment
    }

    const response = await orderSchema.create(order)
    if (response) {
         await cartSchema.findByIdAndUpdate(req.body.cart, { status: "Ordered" });
        // Populate the cart with user and product details for email
        const populatedOrder = await orderSchema.findById(response._id)
            .populate({
                path: 'cart',
                populate: [
                    { path: 'user' },
                    { path: 'items.product' }
                ]
            });

        console.log('Sending mail to:', populatedOrder?.cart?.user?.email);
        console.log(populatedOrder)
    // const emailBody = `
    //   <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background: #f9f9f9;">
    //     <h2 style="color: #2E4057;">Welcome to Astro!</h2>
    //    <p style={{ color: "#333", fontSize: "16px" }}>
    //           Hello, <strong>${order?.cart?.user?.name}</strong>, <br />
    //           Your Astro-item ${order?.cart?.product?.name} has been successfully ordered on ${order?.order_dt}} . 🎉
    //     </p>

    //     <br/><br/>
        
    //     <p> Delivery Place : ${order?.cart?.user?.address?.societyName},${order?.cart?.user?.address?.street},
    //     ${order?.cart?.user?.address?.city},${order?.cart?.user?.address?.pincode}</p>

    //     <p style="color: #555; font-size: 15px; margin-top: 15px;">
    //       Thanks for chosing Astro.
    //     </p>
    
    
    //     <p style="color: #555; font-size: 14px;">
    //       If you have any questions, feel free to contact us.
    //     </p>
    //     <p style="color: #555; font-size: 14px; margin-top: 5px;">
    //       📞 Astro Office: <strong>98765 43210</strong>
    //     </p>
    
    //     <hr style="margin: 30px 0; border: 0; border-top: 1px solid #eee;" />
    
    //     <p style="color: #999; font-size: 12px;">
    //       © ${new Date().getFullYear()} Astro. All rights reserved.
    //     </p>
    //   </div>
    // `;
        // await mailUtil.sendingMail("pmakwana1908@gmail.com", "Order Placed !", emailBody);

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
    try {
        const order = await orderSchema.find().populate({
            path: "cart",
            populate: [
                { path: "user" },
                { 
                    path: "items.product",
                    select: "name price images description slug category stock discountedPrice"
                }
            ]
        });

        res.status(200).json({
            data: order,
            message: "Successfully got all the orders"
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Server Error",
            error: err.message,
        });
    }
}

const getSingleOrder = async (req, res) => {
    const id = req.params.id;   

    try {
        // Fetch order and populate the necessary fields
        const order = await orderSchema.findById(id).populate({
            path: "cart",
            populate: [
                { path: "user" },
                { path: "items.product" }
            ]
        });

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
    
    try {
        const deleteOrder = await orderSchema.findByIdAndDelete(id);
        console.log(deleteOrder);
        
        if (deleteOrder) {
            // Optional: Update cart status back to "In Cart" when order is deleted
            await cartSchema.findByIdAndUpdate(deleteOrder.cart, { status: "In Cart" });
            
            res.status(200).json({
                data: deleteOrder,
                message: 'Order deleted Successfully'
            });
        } else {
            res.status(404).json({
                message: 'No such Order found'
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Server Error",
            error: err.message,
        });
    }
}// const updateOrderComplete = async (req, res) => {
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
const getUserOrders = async (req, res) => {
    const userId = req.params.userId;
    console.log('Requested userId:', userId);
    
    try {
        // First, get all orders without population
        const allOrders = await orderSchema.find();
        console.log('Total orders in database:', allOrders.length);
        
        // Now populate them
        const populatedOrders = await orderSchema.find()
            .populate({
                path: "cart",
                populate: [
                    { path: "user" },
                    { 
                        path: "items.product",
                        select: "name price images description shortDescription"
                    }
                ]
            });

        console.log('Populated orders:', populatedOrders.length);
        
        // Check the structure
        if (populatedOrders.length > 0) {
            console.log('Sample order structure:', JSON.stringify(populatedOrders[0], null, 2));
        }

        // Filter for user
        const filteredOrders = populatedOrders.filter(order => {
            const orderUserId = order?.cart?.user?._id?.toString();
            console.log('Order user ID:', orderUserId, 'Requested user ID:', userId);
            return orderUserId === userId;
        });

        console.log('Filtered orders for user:', filteredOrders.length);

        res.status(200).json({
            data: filteredOrders,
            message: "User orders retrieved successfully"
        });
    } catch (err) {
        console.error('Error in getUserOrders:', err);
        res.status(500).json({
            message: "Server Error",
            error: err.message,
        });
    }
};
// Add this to your module.exports
module.exports = {
    createOrder,
    getAllOrder,
    getSingleOrder,
    deleteOrder,
    getUserOrders  // Add this line
};