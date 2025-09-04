const orderController = require("../controller/OrderController")
const router = require("express").Router()

router.post("/createorder",orderController.createOrder)
router.get("/getallorder",orderController.getAllOrder)
router.get("/getsingleorder/:id",orderController.getSingleOrder)
router.get("/deleteorder/:id",orderController.deleteOrder)
router.get('/user/:userId', orderController.getUserOrders);

module.exports = router