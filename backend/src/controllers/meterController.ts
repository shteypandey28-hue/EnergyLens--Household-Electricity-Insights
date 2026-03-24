import { Request, Response } from 'express';
import MeterReading from '../models/MeterReading';
import { calculateBillAsync } from '../utils/tariffCalculator';

// @desc    Add a meter reading
// @route   POST /api/usage/readings
// @access  Private
export const addReading = async (req: Request, res: Response) => {
    const { date, unitsConsumed, source } = req.body;
    // @ts-ignore
    const user = req.user;

    try {
        // Use DB-backed tariff for the user's state
        const cost = await calculateBillAsync(unitsConsumed, user.state || 'Delhi');

        const reading = await MeterReading.create({
            user: user._id,
            date,
            unitsConsumed,
            cost,
            source,
        });

        res.status(201).json(reading);
    } catch (error: any) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Reading for this date already exists' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get readings (with optional date range)
// @route   GET /api/usage/readings
// @access  Private
export const getReadings = async (req: Request, res: Response) => {
    // @ts-ignore
    const user = req.user;
    const { startDate, endDate } = req.query;

    try {
        let query: any = { user: user._id };

        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate as string);
            if (endDate) query.date.$lte = new Date(endDate as string);
        }

        const readings = await MeterReading.find(query).sort({ date: -1 });
        res.json(readings);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
