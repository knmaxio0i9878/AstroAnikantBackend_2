const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_SECRET || "parth1923";

const generateToken = (payload) => {
    const token = jwt.sign(payload, secretKey, {
        expiresIn: "1h" // Adjust expiry as needed
    });
    console.log("Generated token:", token);
    return token;
};

module.exports = { generateToken };