const cartController = require("../controller/CartController")
const router = require("express").Router()


router.post("/createcart",cartController.createCart)
router.get("/getcart",cartController.getAllCart)
router.get("/getsinglecart/:id",cartController.getSingleCart)
router.get("/deletecart/:id",cartController.deleteCart)




module.exports = router
