const mongoose = require('mongoose');
const Schema = mongoose.Schema

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
    },
    role: {
        type: String,
        enum: ['customer', 'admin'],
        default: 'customer'
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: "Product"
    },
    address: [{
            societyName: {type:String,required: true},
            street: { type: String, required: true },
            city: { type: String,required:true },      // no required
            state: { type: String,required:true },     // no required
            pincode: { type: Number,required:true },   // no required
            country: { type: String, default: 'India'},
        }],
    isActive: {
        type: Boolean,
        default: true
    },
    gender: {
        type: String
    }
},);


module.exports = mongoose.model('User', userSchema);
