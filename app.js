const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());

app.use(cors());
const PORT = 1921;

mongoose.connect("mongodb+srv://User:CofSq9CzT3As7rXn@cluster1.hebethf.mongodb.net/")
    .then(() => {
        console.log("Database Connected Successfully");
    })
    .catch((err) => {
        console.log("Database Connection Error", err);
    });

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

const userRoutes = require("./src/router/UserRoutes")
const productRoutes = require("./src/router/ProductRoutes")
const cartRoutes = require("./src/router/CartRoutes")


app.use("/user",userRoutes)
app.use("/product",productRoutes)
app.use("/cart",cartRoutes)