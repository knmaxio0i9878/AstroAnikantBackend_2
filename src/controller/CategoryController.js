const categorySchema = require("../models/Category")

const getAllCategory = async (req, res) => {

    const response = await categorySchema.find()
    if (response) {
        res.status(200).json({
            data: response,
            message: "Category get successully"
        })
    }
}

const getSingleCategory = async (req, res) => {
    const id = req.params.id
    const response = await categorySchema.findById(id)
    if (response) {
        res.status(200).json({
            data: response,
            message: "Single Category get successully"
        })
    }else{
        res.status(404).json({
            message: "Error in getting single category"
        })
    }
}
const insertCategory = async (req, res) => {

    const category = {
        name : req.body.name
    }
    const response = await categorySchema.create(category)
    if(category){
         res.status(200).json({
            data: response,
            message: "Category Added successully"
        })
    }else{
        res.status(404).json({
            message: "Error in inserting category"
        })
    }
}

module.exports= {
    getAllCategory,
    getSingleCategory,
    insertCategory
}