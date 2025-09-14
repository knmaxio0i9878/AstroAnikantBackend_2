const router = require("express").Router()
const wishlishController = require("../controller/WishlistController")

router.get("/getallwishlist",wishlishController.getAllWishlist)
router.post("/insertwishlist",wishlishController.insertWishlist)
router.delete("/deletewishlist/:id",wishlishController.deleteWishlist)

module.exports = router