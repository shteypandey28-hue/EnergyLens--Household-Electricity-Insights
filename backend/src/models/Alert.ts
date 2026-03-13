import mongoose from 'mongoose';

const AlertSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    household: { type: mongoose.Schema.Types.ObjectId, ref: 'Household' },
    type: {
        type: String,
        enum: [
            'budget_exceeded',
            'bill_spike',
            'appliance_anomaly',
            'peak_hour_overuse',
            'threshold_breach',
            'usage_milestone',
            'forecast_warning',
        ],
        required: true,
    },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    metadata: { type: mongoose.Schema.Types.Mixed }, // extra data like appliance name, spike %
    createdAt: { type: Date, default: Date.now },
});

AlertSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Alert', AlertSchema);
