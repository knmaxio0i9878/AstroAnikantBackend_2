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
    }
}

module.exports = mongoose.model('Cart', Cart);
