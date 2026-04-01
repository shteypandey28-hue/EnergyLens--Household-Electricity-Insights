/**
 * seeds/tariffRates.ts
 * Run once: npx ts-node src/seeds/tariffRates.ts
 * Populates MongoDB with India state-wise residential electricity tariffs (FY 2023-24)
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import TariffRate from '../models/TariffRate';

dotenv.config({ path: require('path').join(__dirname, '../../.env') });

const INDIA_TARIFFS = [
    {
        state: 'Andhra Pradesh',
        slabs: [
            { maxUnits: 50, ratePerUnit: 1.45 },
            { maxUnits: 100, ratePerUnit: 3.35 },
            { maxUnits: 200, ratePerUnit: 5.70 },
            { maxUnits: 999999, ratePerUnit: 7.20 },
        ],
        fixedCharges: 30, taxPercent: 5,
    },
    {
        state: 'Arunachal Pradesh',
        slabs: [
            { maxUnits: 100, ratePerUnit: 2.50 },
            { maxUnits: 999999, ratePerUnit: 4.50 },
        ],
        fixedCharges: 20, taxPercent: 0,
    },
    {
        state: 'Assam',
        slabs: [
            { maxUnits: 100, ratePerUnit: 4.30 },
            { maxUnits: 300, ratePerUnit: 6.90 },
            { maxUnits: 999999, ratePerUnit: 8.00 },
        ],
        fixedCharges: 40, taxPercent: 5,
    },
    {
        state: 'Bihar',
        slabs: [
            { maxUnits: 100, ratePerUnit: 4.67 },
            { maxUnits: 200, ratePerUnit: 5.48 },
            { maxUnits: 999999, ratePerUnit: 6.44 },
        ],
        fixedCharges: 35, taxPercent: 5,
    },
    {
        state: 'Chhattisgarh',
        slabs: [
            { maxUnits: 100, ratePerUnit: 3.50 },
            { maxUnits: 400, ratePerUnit: 5.50 },
            { maxUnits: 999999, ratePerUnit: 6.50 },
        ],
        fixedCharges: 25, taxPercent: 5,
    },
    {
        state: 'Delhi',
        slabs: [
            { maxUnits: 200, ratePerUnit: 3.00 },
            { maxUnits: 400, ratePerUnit: 4.50 },
            { maxUnits: 800, ratePerUnit: 6.50 },
            { maxUnits: 999999, ratePerUnit: 7.00 },
        ],
        fixedCharges: 0, taxPercent: 8,   // Delhi has no fixed charges, but has surcharge
    },
    {
        state: 'Goa',
        slabs: [
            { maxUnits: 100, ratePerUnit: 1.70 },
            { maxUnits: 300, ratePerUnit: 3.50 },
            { maxUnits: 999999, ratePerUnit: 5.20 },
        ],
        fixedCharges: 25, taxPercent: 0,
    },
    {
        state: 'Gujarat',
        slabs: [
            { maxUnits: 50, ratePerUnit: 3.25 },
            { maxUnits: 250, ratePerUnit: 4.85 },
            { maxUnits: 500, ratePerUnit: 5.90 },
            { maxUnits: 999999, ratePerUnit: 6.30 },
        ],
        fixedCharges: 40, taxPercent: 5,
    },
    {
        state: 'Haryana',
        slabs: [
            { maxUnits: 50, ratePerUnit: 2.50 },
            { maxUnits: 150, ratePerUnit: 5.25 },
            { maxUnits: 250, ratePerUnit: 6.30 },
            { maxUnits: 500, ratePerUnit: 6.90 },
            { maxUnits: 999999, ratePerUnit: 7.10 },
        ],
        fixedCharges: 50, taxPercent: 5,
    },
    {
        state: 'Himachal Pradesh',
        slabs: [
            { maxUnits: 125, ratePerUnit: 0.00 },  // Free for BPL households
            { maxUnits: 300, ratePerUnit: 3.75 },
            { maxUnits: 999999, ratePerUnit: 5.50 },
        ],
        fixedCharges: 20, taxPercent: 0,
    },
    {
        state: 'Jharkhand',
        slabs: [
            { maxUnits: 100, ratePerUnit: 4.10 },
            { maxUnits: 300, ratePerUnit: 5.20 },
            { maxUnits: 999999, ratePerUnit: 6.50 },
        ],
        fixedCharges: 30, taxPercent: 5,
    },
    {
        state: 'Karnataka',
        slabs: [
            { maxUnits: 30, ratePerUnit: 3.15 },
            { maxUnits: 100, ratePerUnit: 5.70 },
            { maxUnits: 200, ratePerUnit: 7.00 },
            { maxUnits: 999999, ratePerUnit: 8.25 },
        ],
        fixedCharges: 35, taxPercent: 6,
    },
    {
        state: 'Kerala',
        slabs: [
            { maxUnits: 50, ratePerUnit: 3.25 },
            { maxUnits: 100, ratePerUnit: 4.50 },
            { maxUnits: 150, ratePerUnit: 5.80 },
            { maxUnits: 200, ratePerUnit: 6.80 },
            { maxUnits: 300, ratePerUnit: 7.50 },
            { maxUnits: 999999, ratePerUnit: 8.20 },
        ],
        fixedCharges: 45, taxPercent: 8,
    },
    {
        state: 'Madhya Pradesh',
        slabs: [
            { maxUnits: 30, ratePerUnit: 3.30 },
            { maxUnits: 100, ratePerUnit: 4.35 },
            { maxUnits: 300, ratePerUnit: 5.55 },
            { maxUnits: 500, ratePerUnit: 6.55 },
            { maxUnits: 999999, ratePerUnit: 7.00 },
        ],
        fixedCharges: 30, taxPercent: 5,
    },
    {
        state: 'Maharashtra',
        slabs: [
            { maxUnits: 100, ratePerUnit: 3.44 },
            { maxUnits: 300, ratePerUnit: 7.34 },
            { maxUnits: 500, ratePerUnit: 10.36 },
            { maxUnits: 999999, ratePerUnit: 11.82 },
        ],
        fixedCharges: 55, taxPercent: 9,
    },
    {
        state: 'Manipur',
        slabs: [
            { maxUnits: 100, ratePerUnit: 3.00 },
            { maxUnits: 999999, ratePerUnit: 5.50 },
        ],
        fixedCharges: 20, taxPercent: 0,
    },
    {
        state: 'Meghalaya',
        slabs: [
            { maxUnits: 100, ratePerUnit: 3.80 },
            { maxUnits: 999999, ratePerUnit: 5.75 },
        ],
        fixedCharges: 25, taxPercent: 0,
    },
    {
        state: 'Mizoram',
        slabs: [
            { maxUnits: 100, ratePerUnit: 3.60 },
            { maxUnits: 999999, ratePerUnit: 5.00 },
        ],
        fixedCharges: 20, taxPercent: 0,
    },
    {
        state: 'Nagaland',
        slabs: [
            { maxUnits: 100, ratePerUnit: 3.40 },
            { maxUnits: 999999, ratePerUnit: 5.20 },
        ],
        fixedCharges: 20, taxPercent: 0,
    },
    {
        state: 'Odisha',
        slabs: [
            { maxUnits: 50, ratePerUnit: 2.00 },
            { maxUnits: 200, ratePerUnit: 4.50 },
            { maxUnits: 400, ratePerUnit: 6.30 },
            { maxUnits: 999999, ratePerUnit: 7.70 },
        ],
        fixedCharges: 30, taxPercent: 5,
    },
    {
        state: 'Punjab',
        slabs: [
            { maxUnits: 100, ratePerUnit: 3.49 },
            { maxUnits: 300, ratePerUnit: 5.25 },
            { maxUnits: 500, ratePerUnit: 6.50 },
            { maxUnits: 999999, ratePerUnit: 7.27 },
        ],
        fixedCharges: 40, taxPercent: 5,
    },
    {
        state: 'Rajasthan',
        slabs: [
            { maxUnits: 50, ratePerUnit: 3.40 },
            { maxUnits: 150, ratePerUnit: 5.50 },
            { maxUnits: 300, ratePerUnit: 6.75 },
            { maxUnits: 999999, ratePerUnit: 7.00 },
        ],
        fixedCharges: 35, taxPercent: 5,
    },
    {
        state: 'Sikkim',
        slabs: [
            { maxUnits: 100, ratePerUnit: 2.50 },
            { maxUnits: 999999, ratePerUnit: 4.00 },
        ],
        fixedCharges: 15, taxPercent: 0,
    },
    {
        state: 'Tamil Nadu',
        slabs: [
            { maxUnits: 100, ratePerUnit: 0.00 },  // First 100 units free
            { maxUnits: 200, ratePerUnit: 2.25 },
            { maxUnits: 500, ratePerUnit: 5.00 },
            { maxUnits: 999999, ratePerUnit: 7.00 },
        ],
        fixedCharges: 0, taxPercent: 0,
    },
    {
        state: 'Telangana',
        slabs: [
            { maxUnits: 50, ratePerUnit: 1.45 },
            { maxUnits: 100, ratePerUnit: 3.35 },
            { maxUnits: 200, ratePerUnit: 5.70 },
            { maxUnits: 300, ratePerUnit: 7.20 },
            { maxUnits: 999999, ratePerUnit: 9.00 },
        ],
        fixedCharges: 30, taxPercent: 5,
    },
    {
        state: 'Tripura',
        slabs: [
            { maxUnits: 100, ratePerUnit: 3.00 },
            { maxUnits: 300, ratePerUnit: 4.50 },
            { maxUnits: 999999, ratePerUnit: 6.00 },
        ],
        fixedCharges: 25, taxPercent: 0,
    },
    {
        state: 'Uttar Pradesh',
        slabs: [
            { maxUnits: 150, ratePerUnit: 5.50 },
            { maxUnits: 300, ratePerUnit: 6.00 },
            { maxUnits: 500, ratePerUnit: 6.50 },
            { maxUnits: 999999, ratePerUnit: 7.00 },
        ],
        fixedCharges: 45, taxPercent: 5,
    },
    {
        state: 'Uttarakhand',
        slabs: [
            { maxUnits: 100, ratePerUnit: 3.30 },
            { maxUnits: 200, ratePerUnit: 4.35 },
            { maxUnits: 400, ratePerUnit: 5.25 },
            { maxUnits: 999999, ratePerUnit: 6.50 },
        ],
        fixedCharges: 30, taxPercent: 5,
    },
    {
        state: 'West Bengal',
        slabs: [
            { maxUnits: 25, ratePerUnit: 4.06 },
            { maxUnits: 75, ratePerUnit: 5.47 },
            { maxUnits: 150, ratePerUnit: 6.27 },
            { maxUnits: 250, ratePerUnit: 6.91 },
            { maxUnits: 999999, ratePerUnit: 7.81 },
        ],
        fixedCharges: 35, taxPercent: 6,
    },
];

async function seed() {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/energylens';
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('✅ Connected');

    // Clear existing tariff data
    await TariffRate.deleteMany({});
    console.log('🗑️  Cleared existing tariff data');

    const docs = INDIA_TARIFFS.map(t => ({
        state: t.state,
        tariffType: 'Residential',
        slabs: t.slabs,
        fixedCharges: t.fixedCharges,
        taxPercent: t.taxPercent,
        effectiveFrom: new Date('2023-04-01'),
        source: 'DISCOM FY 2023-24 (Residential)',
        isActive: true,
    }));

    await TariffRate.insertMany(docs);
    console.log(`✅ Seeded ${docs.length} state tariffs into MongoDB`);

    docs.forEach(d => console.log(`   → ${d.state.padEnd(22)} | ${d.slabs.length} slabs | Fixed: ₹${d.fixedCharges} | Tax: ${d.taxPercent}%`));

    await mongoose.disconnect();
    console.log('\n🎉 Seed complete. Tariff rates are now in MongoDB!');
}

seed().catch(err => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
