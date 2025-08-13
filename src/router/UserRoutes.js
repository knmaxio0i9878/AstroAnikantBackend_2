const router = require("express").Router()
const userController = require("../controller/UserController")


router.post("/useradd",userController.UserAdd)
router.get("/getalluser",userController.getAllUser)
router.delete("/deleteuser",userController.deleteUser)
router.put("/updateuser/:id",userController.updateUser)
router.post("/loginuser",userController.validateUser)
router.get("/getsingleuser/:id",userController.getSingleUser)

module.exports = router