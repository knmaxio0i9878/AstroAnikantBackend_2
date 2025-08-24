const cartSchema = require("../models/Cart")

const createCart = async(req,res)=>{
    try {
        // Check if product already exists in user's cart
        const existingCartItem = await cartSchema.findOne({
            user: req.body.user,
            product: req.body.product
        });

        if (existingCartItem) {
            return res.status(409).json({
                message: "Product already exists in cart"
            });
        }

        const cart = {
            user: req.body.user,
            product: req.body.product,
            order_dt: req.body.order_dt,
            status: req.body.status
        }
        
        const response = await cartSchema.create(cart)
        if(response){
            res.status(200).json({
                data: response, // Return the created response instead of cart
                message: "Created Cart"
            })
        }
        else{
            res.status(404).json({
               message: "Failed Cart"
            })
        }
    } catch (error) {
        res.status(500).json({
            message: "Error creating cart",
            error: error.message
        });
    }
}


const getAllCart = async(req,res) =>{
    
     const cart = await cartSchema.find().populate("user").populate("product");
       res.status(201).json({
           data: cart,
           message: "Successfully got all the cart"
       })
}
const getSingleCart = async (req, res) => {
    try {
        const id = req.params.id;

        const cart = await cartSchema.findById(id)
            .populate('product') // Populate product details
            .populate('user');   // Populate user details

        if (cart) {
            res.status(200).json({
                data: cart,
                message: "Cart Fetched Successfully"
            });
        } else {
            res.status(404).json({
                message: "Cart not Fetched Successfully"
            });
        }
    } catch (error) {
        res.status(500).json({
            message: "Error fetching cart",
            error: error.message
        });
    }
};



const deleteCart = async (req, res) => {
    const id = req.params.id;
    const deleteCart = await cartSchema.findByIdAndDelete(id)
    if (deleteCart) {
        res.status(200).json({
            data: deleteCart,
            message: 'Cart deleted Successfully'
        })
    }
    else {
        res.status(404).json({
            message: 'No such State found'
        })
    }
}

const getCartByUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        const cart = await cartSchema.find({ user: userId }).populate("user").populate("product");
        
        if (cart) {
            res.status(200).json({
                data: cart,
                message: "User cart fetched successfully"
            });
        } else {
            res.status(404).json({
                message: "No cart found for this user"
            });
        }
    } catch (error) {
        res.status(500).json({
            message: "Error fetching user cart",
            error: error.message
        });
    }
}


module.exports ={
    createCart,
    getAllCart,
    getSingleCart,
    deleteCart,
    getCartByUser  // Add this export
}