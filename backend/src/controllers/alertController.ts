import { Request, Response } from 'express';
import Alert from '../models/Alert';
import Appliance from '../models/Appliance';
import MeterReading from '../models/MeterReading';

export const getAlerts = async (req: Request, res: Response) => {
    // @ts-ignore
    const user = req.user;
    const userId = user._id;
    const { unreadOnly, type, severity, limit = 20 } = req.query;

    try {
        // ── Auto-generate data-driven alerts ──────────────────────────────
        const today = new Date();
        const startOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        // 1. Budget Alerts & Insights
        const readingsThisMonth = await MeterReading.find({
            user: userId,
            date: { $gte: startOfThisMonth }
        });
        const currentSpends = readingsThisMonth.reduce((acc, r) => acc + (r.cost || 0), 0);
        const budget = user.monthlyBudget || 3000;
        
        if (currentSpends > 0) {
            if (currentSpends > budget * 0.8) {
                const existingBudgetAlert = await Alert.findOne({ user: userId, type: 'budget_exceeded', createdAt: { $gte: startOfThisMonth } });
                if (!existingBudgetAlert) {
                    await Alert.create({
                        user: userId, type: 'budget_exceeded',
                        severity: currentSpends > budget ? 'critical' : 'high',
                        title: currentSpends > budget ? 'Budget Exceeded!' : 'Approaching Monthly Budget',
                        message: `You have spent ₹${currentSpends.toFixed(0)} which is ${(currentSpends / budget * 100).toFixed(0)}% of your ₹${budget} budget.`,
                    });
                }
            } else if (currentSpends <= budget * 0.5) {
                // Positive insight
                const existingPositive = await Alert.findOne({ user: userId, type: 'usage_milestone', createdAt: { $gte: startOfThisMonth } });
                if (!existingPositive) {
                    await Alert.create({
                        user: userId, type: 'usage_milestone', severity: 'low',
                        title: 'Great Job on Budget!',
                        message: `You are well within your budget this month, having spent only ₹${currentSpends.toFixed(0)} so far. Keep it up!`,
                    });
                }
            }
        }

        // 2. Heavy Appliance / Top Consumer Insight
        const appliances = await Appliance.find({ user: userId });
        if (appliances.length > 0) {
            // Find the highest consuming appliance
            const topAppliance = appliances.reduce((best, curr) => {
                const bestTotal = (best.wattage || 0) * (best.dailyUsageHours || 0);
                const currTotal = (curr.wattage || 0) * (curr.dailyUsageHours || 0);
                return currTotal > bestTotal ? curr : best;
            });

            const topDailyKwh = ((topAppliance.wattage || 0) * (topAppliance.dailyUsageHours || 0)) / 1000;
            
            if (topDailyKwh > 3) { // Reduced threshold so insight shows up
                const startOfWeek = new Date(today);
                startOfWeek.setDate(today.getDate() - 7);
                
                const existingHeavyAlert = await Alert.findOne({ user: userId, type: 'appliance_anomaly', createdAt: { $gte: startOfWeek } });
                if (!existingHeavyAlert) {
                    await Alert.create({
                        user: userId,
                        type: 'appliance_anomaly',
                        severity: topDailyKwh > 10 ? 'high' : 'medium',
                        title: 'Top Energy Consumer Identified',
                        message: `Your ${topAppliance.name} is your heaviest consumer, using roughly ${topDailyKwh.toFixed(1)} kWh daily. Consider running it during off-peak hours or checking its efficiency.`,
                    });
                }
            }
        }

        // 3. Spikes in Daily Usage
        if (readingsThisMonth.length >= 2) {
            // Find max usage day
            const maxReading = readingsThisMonth.reduce((max, curr) => curr.unitsConsumed > max.unitsConsumed ? curr : max);
            // Average excluding max
            const others = readingsThisMonth.filter(r => r._id !== maxReading._id);
            const avgOthers = others.reduce((acc, r) => acc + r.unitsConsumed, 0) / (others.length || 1);
            
            // If the max day is 50% higher than average
            if (maxReading.unitsConsumed > avgOthers * 1.5 && others.length > 0) {
                const startOfWeek = new Date(today);
                startOfWeek.setDate(today.getDate() - 7);

                const existingSpike = await Alert.findOne({ user: userId, type: 'bill_spike', createdAt: { $gte: startOfWeek } });
                if (!existingSpike) {
                    await Alert.create({
                        user: userId, type: 'bill_spike', severity: 'high',
                        title: 'Apparent Usage Spike',
                        message: `We noticed an unusual spike on ${new Date(maxReading.date).toLocaleDateString()}. You consumed ${maxReading.unitsConsumed} units, which is notably higher than your average of ${avgOthers.toFixed(1)} units.`,
                    });
                }
            }
        }
        // ─────────────────────────────────────────────────────────────────

        const query: any = { user: userId };
        if (unreadOnly === 'true') query.isRead = false;
        if (type) query.type = type;
        if (severity) query.severity = severity;

        const alerts = await Alert.find(query)
            .sort({ createdAt: -1 })
            .limit(Number(limit));

        const unreadCount = await Alert.countDocuments({ user: userId, isRead: false });

        res.json({ alerts, unreadCount });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch alerts' });
    }
};

export const markAlertRead = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user?._id;
    const { id } = req.params;
    try {
        await Alert.findOneAndUpdate({ _id: id, user: userId }, { isRead: true });
        res.json({ message: 'Alert marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update alert' });
    }
};

export const markAllAlertsRead = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user?._id;
    try {
        await Alert.updateMany({ user: userId, isRead: false }, { isRead: true });
        res.json({ message: 'All alerts marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update alerts' });
    }
};

export const deleteAlert = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user?._id;
    const { id } = req.params;
    try {
        await Alert.findOneAndDelete({ _id: id, user: userId });
        res.json({ message: 'Alert deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete alert' });
    }
};

// Generate sample alerts for demo (kept for legacy reasons)
export const generateSampleAlerts = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user?._id;
    try {
        const sampleAlerts = [
            {
                user: userId,
                type: 'budget_exceeded',
                severity: 'high',
                title: 'Monthly Budget Alert',
                message: 'You have used 89% of your ₹2,000 monthly energy budget. At current pace, bill may exceed by ₹340.',
                isRead: false,
            },
            {
                user: userId,
                type: 'bill_spike',
                severity: 'critical',
                title: 'Unusual Bill Spike Detected',
                message: 'Your energy consumption this week is 42% higher than last week. Check if any appliance is running continuously.',
                isRead: false,
            },
            {
                user: userId,
                type: 'peak_hour_overuse',
                severity: 'medium',
                title: 'Peak Hour Usage Warning',
                message: 'High usage detected between 6 PM - 10 PM. Consider shifting heavy appliances to off-peak hours to save up to ₹180/month.',
                isRead: false,
            },
            {
                user: userId,
                type: 'appliance_anomaly',
                severity: 'medium',
                title: 'AC Anomaly Detected',
                message: 'Your AC is consuming 23% more power than usual. This could indicate a gas leak or dirty filter. Check and clean filters.',
                isRead: true,
            },
            {
                user: userId,
                type: 'usage_milestone',
                severity: 'low',
                title: 'Great Job This Month!',
                message: 'You saved ₹485 compared to last month. Your energy efficiency score improved to 78/100.',
                isRead: true,
            },
        ];

        await Alert.deleteMany({ user: userId });
        await Alert.insertMany(sampleAlerts);
        res.json({ message: 'Sample alerts generated', count: sampleAlerts.length });
    } catch (error) {
        res.status(500).json({ message: 'Failed to generate sample alerts' });
    }
};

