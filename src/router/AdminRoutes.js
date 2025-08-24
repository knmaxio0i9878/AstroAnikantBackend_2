const admincontroller = require("../controller/AdminController")
const router = require("express").Router()

router.post("/addadmin",admincontroller.adminAdd)
router.get("/getadmin",admincontroller.getAllAdmins)
router.post("/singleadmin",admincontroller.getsingleadmin)
router.post("/getadminemail",admincontroller.admingetuseremail)
router.put("/updateforgotadmin/:id",admincontroller.updateForgotAdmin)


module.exports = router
