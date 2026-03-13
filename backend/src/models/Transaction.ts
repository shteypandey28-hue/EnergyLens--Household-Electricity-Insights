import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    plan: { type: String, enum: ['basic', 'premium', 'pro'], required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: { type: String, enum: ['pending', 'success', 'failed', 'refunded'], default: 'pending' },
    paymentMethod: { type: String, enum: ['upi', 'card', 'netbanking', 'demo'], default: 'demo' },
    transactionId: { type: String },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    subscriptionDuration: { type: Number, default: 30 }, // days
    notes: { type: String },
    createdAt: { type: Date, default: Date.now },
});

TransactionSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Transaction', TransactionSchema);
