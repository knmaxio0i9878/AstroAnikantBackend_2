const router = require("express").Router()
const productController = require("../controller/ProductController")

router.post("/addproduct",productController.createProduct)
router.get("/getallproducts",productController.getAllProduct)
router.delete("/deleteproduct/:id",productController.deleteProduct)
router.put("/updateproduct/:id",productController.updateProduct)
router.get("getsingleproduct/:id",productController.getSingleProduct)

module.exports = router