import TariffRate from '../models/TariffRate';

// In-memory cache: { state: slabs[] } — refreshes every 6 hours
let cache: Record<string, { slabs: { maxUnits: number; ratePerUnit: number }[]; fixedCharges: number; taxPercent: number }> = {};
let cacheBuiltAt = 0;
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

/**
 * Hardcoded fallback if DB is not seeded yet.
 */
const FALLBACK: Record<string, { slabs: { maxUnits: number; ratePerUnit: number }[]; fixedCharges: number; taxPercent: number }> = {
    Delhi: { slabs: [{ maxUnits: 200, ratePerUnit: 3.0 }, { maxUnits: 400, ratePerUnit: 4.5 }, { maxUnits: 800, ratePerUnit: 6.5 }, { maxUnits: 999999, ratePerUnit: 7.0 }], fixedCharges: 0, taxPercent: 8 },
    Maharashtra: { slabs: [{ maxUnits: 100, ratePerUnit: 3.44 }, { maxUnits: 300, ratePerUnit: 7.34 }, { maxUnits: 500, ratePerUnit: 10.36 }, { maxUnits: 999999, ratePerUnit: 11.82 }], fixedCharges: 55, taxPercent: 9 },
    Karnataka: { slabs: [{ maxUnits: 30, ratePerUnit: 3.15 }, { maxUnits: 100, ratePerUnit: 5.7 }, { maxUnits: 200, ratePerUnit: 7.0 }, { maxUnits: 999999, ratePerUnit: 8.25 }], fixedCharges: 35, taxPercent: 6 },
    'Tamil Nadu': { slabs: [{ maxUnits: 100, ratePerUnit: 0 }, { maxUnits: 200, ratePerUnit: 2.25 }, { maxUnits: 500, ratePerUnit: 5.0 }, { maxUnits: 999999, ratePerUnit: 7.0 }], fixedCharges: 0, taxPercent: 0 },
    'Uttar Pradesh': { slabs: [{ maxUnits: 150, ratePerUnit: 5.5 }, { maxUnits: 300, ratePerUnit: 6.0 }, { maxUnits: 500, ratePerUnit: 6.5 }, { maxUnits: 999999, ratePerUnit: 7.0 }], fixedCharges: 45, taxPercent: 5 },
};

async function buildCache(): Promise<void> {
    try {
        const rates = await TariffRate.find({ isActive: true, tariffType: 'Residential' });
        if (rates.length > 0) {
            const newCache: typeof cache = {};
            rates.forEach(r => {
                newCache[r.state] = {
                    slabs: r.slabs.map(s => ({ maxUnits: s.maxUnits, ratePerUnit: s.ratePerUnit })),
                    fixedCharges: r.fixedCharges,
                    taxPercent: r.taxPercent,
                };
            });
            cache = newCache;
            cacheBuiltAt = Date.now();
        }
    } catch {
        // DB not available — use fallback silently
    }
}

async function getTariffData(state: string) {
    // Refresh cache if stale or empty
    if (!cacheBuiltAt || Date.now() - cacheBuiltAt > CACHE_TTL_MS || Object.keys(cache).length === 0) {
        await buildCache();
    }
    return cache[state] || cache['Delhi'] || FALLBACK['Delhi'];
}

/**
 * Calculate electricity bill for given units and state.
 * Reads slab rates from MongoDB (with in-memory cache + hardcoded fallback).
 * Includes fixed charges and tax.
 */
export async function calculateBillAsync(units: number, state: string = 'Delhi'): Promise<number> {
    const { slabs, fixedCharges, taxPercent } = await getTariffData(state);

    let energyCost = 0;
    let remaining = units;
    let prevMax = 0;

    for (const slab of slabs) {
        if (remaining <= 0) break;
        const range = slab.maxUnits - prevMax;
        const used = Math.min(remaining, range);
        energyCost += used * slab.ratePerUnit;
        remaining -= used;
        prevMax = slab.maxUnits;
    }

    const subtotal = energyCost + fixedCharges;
    const total = subtotal + (subtotal * taxPercent) / 100;
    return parseFloat(total.toFixed(2));
}

/**
 * Synchronous calculateBill — uses cache only (for backward compat).
 * Falls back to hardcoded rates if cache is empty.
 */
export function calculateBill(units: number, state: string = 'Delhi'): number {
    const data = cache[state] || FALLBACK[state] || FALLBACK['Delhi'];
    let energyCost = 0;
    let remaining = units;
    let prevMax = 0;

    for (const slab of data.slabs) {
        if (remaining <= 0) break;
        const range = slab.maxUnits - prevMax;
        const used = Math.min(remaining, range);
        energyCost += used * slab.ratePerUnit;
        remaining -= used;
        prevMax = slab.maxUnits;
    }

    const subtotal = energyCost + data.fixedCharges;
    const total = subtotal + (subtotal * data.taxPercent) / 100;
    return parseFloat(total.toFixed(2));
}

/**
 * Get all tariff entries from DB — for the API endpoint.
 */
export async function getAllTariffs() {
    return TariffRate.find({ isActive: true }).sort({ state: 1 });
}

/**
 * Get tariff by state from DB — for the API endpoint.
 */
export async function getTariffByState(state: string) {
    return TariffRate.findOne({ state, isActive: true, tariffType: 'Residential' });
}

// Warm the cache on first import (non-blocking)
buildCache().catch(() => { });
