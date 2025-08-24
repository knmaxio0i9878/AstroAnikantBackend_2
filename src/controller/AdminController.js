const AdminModel = require("../models/AdminModel")
const encrypt = require("../service/Encrypt")

const adminAdd = async (req, res) => {

    const hashedPassword = await encrypt.hashedPassword(req.body.password)

    const admindata = {
        email: req.body.email,
        password: hashedPassword,
        // password:req.body.password
    }

    const response = await AdminModel.create(admindata)
    if (response) {
        res.status(200).json({
            data: response,
            message: "Admin Added Successfully"
        })
    }
    else {
        res.status(404).json({
            message: "Admin not Added Successfully"
        })
    }
}


const getAllAdmins = async (req, res) => {

    const response = await AdminModel.find()
    if (response) {
        res.status(200).json({
            data: response,
            message: "Data Fetch Successfully"
        })
    }
    else {
        res.status(404).json({
            message: "Data not Fetch Successfully"
        })
    }
}

const getsingleadmin = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    // Find the user by email
    const validUser = await AdminModel.findOne({ email: email });
    console.log("vailduser", validUser);

    if (validUser) {
        // Compare password with the hashed password
        const isPasswordValid = await encrypt.comparePassword(password, validUser.password);

        if (isPasswordValid) {

            res.status(200).json({
                data: {
                    user: validUser,
                },
                message: "User Validated Successfully"
            });
        } else {
            res.status(401).json({ message: "Invalid password" });
        }
    } else {
        res.status(404).json({ message: "User not found" });
    }
}

var otp;
const getUserByEmail = async (req, res) => {
    const { email } = req.body;
    const user = await AdminModel.findOne({ email: email });
    if (user) {
        otp = Math.floor(Math.random() * 10000);
        console.log(otp);

        // await mail.sendingMail(user.email,"Verification of Password","Otp for Change Password : "+otp)
        res.status(201).json({
            data: user,
            message: "User Found"
        })
        const { password } = req.body;
        // const respone = 
    } else {
        res.status(404).json({
            message: "User Not found"
        })
    }
}
var otp;
const admingetuseremail = async (req, res) => {
    const { email } = req.body;
    const user = await AdminModel.findOne({ email: email });
    if (user) {
        otp = Math.floor(Math.random() * 10000);
        console.log(otp);

        // await mail.sendingMail(user.email,"Verification of Password","Otp for Change Password : "+otp)
        res.status(201).json({
            data: user,
            message: "User Found"
        })
        const { password } = req.body;
        // const respone = 
    } else {
        res.status(404).json({
            message: "User Not found"
        })
    }
}
const updateForgotAdmin = async (req, res) => {
    try {
        const id = req.params.id;

        // Check if the password exists in the request body
        if (req.body.password) {
            req.body.password = await encrypt.hashedPassword(req.body.password);
            if (req.body.otp === otp) {
                // Update the user with the modified request body
                const updatedUser = await AdminModel.findByIdAndUpdate(id, req.body, { new: true });

                if (updatedUser) {
                    res.status(201).json({
                        data: updatedUser,
                        message: "Updated user successfully",
                    });
                } else {
                    res.status(404).json({
                        message: "No such user found to update",
                    });
                }
            } else {
                res.status(404).json({
                    message: "No such Otp found to update",
                });
            }
        }
        else {
            res.status(404).json({
                message: "No such Otp found to update",
            });
        }
    } catch (error) {
        res.status(500).json({
            message: "An error occurred while updating the user",
            error: error.message,
        });
    }
}

module.exports = {
    adminAdd,
    getAllAdmins,
    getsingleadmin,
    updateForgotAdmin,
    getUserByEmail,
    admingetuseremail
}