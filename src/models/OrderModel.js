const mongoose = require('mongoose');
const Schema = mongoose.Schema

const Order = {
    order: {
        type: Schema.Types.ObjectId,
        ref: "Cart"
    },
    order_dt:{
        type:Date,
        default:Date.now
    },
    status:{
        type:String,
        default:"Pending",
        required:true
    },
    typeOfPayment:{
        type:String
    }
}

module.exports = mongoose.model('Order', Order);
