const mongoose = require("mongoose")

const VisitsSchema = {
    name: {
        type: String,
        require:true
    },
    phone: {
        type: Number,
        require:true

    },
    email: {
        type: String,
        require:true

    },
    address: [{
        societyName: { type: String, required: true },
        street: { type: String, required: true },
        city: { type: String, required: true },      // no required
        state: { type: String, required: true },     // no required
        pincode: { type: Number, required: true },   // no required
    }],
    visit_date:{
        type:Date,
        require:true

    },
    time:{
        type:String,
        require:true

    },
    amount:{
        type:Number,
        default:99
    },
    status:{
        type:String,
        default:"Pending"
    }

}
module.exports = mongoose.model("Visits", VisitsSchema)