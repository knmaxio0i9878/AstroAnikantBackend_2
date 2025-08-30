const categoryController = require("../controller/CategoryController")
const router = require("express").Router()

router.get("/getallcategory",categoryController.getAllCategory)
router.get("/getsinglecategory/:id",categoryController.getSingleCategory)
router.post("/insertcategory",categoryController.insertCategory)


module.exports = router
