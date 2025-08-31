const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
require("dotenv").config();  // load env variables

const app = express();
app.use(express.json());

app.use(cors({
  origin: ["https://astroanekant-2025.web.app/","http://localhost:5173"],  // your Firebase hosted frontend URL
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));


const PORT = process.env.PORT || 5000;
const MONGODB_URL = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URL)
    .then(() => {
        console.log("✅ Database Connected Successfully");
    })
    .catch((err) => {
        console.log("❌ Database Connection Error:", err);
    });

app.listen(PORT, () => {
    console.log(`🚀 Server started on port ${PORT}`);
});

// Routes
const userRoutes = require("./src/router/UserRoutes")
const productRoutes = require("./src/router/ProductRoutes")
const cartRoutes = require("./src/router/CartRoutes")
const orderRoutes = require("./src/router/OrderRoutes")
const paymentRoutes = require("./src/router/PaymentRoutes")
const adminRoutes = require("./src/router/AdminRoutes")
const visitRoutes = require("./src/router/VisitRoutes")
const categoryRoutes = require("./src/router/CategoryRoutes")

app.use("/user", userRoutes)
app.use("/product", productRoutes)
app.use("/cart", cartRoutes)
app.use("/order", orderRoutes)
app.use("/payment", paymentRoutes)
app.use("/admin", adminRoutes)
app.use("/visit", visitRoutes)
app.use("/category", categoryRoutes)
