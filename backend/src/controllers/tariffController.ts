import { Request, Response } from 'express';
import MeterReading from '../models/MeterReading';
import { calculateBillAsync } from '../utils/tariffCalculator';
import { getAllTariffs, getTariffByState } from '../utils/tariffCalculator';

// GET /api/tariffs  — all active tariff entries
export const getAllTariffRates = async (_req: Request, res: Response) => {
    try {
        const rates = await getAllTariffs();
        res.json(rates);
    } catch {
        res.status(500).json({ message: 'Failed to fetch tariff rates' });
    }
};

// GET /api/tariffs/:state  — tariff for a specific state
export const getTariffForState = async (req: Request, res: Response) => {
    try {
        const rate = await getTariffByState(req.params.state as string);
        if (!rate) return res.status(404).json({ message: 'No tariff found for this state' });
        res.json(rate);
    } catch {
        res.status(500).json({ message: 'Failed to fetch tariff rate' });
    }
};
