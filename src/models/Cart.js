const mongoose = require('mongoose');
const Schema = mongoose.Schema

const Cart = {
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: "Product"
    },
    order_dt: {
        type: Date,
    },
    status: {
        type: String,
        default: "Pending"
    }
}

module.exports = mongoose.model('Cart', Cart);
