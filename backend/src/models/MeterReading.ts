import mongoose from 'mongoose';

const MeterReadingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    unitsConsumed: { type: Number, required: true }, // in kWh
    cost: { type: Number }, // Calculated cost based on tariff
    source: {
        type: String,
        enum: ['manual', 'csv', 'smart_meter'],
        default: 'manual'
    },
    createdAt: { type: Date, default: Date.now }
});

// Ensure only one reading per day per user? OR allow multiples?
// Let's enforce uniqueness for date-user pair to avoid duplicates
MeterReadingSchema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.model('MeterReading', MeterReadingSchema);
