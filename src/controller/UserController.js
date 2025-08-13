const userSchema = require("../models/UserModel")
const encrypt = require("../service/Encrypt")
const tokenUtil = require("../service/Token")



// add user
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


// get all useres
const getAllUser = async (req, res) => {

    const users = await userSchema.find()
    res.status(201).json({
        data: users,
        message: "Successfully got all the Users"
    })
}


// delete user
const deleteUser = async (req, res) => {
    const id = req.params.id;
    const deleteUser = await userSchema.findByIdAndDelete(id)
    if (deleteUser) {
        res.status(200).json({
            data: deleteUser,
            message: 'user deleted Successfully'
        })
    }
    else {
        res.status(404).json({
            message: 'No such State found'
        })
    }
}


// update user
const updateUser = async (req, res) => {
    try {
        const id = req.params.id;

        // Check if the password exists in the request body
        if (req.body.password) {
            req.body.password = await encrypt.hashedPassword(req.body.password);
        }

        // Update the user with the modified request body
        const updatedUser = await userSchema.findByIdAndUpdate(id, req.body, { new: true });

        if (updatedUser) {
            res.status(200).json({
                data: updatedUser,
                message: "Updated user successfully",
            });
        } else {
            res.status(404).json({
                message: "No such user found to update",
            });
        }
    } catch (error) {
        res.status(500).json({
            message: "An error occurred while updating the user",
            error: error.message,
        });
    }
};

// get single user
const getSingleUser = async (req, res) => {

    const id = req.params.id;
    const user = await userSchema.findById(id)
    if (user) {
        res.status(200).json({
            data: user,
            message: "User Fetched Successfully"
        })
    }
    else {
        res.status(404).json({
            message: "User not Fetched Successfully"
        })
    }
}

// user validation for login
const validateUser = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    // Find the user by email
    const validUser = await userSchema.findOne({ email: email });
    console.log("vailduse", validUser);

    if (validUser) {
        // Compare password with the hashed password
        const isPasswordValid = await encrypt.comparePassword(password, validUser.password);
        console.log("..,.,.,.,.", isPasswordValid);

        if (isPasswordValid) {
            // Generate JWT token
            const token = tokenUtil.generateToken(validUser.toObject());

            res.status(200).json({
                data: {
                    user: validUser,
                    token: token
                },
                message: "User Validated Successfully"
            });
        } else {
            res.status(401).json({ message: "Invalid password" });
        }
    } else {
        res.status(404).json({ message: "User not found" });
    }
};

module.exports = {
    UserAdd,
    getAllUser,
    deleteUser,
    updateUser,
    getSingleUser,
    validateUser
}