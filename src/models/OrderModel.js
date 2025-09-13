const mongoose = require('mongoose');
const Schema = mongoose.Schema

const Order = {
    cart: { 
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
    },
    // ADD THESE NEW FIELDS FOR SHIPROCKET
    shipment: {
        shiprocket_order_id: String,
        shipment_id: String,
        awb_code: String,
        courier_company_id: String,
        courier_name: String,
        tracking_url: String,
        expected_delivery_date: Date,
        current_status: {
            type: String,
            default: 'Order Placed'
        },
        status_history: [{
            status: String,
            timestamp: Date,
            location: String
        }]
    },
    shipping_address: {
        name: String,
        address: String,
        city: String,
        state: String,
        country: String,
        pincode: String,
        phone: String
    }
}
module.exports = mongoose.model('Order', Order);
