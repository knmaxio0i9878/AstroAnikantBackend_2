const WishlistSchema = require("../models/WishlistModel")

const getAllWishlist = async(req,res) =>{

    const response = await WishlistSchema.find().populate("user").populate("product")
    if(response){
        res.status(201).json({
            data:response,
            message:"Wishlist Get Successfully"
        })
    }
    else{
        res.status(404).json({
            message:"Wishlist didn't Get Successfully"
        })
    }
}

const insertWishlist = async(req,res)=>{
    const wishlist = {
        user : req.body.user,
        product: req.body.product
    }
    const response = await WishlistSchema.create(wishlist)
     if(response){
        res.status(201).json({
            data:response,
            message:"Wishlist Inserted Successfully"
        })
    }
    else{
        res.status(404).json({
            message:"Wishlist didn't Inserted Successfully"
        })
    }
}

const deleteWishlist = async(req,res) =>{
    const id = req.params.id
     const response = await WishlistSchema.findByIdAndDelete(id)
     if(response){
        res.status(201).json({
            data:response,
            message:"Wishlist Deleted Successfully"
        })
    }
    else{
        res.status(404).json({
            message:"Wishlist didn't Didnt Successfully"
        })
    }
}


module.exports = {
    getAllWishlist,
    insertWishlist,
    deleteWishlist
}