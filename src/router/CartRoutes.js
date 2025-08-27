const cartController = require("../controller/CartController")
const router = require("express").Router()


router.post("/createcart",cartController.createCart)
router.get("/getcart",cartController.getAllCart)
router.get("/getsinglecart/:id",cartController.getSingleCart)
router.get("/deletecart/:id",cartController.deleteCart)
router.get("/getcart/:userId", cartController.getCartByUser)  // Add this route
router.put("/updatecart/:id", cartController.updateCart)  // Add this route
router.get("/getactivecart/:userId", cartController.getActiveCartByUser)
router.put("/clearcart/:userId", cartController.clearUserCart)
router.put("/updatequantity/:id", cartController.updateCartQuantity)



module.exports = router
