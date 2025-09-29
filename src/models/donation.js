const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    amount: { type: Number, required: true },
    donationType: { type: String, enum: ['predefined', 'custom'], default: 'predefined' },
    paymentMethod: { type: String, enum: ['upi', 'qr', 'razorpay'], default: 'upi' },
    paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    transactionId: { type: String },
    upiTransactionId: { type: String }, // For manual UPI payments
    donationDate: { type: Date, default: Date.now },
    emailSent: { type: Boolean, default: false },
    receiptNumber: { type: String, unique: true }
}, {
    timestamps: true
});

// Generate receipt number before saving
donationSchema.pre('save', async function(next) {
    if (!this.receiptNumber) {
        const count = await this.constructor.countDocuments();
        this.receiptNumber = `ASS-DON-${(count + 1).toString().padStart(6, '0')}`;
    }
    next();
});

module.exports = mongoose.model('Donation', donationSchema);