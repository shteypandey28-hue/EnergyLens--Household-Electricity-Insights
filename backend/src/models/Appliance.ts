import mongoose from 'mongoose';

const ApplianceSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    type: {
        type: String,
        enum: ['AC', 'Refrigerator', 'WashingMachine', 'Geyser', 'TV', 'Fan', 'Light', 'Other'],
        default: 'Other',
    },
    wattage: { type: Number, required: true },           // in Watts
    dailyUsageHours: { type: Number, required: true },           // avg hours/day
    maxSafeHours: { type: Number, default: null },            // manufacturer max hours/day
    quantity: { type: Number, default: 1 },
    efficiencyRating: { type: Number, min: 1, max: 5 },          // star rating

    // ── Warranty ─────────────────────────────────────────────
    purchaseDate: { type: Date, default: null },              // when device was bought
    warrantyExpiry: { type: Date, default: null },             // warranty end date

    // ── Service tracking ──────────────────────────────────────
    lastServiceDate: { type: Date, default: null },
    serviceNotes: { type: String, default: '' },

    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Appliance', ApplianceSchema);
