const orderController = require("../controller/OrderController")
const router = require("express").Router()

router.post("/createorder",orderController.createOrder)

module.exports = router