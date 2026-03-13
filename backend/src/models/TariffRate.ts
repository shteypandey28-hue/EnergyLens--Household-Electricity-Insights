import mongoose, { Schema, Document } from 'mongoose';

export interface ITariffSlab {
    maxUnits: number;      // max units for this slab (use 999999 for unlimited)
    ratePerUnit: number;   // ₹ per kWh
}

export interface ITariffRate extends Document {
    state: string;
    tariffType: 'Residential' | 'Commercial' | 'Industrial' | 'Agricultural';
    slabs: ITariffSlab[];
    fixedCharges: number;   // monthly fixed/demand charge in ₹
    taxPercent: number;     // electricity duty / surcharge %
    effectiveFrom: Date;
    source: string;
    isActive: boolean;
    updatedAt: Date;
}

const TariffSlabSchema = new Schema<ITariffSlab>({
    maxUnits: { type: Number, required: true },
    ratePerUnit: { type: Number, required: true },
});

const TariffRateSchema = new Schema<ITariffRate>(
    {
        state: { type: String, required: true, index: true },
        tariffType: { type: String, enum: ['Residential', 'Commercial', 'Industrial', 'Agricultural'], default: 'Residential' },
        slabs: { type: [TariffSlabSchema], required: true },
        fixedCharges: { type: Number, default: 0 },
        taxPercent: { type: Number, default: 0 },
        effectiveFrom: { type: Date, default: new Date('2023-04-01') },
        source: { type: String, default: 'DISCOM FY 2023-24' },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

// Compound index: one active record per state + tariffType
TariffRateSchema.index({ state: 1, tariffType: 1, isActive: 1 });

export default mongoose.model<ITariffRate>('TariffRate', TariffRateSchema);
