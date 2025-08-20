// const Razorpay = require("razorpay");
// const crypto = require("crypto");

// const razorpay = new Razorpay({
//   key_id: "rzp_test_qDs2F1QMYofA5H",
//   key_secret: "LGNTEkWut2jUcxFppHnluUUB",
// });

// // API to create an order
// app.post("/create-order", async (req, res) => {
//   const { amount, currency, receipt } = req.body;

//   const options = {
//     amount: amount * 100, // Razorpay expects the amount in paise
//     currency: currency,
//     receipt: receipt,
//   };

//   try {
//     const order = await razorpay.orders.create(options);
//     res.json(order);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // API to verify payment
// app.post("/verify-payment", (req, res) => {
//   const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

//   const secret = "LGNTEkWut2jUcxFppHnluUUB";

//   const hash = crypto
//     .createHmac("sha256", secret)
//     .update(razorpay_order_id + "|" + razorpay_payment_id)
//     .digest("hex");

//   console.log("Generated Hash:", hash);
//   console.log("Signature from Razorpay:", razorpay_signature);

//   if (hash === razorpay_signature) {
//     res.json({ status: "success" });
//   } else {
//     res.status(400).json({ status: "failure" });
//   }
// });
