const mongoose = require("mongoose")

const VisitsSchema = {
    name: {
        type: String,
        require: true
    },
    phone: {
        type: Number,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    birthdate: {
    type: String,
    required: true
},
    message: {  // Replace address with message
        type: String,
        require: true
    },
    // visit_date: {
    //     type: Date,
    //     require: true
    // },
    // time: {
    //     type: String,
    //     require: true
    // },
    amount: {
        type: Number,
        default: 99
    },
    status: {
        type: String,
        default: "Pending"
    },
     upiTransactionId: {  // NEW FIELD
        type: String,
        default: null
    }
}
module.exports = mongoose.model("Visits", VisitsSchema)