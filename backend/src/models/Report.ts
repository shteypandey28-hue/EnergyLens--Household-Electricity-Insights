import mongoose from 'mongoose';

const ReportSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    household: { type: mongoose.Schema.Types.ObjectId, ref: 'Household' },
    type: {
        type: String,
        enum: ['monthly', 'appliance', 'savings', 'annual', 'custom'],
        required: true,
    },
    title: { type: String, required: true },
    period: {
        from: { type: Date, required: true },
        to: { type: Date, required: true },
    },
    summary: {
        totalUnits: { type: Number, default: 0 },
        totalCost: { type: Number, default: 0 },
        avgDailyUnits: { type: Number, default: 0 },
        peakDay: { type: String },
        topAppliance: { type: String },
        savingsVsLastMonth: { type: Number, default: 0 },
    },
    fileUrl: { type: String }, // PDF download path
    isPremium: { type: Boolean, default: false },
    status: { type: String, enum: ['generating', 'ready', 'failed'], default: 'ready' },
    createdAt: { type: Date, default: Date.now },
});

ReportSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Report', ReportSchema);
