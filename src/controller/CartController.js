const cartSchema = require("../models/Cart");

const createCart = async (req, res) => {
    try {
        const { user, product, quantity = 1 } = req.body;

        // Find existing cart for user (only active carts)
        let existingCart = await cartSchema.findOne({ 
            user: user, 
            status: { $nin: ["ordered", "Ordered", "ORDERED"] } 
        });

        if (existingCart) {
            // Check if product already exists in cart items
            const existingItemIndex = existingCart.items.findIndex(
                item => item.product.toString() === product
            );

            if (existingItemIndex > -1) {
                // Update quantity of existing product
                existingCart.items[existingItemIndex].quantity += quantity;
            } else {
                // Add new product to cart
                existingCart.items.push({ product, quantity });
            }

            existingCart.order_dt = new Date();
            const updatedCart = await existingCart.save();
            await updatedCart.populate('items.product');

            return res.status(200).json({
                data: updatedCart,
                message: "Cart updated successfully"
            });
        }

        // Create new cart if doesn't exist
        const newCart = new cartSchema({
            user: user,
            items: [{ product, quantity }],
            order_dt: new Date(),
            status: 'active'
        });

        const savedCart = await newCart.save();
        await savedCart.populate('items.product');

        res.status(200).json({
            data: savedCart,
            message: "Cart created successfully"
        });

    } catch (error) {
        // Handle duplicate key error specifically
        if (error.code === 11000 && error.keyPattern?.user) {
            // If duplicate key error on user, try to find and update existing cart
            try {
                let existingCart = await cartSchema.findOne({ 
                    user: req.body.user, 
                    status: { $nin: ["ordered", "Ordered", "ORDERED"] } 
                });

                if (existingCart) {
                    const existingItemIndex = existingCart.items.findIndex(
                        item => item.product.toString() === req.body.product
                    );

                    if (existingItemIndex > -1) {
                        existingCart.items[existingItemIndex].quantity += req.body.quantity || 1;
                    } else {
                        existingCart.items.push({ 
                            product: req.body.product, 
                            quantity: req.body.quantity || 1 
                        });
                    }

                    existingCart.order_dt = new Date();
                    const updatedCart = await existingCart.save();
                    await updatedCart.populate('items.product');

                    return res.status(200).json({
                        data: updatedCart,
                        message: "Cart updated successfully"
                    });
                }
            } catch (retryError) {
                console.error("Retry error:", retryError);
            }
        }

        res.status(500).json({
            message: "Error managing cart",
            error: error.message
        });
    }
};

const getAllCart = async (req, res) => {
    try {
        const cart = await cartSchema.find().populate("user").populate("items.product");
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
};

const getSingleCart = async (req, res) => {
    try {
        const id = req.params.id;

        const cart = await cartSchema.findById(id)
            .populate('items.product')
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
};

// Remove individual item from cart
const removeCartItem = async (req, res) => {
    try {
        const { cartId, productId } = req.params;
        
        const cart = await cartSchema.findById(cartId);
        
        if (!cart) {
            return res.status(404).json({
                message: "Cart not found"
            });
        }

        // Remove the item from cart
        cart.items = cart.items.filter(item => item.product.toString() !== productId);
        
        // If no items left, you might want to delete the cart or set status to 'empty'
        if (cart.items.length === 0) {
            cart.status = 'empty';
        }
        
        cart.order_dt = new Date();
        const updatedCart = await cart.save();
        await updatedCart.populate('items.product');

        res.status(200).json({
            data: updatedCart,
            message: "Item removed from cart successfully"
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error removing item from cart",
            error: error.message
        });
    }
};

// Update quantity of specific item in cart
const updateCartItemQuantity = async (req, res) => {
    try {
        const { cartId, productId } = req.params;
        const { quantity } = req.body;
        
        if (quantity < 1) {
            return res.status(400).json({
                message: "Quantity must be at least 1"
            });
        }

        const cart = await cartSchema.findById(cartId);
        
        if (!cart) {
            return res.status(404).json({
                message: "Cart not found"
            });
        }

        // Find and update the specific item
        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
        
        if (itemIndex === -1) {
            return res.status(404).json({
                message: "Product not found in cart"
            });
        }

        cart.items[itemIndex].quantity = quantity;
        cart.order_dt = new Date();
        
        const updatedCart = await cart.save();
        await updatedCart.populate('items.product');

        res.status(200).json({
            data: updatedCart,
            message: "Cart item quantity updated successfully"
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error updating cart item quantity",
            error: error.message
        });
    }
};

const getCartByUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        const cart = await cartSchema.findOne({ 
            user: userId,
            status: { $nin: ["ordered", "Ordered", "ORDERED"] }
        }).populate("user").populate("items.product");
        
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
        console.error(error);
        res.status(500).json({
            message: "Error fetching user cart",
            error: error.message
        });
    }
};

// Update entire cart
const updateCart = async (req, res) => {
    try {
        const id = req.params.id;
        const updateData = req.body;
        
        const updatedCart = await cartSchema.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true, runValidators: true }
        ).populate("user").populate("items.product");
        
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
};

// Get active cart items by user (modified to work with single cart approach)
const getActiveCartByUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        const cart = await cartSchema.findOne({ 
            user: userId, 
            status: { $nin: ["ordered", "Ordered", "ORDERED", "Cleared"] }
        }).populate("user").populate("items.product");
        
        if (cart) {
            res.status(200).json({
                data: cart,
                message: "Active cart fetched successfully"
            });
        } else {
            res.status(404).json({
                message: "No active cart found for this user"
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error fetching active cart",
            error: error.message
        });
    }
};

// Clear all cart items for a user
const clearUserCart = async (req, res) => {
    try {
        const userId = req.params.userId;
        
        const cart = await cartSchema.findOne({ 
            user: userId, 
            status: { $nin: ["ordered", "Ordered", "ORDERED"] }
        });

        if (cart) {
            cart.items = [];
            cart.status = "empty";
            cart.order_dt = new Date();
            await cart.save();

            res.status(200).json({
                data: cart,
                message: "User cart cleared successfully"
            });
        } else {
            res.status(404).json({
                message: "No cart found for this user"
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error clearing cart",
            error: error.message
        });
    }
};

// Legacy function - kept for backward compatibility but deprecated
const updateCartQuantity = async (req, res) => {
    try {
        const id = req.params.id;
        const { quantity } = req.body;
        
        // This function is problematic with the new cart structure
        // Recommend using updateCartItemQuantity instead
        res.status(400).json({
            message: "This endpoint is deprecated. Please use /cart/:cartId/item/:productId/quantity instead",
            recommendedEndpoint: `/cart/${id}/item/[productId]/quantity`
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error updating cart quantity",
            error: error.message
        });
    }
};

module.exports = {
    createCart,
    getAllCart,
    getSingleCart,
    deleteCart,
    getCartByUser,
    updateCart,
    getActiveCartByUser,    
    clearUserCart,
    updateCartQuantity, // Keep for backward compatibility
    removeCartItem,     // New function
    updateCartItemQuantity // New function
};