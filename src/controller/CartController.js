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

const getAllCart = async(req,res) => {
    try {
        const cart = await cartSchema.find().populate("user").populate("product");
        res.status(200).json({
            data: cart,
            message: "Successfully got all the cart"
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Server Error",
            error: err.message,
        });
    }
}

const getSingleCart = async (req, res) => {
    try {
        const id = req.params.id;

        const cart = await cartSchema.findById(id)
            .populate('product')
            .populate('user');

        if (cart) {
            res.status(200).json({
                data: cart,
                message: "Cart Fetched Successfully"
            });
        } else {
            res.status(404).json({
                message: "Cart not found"
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error fetching cart",
            error: error.message
        });
    }
};

const deleteCart = async (req, res) => {
    try {
        const id = req.params.id;
        const deleteCart = await cartSchema.findByIdAndDelete(id);
        
        if (deleteCart) {
            res.status(200).json({
                data: deleteCart,
                message: 'Cart deleted Successfully'
            });
        } else {
            res.status(404).json({
                message: 'No such Cart found'
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Server Error",
            error: err.message,
        });
    }
}

const updateCartQuantity = async (req, res) => {
    try {
        const id = req.params.id;
        const { quantity } = req.body;
        
        const updatedCart = await cartSchema.findByIdAndUpdate(
            id, 
            { quantity: quantity },
            { new: true, runValidators: true }
        ).populate("user").populate("product");
        
        if (updatedCart) {
            res.status(200).json({
                data: updatedCart,
                message: "Cart quantity updated successfully"
            });
        } else {
            res.status(404).json({
                message: "Cart not found"
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error updating cart quantity",
            error: error.message
        });
    }
}

// Update the existing getCartByUser function to filter out ordered items
// Update the existing getCartByUser function to filter out ordered items
const getCartByUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        const cart = await cartSchema.find({ 
            user: userId,
            status: { 
                $nin: ["ordered", "Ordered", "ORDERED"] // Exclude all variations of ordered status
            }
        }).populate("user").populate("product");
        
        if (cart && cart.length > 0) {
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
        console.error(error);
        res.status(500).json({
            message: "Error fetching user cart",
            error: error.message
        });
    }
}
// Update cart item (useful for changing quantity, status, etc.)
const updateCart = async (req, res) => {
    try {
        const id = req.params.id;
        const updateData = req.body;
        
        const updatedCart = await cartSchema.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true, runValidators: true }
        ).populate("user").populate("product");
        
        if (updatedCart) {
            res.status(200).json({
                data: updatedCart,
                message: "Cart updated successfully"
            });
        } else {
            res.status(404).json({
                message: "Cart not found"
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error updating cart",
            error: error.message
        });
    }
}

// Get active cart items by user (only items with status "In Cart")
const getActiveCartByUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        const cart = await cartSchema.find({ 
            user: userId, 
            status: "In Cart" 
        }).populate("user").populate("product");
        
        res.status(200).json({
            data: cart,
            message: "Active cart items fetched successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error fetching active cart",
            error: error.message
        });
    }
}

// Clear all cart items for a user (set status to "Cleared" instead of deleting)
const clearUserCart = async (req, res) => {
    try {
        const userId = req.params.userId;
        
        const result = await cartSchema.updateMany(
            { user: userId, status: "In Cart" },
            { status: "Cleared" }
        );
        
        res.status(200).json({
            data: result,
            message: "User cart cleared successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error clearing cart",
            error: error.message
        });
    }
}



module.exports ={
    createCart,
    getAllCart,
    getSingleCart,
    deleteCart,
    getCartByUser,  // Add this export
    updateCart,
    getActiveCartByUser,    
    clearUserCart,
    updateCartQuantity
}