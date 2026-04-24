import { Request, Response } from 'express';
import { runNotificationCheck } from '../utils/notificationScheduler';
import { sendEmail } from '../utils/emailService';

// POST /api/notifications/trigger
// Manually fires the notification check — useful for testing / admin dashboards
export const triggerNotifications = async (req: Request, res: Response) => {
    try {
        const result = await runNotificationCheck();
        res.json({
            message: 'Notification check completed',
            ...result,
        });
    } catch (err: any) {
        res.status(500).json({ message: 'Notification check failed', error: err?.message });
    }
};

// POST /api/notifications/test-email
// Sends a quick test email to the authenticated user to confirm SMTP is working
export const sendTestEmail = async (req: Request, res: Response) => {
    // @ts-ignore
    const user = req.user;
    try {
        const result = await sendEmail({
            to: user.email,
            subject: '✅ EnergyLens Email Notifications are Working!',
            html: `
                <div style="background:#0f172a;color:#f1f5f9;font-family:Arial,sans-serif;padding:40px;border-radius:12px;max-width:500px;margin:auto;">
                    <h2 style="color:#22c55e;margin:0 0 16px;">✅ Test Email Successful</h2>
                    <p style="color:#94a3b8;margin:0 0 12px;">Hi <strong style="color:#f1f5f9;">${user.name}</strong>,</p>
                    <p style="color:#94a3b8;margin:0;">Your EnergyLens email notifications are configured and working correctly. You'll receive alerts for:</p>
                    <ul style="color:#94a3b8;margin:12px 0;padding-left:20px;">
                        <li>🔧 Appliance service reminders</li>
                        <li>🛡️ Warranty expiry alerts</li>
                        <li>📊 Monthly budget warnings</li>
                        <li>⚡ Max capacity usage alerts</li>
                    </ul>
                    <p style="color:#64748b;font-size:12px;margin:20px 0 0;">Sent from EnergyLens Notification System</p>
                </div>
            `,
        });

        if (result.success) {
            res.json({ message: `Test email sent to ${user.email}`, messageId: result.messageId });
        } else {
            res.status(500).json({ message: 'Failed to send test email', error: result.error });
        }
    } catch (err: any) {
        res.status(500).json({ message: 'Failed to send test email', error: err?.message });
    }
};
