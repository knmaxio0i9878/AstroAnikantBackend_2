// const razorpay = require("razorpay");

const Razorpay = require("razorpay");

const razorpay = new Razorpay({
    key_id: "rzp_test_m60EaJoASbqtGR",
    key_secret: "pzIHmVc5tDa76mTSU552aa3d",
  });
  // API to create an order
  const creatOrder =  async (req, res) => {
    const { amount, currency, receipt } = req.body;
    
    const options = {
      amount: amount * 100, // Razorpay expects the amount in paise
      currency: currency,
      receipt: receipt,
    };
    try {
      const order = await razorpay.orders.create(options);
      res.json(order); // Returns the order details, including order_id
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Something went wrong" });
    }
  };


  const verifyOrder = async (req, res) => {
    const crypto = require("crypto");
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const secret = "LGNTEkWut2jUcxFppHnluUUB";
    const hash = crypto.createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");
    console.log(hash, razorpay_signature);
    if (hash === razorpay_signature) {
      res.json({ status: "success" });
    } else {
      res.status(400).json({ status: "failure" });
    }
  };

module.exports = {
    creatOrder,
    verifyOrder
}