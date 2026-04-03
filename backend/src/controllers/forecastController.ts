import { Request, Response } from 'express';
import MeterReading from '../models/MeterReading';
import { simpleLinearRegression } from '../utils/forecasting';
import { calculateBill } from '../utils/tariffCalculator';

// @desc    Get consumption forecast
// @route   GET /api/forecast
// @access  Private
export const getForecast = async (req: Request, res: Response) => {
    // @ts-ignore
    const user = req.user;

    try {
        const readings = await MeterReading.find({ user: user._id }).sort({ date: 1 });

        if (readings.length < 2) {
            return res.status(400).json({ message: 'Not enough data to forecast. Need at least 2 readings.' });
        }

        const dataPoints = readings.map(r => ({
            date: r.date,
            value: r.unitsConsumed
        }));

        // Forecast next 30 days
        const forecastData = simpleLinearRegression(dataPoints, 30);

        // Calculate estimated cost for forecast
        const forecastWithCost = forecastData.map(point => ({
            date: point.date,
            units: point.value,
            estimatedCost: calculateBill(point.value, user.state)
        }));

        res.json(forecastWithCost);

    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}
