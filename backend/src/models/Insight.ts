import mongoose from 'mongoose';

const InsightSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    household: { type: mongoose.Schema.Types.ObjectId, ref: 'Household' },
    type: {
        type: String,
        enum: [
            'savings_opportunity',
            'peak_usage',
            'efficiency_tip',
            'appliance_heavy',
            'weather_impact',
            'tariff_optimization',
        ],
        required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    potentialSavings: { type: Number }, // in INR
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    isPremium: { type: Boolean, default: false },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date },
});

InsightSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Insight', InsightSchema);
