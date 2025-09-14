const mongoose = require('mongoose');

// Update your Cart model/schema
const cartSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, default: 1, min: 1 }
    }],
    order_dt: { type: Date, default: Date.now },
    status: { type: String, default: 'active', enum: ['active', 'ordered', 'cleared', 'empty'] }, 
}, {
    timestamps: true
});

// Add compound index instead of unique constraint on user alone
cartSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('Cart', cartSchema);