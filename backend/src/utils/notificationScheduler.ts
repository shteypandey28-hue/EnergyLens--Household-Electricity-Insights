import cron from 'node-cron';
import User from '../models/User';
import Appliance from '../models/Appliance';
import MeterReading from '../models/MeterReading';
import Alert from '../models/Alert';
import {
    sendServiceDueEmail,
    sendWarrantyExpiryEmail,
    sendBudgetAlertEmail,
    sendMaxCapacityEmail,
} from './emailService';

// ─── Constants ────────────────────────────────────────────────────────────────
const SERVICE_WARN_DAYS = 7;       // alert when service is due within 7 days
const WARRANTY_WARN_DAYS = 7;      // alert when warranty expires within 7 days
const SERVICE_INTERVAL_DAYS = 180; // assume service every 6 months if no next date
const BUDGET_WARN_THRESHOLD = 0.8; // alert at 80% budget usage

// ─── Helper: ms difference in days ───────────────────────────────────────────
const daysDiff = (a: Date, b: Date) =>
    Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));

// ─── Helper: de-duplicate email sends (one per type per week) ────────────────
const emailSentCache = new Map<string, Date>(); // key: `${userId}:${type}:${itemId}`

const shouldSendEmail = (key: string): boolean => {
    const last = emailSentCache.get(key);
    if (!last) return true;
    const daysSince = daysDiff(last, new Date());
    return daysSince >= 7; // don't spam – max once per week per alert type
};

const markEmailSent = (key: string) => emailSentCache.set(key, new Date());

