const router = require("express").Router()
const userController = require("../controller/UserController")


router.post("/useradd",userController.UserAdd)

module.exports = router