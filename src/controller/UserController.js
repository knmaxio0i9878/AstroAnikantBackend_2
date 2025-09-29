const userSchema = require("../models/UserModel")
const encrypt = require("../service/Encrypt")
const tokenUtil = require("../service/Token")
const mailUtil = require("../service/MailUtil")



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
        const emailBody = `
  <div style="font-family: Arial, sans-serif; text-align: center; padding: 25px; background: #f9f9f9;">
  <h2 style="color: #2E4057; margin-bottom: 15px;">🙏 Welcome to Astro Anekant!</h2>

  <p style="color: #333; font-size: 16px; line-height: 1.6;">
    Dear <strong>${user.name} ji</strong>, <br />
    Thank you for joining <strong>Astro Anekant</strong>. 🌟 <br />
    We’re truly grateful to have you in our spiritual community.
  </p>

  <p style="color: #555; font-size: 15px; margin-top: 15px; line-height: 1.5;">
    You can now explore powerful astro remedies, products, and guidance 
    that bring positivity and balance to your life.
  </p>

  <p style="color: #555; font-size: 14px; margin-top: 20px;">
    If you have any query, feel free to reach us anytime. <br />
    📧 <strong>astroanekant@gmail.com</strong>  
    <br />🌐 <a href="https://astroanekant.com" style="color: #2E4057; text-decoration: none;">Visit our website</a>
  </p>

  <hr style="margin: 30px 0; border: 0; border-top: 1px solid #eee;" />

  <p style="color: #999; font-size: 12px;">
    © ${new Date().getFullYear()} Astro Anekant. All rights reserved.
  </p>
</div>
`;

        await mailUtil.sendingMail(user.email,"Account created with Astro Anekant successfully!",emailBody)


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
    console.log(id);
    
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
const getForgotUserByEmail = async (req, res) => {
    const { email } = req.body;
    const user = await userSchema.findOne({ email: email });
    if (user) {
        const token = tokenUtil.generateToken(user.toObject());
        const emailBody = `Click Here for Password Reset : <a href="http://localhost:1921/emailresetpassword/${token}"> Reset </a>`;
        await mailUtil.sendingMail(user.email, "Verification of Password", emailBody)
        res.status(201).json({
            data: user,
            message: "User Found"
        })
    } else {
        res.status(404).json({
            message: "User Not found"
        }) 
    }
}
const updateForgotUserEmail = async (req, res) => {
    const token = req.params.token; 
    console.log("Received Token:", token);
    try {
        let decoded;
        decoded = jwt.verify(token,"parth1923")
        console.log("decoded",decoded);
        

        const userId = decoded._id; // Extract user ID from token
        console.log("Decoded User ID:", userId);

        console.log("New Password:", req.body.password);

        if (!req.body.password) {
            return res.status(400).json({ message: "Password is required" });
        }

        // Encrypt the new password
        let hashedPassword;
        try {
            hashedPassword = await encrypt.hashedPassword(req.body.password);
        } catch (hashError) {
            console.error("Password Hashing Error:", hashError.message);
            return res.status(500).json({ message: "Error hashing password" });
        }

        // Find and update the user
        const updatedUser = await userSchema.findByIdAndUpdate(
            userId, 
            { password: hashedPassword }, 
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            data: updatedUser,
            message: "Password updated successfully",
        });

    } catch (error) {
        console.error("Error updating password:", error.message);
        return res.status(500).json({
            message: "An error occurred while updating the password",
            error: error.message,
        });
    }
};

module.exports = {
    UserAdd,
    getAllUser,
    deleteUser,
    updateUser,
    getSingleUser,
    validateUser,
    getForgotUserByEmail,
    updateForgotUserEmail
}