// ══════════════════════════════════════════════════════════════════════════════
// MAIN NOTIFICATION CHECK
// ══════════════════════════════════════════════════════════════════════════════
export const runNotificationCheck = async () => {
    console.log('🔔 [Notifications] Running scheduled notification check…');

    try {
        // Fetch all users who have email notifications enabled
        const users = await User.find({
            'notificationPreferences.email': true,
        }).select('name email monthlyBudget notificationPreferences');

        let emailsSent = 0;

        for (const user of users) {
            const userId = user._id;
            const userEmail = user.email;
            const userName = user.name;

            // ── 1. Appliance-level checks ──────────────────────────────────
            const appliances = await Appliance.find({ user: userId });

            for (const appliance of appliances) {
                const aId = String(appliance._id);

                // ── 1a. Service Due ──────────────────────────────────────
                if (appliance.lastServiceDate && user.notificationPreferences.anomalyAlert) {
                    const lastService = new Date(appliance.lastServiceDate);
                    const nextServiceDue = new Date(lastService);
                    nextServiceDue.setDate(nextServiceDue.getDate() + SERVICE_INTERVAL_DAYS);

                    const daysUntilService = daysDiff(new Date(), nextServiceDue);

                    // Alert if due within 7 days OR already overdue
                    if (daysUntilService <= SERVICE_WARN_DAYS) {
                        const cacheKey = `${userId}:service:${aId}`;
                        if (shouldSendEmail(cacheKey)) {
                            await sendServiceDueEmail({
                                to: userEmail,
                                userName,
                                applianceName: appliance.name,
                                lastServiceDate: lastService,
                                daysOverdue: daysUntilService, // negative = overdue
                            });

                            // Store an in-app alert too
                            await createInAppAlert(userId, {
                                type: 'appliance_anomaly',
                                severity: daysUntilService < 0 ? 'high' : 'medium',
                                title: `Service ${daysUntilService < 0 ? 'Overdue' : 'Due Soon'}: ${appliance.name}`,
                                message: daysUntilService < 0
                                    ? `${appliance.name} service is ${Math.abs(daysUntilService)} days overdue. Schedule a service immediately.`
                                    : `${appliance.name} is due for service in ${daysUntilService} days.`,
                            });

                            markEmailSent(cacheKey);
                            emailsSent++;
                        }
                    }
                }

                // ── 1b. Warranty Expiry ──────────────────────────────────
                if (appliance.warrantyExpiry && user.notificationPreferences.anomalyAlert) {
                    const warrantyExpiry = new Date(appliance.warrantyExpiry);
                    const daysLeft = daysDiff(new Date(), warrantyExpiry);

                    // Alert if expiring within 7 days OR already expired (for 30 days post-expiry)
                    if (daysLeft <= WARRANTY_WARN_DAYS && daysLeft >= -30) {
                        const cacheKey = `${userId}:warranty:${aId}`;
                        if (shouldSendEmail(cacheKey)) {
                            await sendWarrantyExpiryEmail({
                                to: userEmail,
                                userName,
                                applianceName: appliance.name,
                                warrantyExpiry,
                                daysLeft,
                            });

                            await createInAppAlert(userId, {
                                type: 'appliance_anomaly',
                                severity: daysLeft <= 0 ? 'high' : 'medium',
                                title: `Warranty ${daysLeft <= 0 ? 'Expired' : 'Expiring Soon'}: ${appliance.name}`,
                                message: daysLeft <= 0
                                    ? `Warranty for ${appliance.name} has expired. Consider an extended warranty.`
                                    : `Warranty for ${appliance.name} expires in ${daysLeft} days.`,
                            });

                            markEmailSent(cacheKey);
                            emailsSent++;
                        }
                    }
                }

                // ── 1c. Max Capacity ─────────────────────────────────────
                if (
                    appliance.maxSafeHours &&
                    appliance.dailyUsageHours > appliance.maxSafeHours &&
                    user.notificationPreferences.anomalyAlert
                ) {
                    const cacheKey = `${userId}:capacity:${aId}`;
                    if (shouldSendEmail(cacheKey)) {
                        await sendMaxCapacityEmail({
                            to: userEmail,
                            userName,
                            applianceName: appliance.name,
                            dailyUsageHours: appliance.dailyUsageHours,
                            maxSafeHours: appliance.maxSafeHours,
                        });

                        await createInAppAlert(userId, {
                            type: 'appliance_anomaly',
                            severity: 'high',
                            title: `⚡ Over Capacity: ${appliance.name}`,
                            message: `${appliance.name} runs ${appliance.dailyUsageHours}h/day, exceeding the safe limit of ${appliance.maxSafeHours}h/day by ${(appliance.dailyUsageHours - appliance.maxSafeHours).toFixed(1)}h.`,
                        });

                        markEmailSent(cacheKey);
                        emailsSent++;
                    }
                }
            }

            // ── 2. Budget Check ────────────────────────────────────────────
            if (user.notificationPreferences.budgetAlert) {
                const budget = user.monthlyBudget || 2000;
                const today = new Date();
                const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

                const readings = await MeterReading.find({
                    user: userId,
                    date: { $gte: startOfMonth },
                });

                const totalSpend = readings.reduce((acc, r) => acc + (r.cost || 0), 0);
                const percentUsed = (totalSpend / budget) * 100;

                if (totalSpend > 0 && percentUsed >= BUDGET_WARN_THRESHOLD * 100) {
                    const monthName = today.toLocaleString('en-IN', { month: 'long', year: 'numeric' });
                    const cacheKey = `${userId}:budget:${today.getFullYear()}-${today.getMonth()}`;
                    if (shouldSendEmail(cacheKey)) {
                        await sendBudgetAlertEmail({
                            to: userEmail,
                            userName,
                            currentSpend: totalSpend,
                            budget,
                            percentUsed,
                            month: monthName,
                        });

                        await createInAppAlert(userId, {
                            type: 'budget_exceeded',
                            severity: percentUsed >= 100 ? 'critical' : 'high',
                            title: percentUsed >= 100 ? '🚨 Budget Exceeded!' : '⚠️ Approaching Budget Limit',
                            message: `You've spent ₹${totalSpend.toFixed(0)} (${percentUsed.toFixed(0)}%) of your ₹${budget} monthly budget.`,
                        });

                        markEmailSent(cacheKey);
                        emailsSent++;
                    }
                }
            }
        }

        console.log(`✅ [Notifications] Check complete — ${emailsSent} email(s) dispatched.`);
        return { processed: users.length, emailsSent };

    } catch (err: any) {
        console.error('❌ [Notifications] Scheduler error:', err?.message);
        throw err;
    }
};

// ─── Helper: create in-app alert (skip duplicate in same month) ──────────────
const createInAppAlert = async (
    userId: any,
    data: { type: string; severity: string; title: string; message: string }
) => {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);

    const existing = await Alert.findOne({
        user: userId,
        type: data.type,
        title: data.title,
        createdAt: { $gte: startOfWeek },
    });

    if (!existing) {
        await Alert.create({ user: userId, ...data });
    }
};

// ══════════════════════════════════════════════════════════════════════════════
// SCHEDULER INIT — call this once from index.ts
// ══════════════════════════════════════════════════════════════════════════════
export const initNotificationScheduler = () => {
    // Run every day at 8:00 AM IST (UTC+5:30 → 02:30 UTC)
    cron.schedule('30 2 * * *', async () => {
        await runNotificationCheck();
    }, {
        timezone: 'Asia/Kolkata',
    });

    console.log('⏰ [Notifications] Scheduler registered — runs daily at 08:00 IST');
};
