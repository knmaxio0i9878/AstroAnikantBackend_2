const router = require("express").Router()
const productRequestController = require("../controller/ProductRequestController")

router.post("/insertproductrequest",productRequestController.insertProductRequest)
router.get("/getallrequest",productRequestController.getAllProductRequest)

module.exports = router