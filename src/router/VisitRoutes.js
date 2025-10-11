const visitController = require("../controller/VisitsController")
const router = require("express").Router()

router.post("/createvisit",visitController.createVisit)
router.get("/getsinglevisit/:id",visitController.getSingleVisit)
router.get("/getallvisit",visitController.getAllVisit)
router.delete("/deletevisit",visitController.deleteVisit)
router.put("/updatevisit/:id",visitController.updateVisit)


module.exports = router