import mongoose from 'mongoose';

const HouseholdSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, default: 'My Home' },
    address: { type: String },
    state: { type: String, default: 'Delhi' },
    tariffType: { type: String, default: 'Residential' },
    connectedLoad: { type: Number }, // in kW
    monthlyBudget: { type: Number, default: 2000 },
    sanctionedLoad: { type: Number }, // in kW
    meterNumber: { type: String },
    discom: { type: String }, // e.g., BSES, Tata Power
    isDefault: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Household', HouseholdSchema);
