const userSchema = require("../models/UserModel")
const encrypt = require("../service/Encrypt")
const UserAdd = async (req, res) => {
    try {
        const hashedPassword = await encrypt.hashedPassword(req.body.password);

        const user = {
            name: req.body.name,
            email: req.body.email.trim().toLowerCase(),
            phone: req.body.phone,
            password: hashedPassword,
            role: req.body.role,
            product: req.body.product,
            address: req.body.address, // ✅ directly use array from Postman
            isActive: req.body.isActive,
            gender: req.body.gender
        };

        const response = await userSchema.create(user);

        res.status(201).json({
            data: response,
            message: "User Added Successfully"
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({
            message: "User Not Added",
            error: err.message
        });
    }
};


module.exports = {
    UserAdd
}