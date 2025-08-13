const cartController = require("../controller/CartController")
const router = require("express").Router()


router.post("/createcart",cartController.createCart)
router.get("/getcart",cartController.getAllCart)


module.exports = router
