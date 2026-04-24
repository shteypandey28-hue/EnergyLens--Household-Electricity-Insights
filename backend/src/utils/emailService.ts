import nodemailer from 'nodemailer';

// ─── Transporter ─────────────────────────────────────────────────────────────
const createTransporter = () => {
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.SMTP_PORT || '587');
    const user = process.env.SMTP_USER || '';
    const pass = process.env.SMTP_PASS || '';

    return nodemailer.createTransport({
        host,
        port,
        secure: port === 465, // true for 465, false for other ports
        auth: { user, pass },
        tls: { rejectUnauthorized: false },
    });
};

// ─── Shared Email Wrapper ────────────────────────────────────────────────────
const wrapHtml = (title: string, accentColor: string, body: string): string => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#1e293b 0%,#0f172a 100%);border-radius:16px 16px 0 0;padding:32px 40px;border-bottom:2px solid ${accentColor};">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <div style="display:inline-block;background:${accentColor};border-radius:10px;padding:8px 16px;margin-bottom:12px;">
                  <span style="color:#fff;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">⚡ EnergyLens</span>
                </div>
                <h1 style="color:#f1f5f9;font-size:22px;margin:0;font-weight:700;line-height:1.3;">${title}</h1>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#1e293b;padding:36px 40px;">
          ${body}
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#0f172a;border-radius:0 0 16px 16px;padding:24px 40px;text-align:center;border-top:1px solid #334155;">
          <p style="color:#64748b;font-size:12px;margin:0 0 8px 0;">You're receiving this because you enabled email notifications in EnergyLens.</p>
          <p style="color:#64748b;font-size:12px;margin:0;">
            Manage preferences in your <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/settings" style="color:${accentColor};text-decoration:none;">Settings</a> &nbsp;|&nbsp;
            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" style="color:${accentColor};text-decoration:none;">Visit Dashboard</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

// ─── Pill Badge ───────────────────────────────────────────────────────────────
const pill = (label: string, color: string) =>
    `<span style="display:inline-block;background:${color}22;color:${color};border:1px solid ${color}44;border-radius:999px;padding:3px 12px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">${label}</span>`;

// ─── Stat Box ────────────────────────────────────────────────────────────────
const statBox = (label: string, value: string, accent: string) =>
    `<td style="background:#0f172a;border-radius:10px;padding:16px 20px;text-align:center;border:1px solid #334155;">
       <div style="color:#94a3b8;font-size:11px;margin-bottom:4px;text-transform:uppercase;letter-spacing:1px;">${label}</div>
       <div style="color:${accent};font-size:22px;font-weight:700;">${value}</div>
     </td>`;

// ─── CTA Button ──────────────────────────────────────────────────────────────
const ctaButton = (text: string, href: string, color: string) =>
    `<a href="${href}" style="display:inline-block;background:${color};color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:14px;font-weight:700;letter-spacing:0.5px;">${text}</a>`;

// ══════════════════════════════════════════════════════════════════════════════
// 1. SERVICE DUE NOTIFICATION
// ══════════════════════════════════════════════════════════════════════════════
export const sendServiceDueEmail = async (opts: {
    to: string;
    userName: string;
    applianceName: string;
    lastServiceDate: Date;
    daysOverdue: number; // positive = due in X days, negative = X days overdue
}) => {
    const isDue = opts.daysOverdue <= 0;
    const accentColor = isDue ? '#ef4444' : '#f59e0b';
    const label = isDue
        ? `${Math.abs(opts.daysOverdue)} days overdue`
        : `Due in ${opts.daysOverdue} days`;

    const body = `
      <p style="color:#94a3b8;font-size:15px;margin:0 0 24px 0;">Hi <strong style="color:#f1f5f9;">${opts.userName}</strong>, your appliance needs attention soon.</p>
      
      <div style="background:#0f172a;border-radius:12px;padding:24px;border:1px solid ${accentColor}44;margin-bottom:24px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h2 style="color:#f1f5f9;font-size:18px;margin:0;">🔧 ${opts.applianceName}</h2>
          ${pill(label, accentColor)}
        </div>
        <table width="100%" cellpadding="8" cellspacing="0">
          <tr>
            ${statBox('Last Serviced', new Date(opts.lastServiceDate).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }), '#94a3b8')}
            <td width="12"></td>
            ${statBox(isDue ? 'Days Overdue' : 'Days Until Due', String(Math.abs(opts.daysOverdue)), accentColor)}
          </tr>
        </table>
      </div>

      <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin:0 0 28px 0;">
        Regular servicing keeps your appliance running efficiently and extends its lifespan. Schedule a service appointment soon to avoid performance degradation and higher energy bills.
      </p>

      <div style="text-align:center;">
        ${ctaButton('View Appliance Details', `${process.env.CLIENT_URL || 'http://localhost:5173'}/appliances`, accentColor)}
      </div>`;

    return sendEmail({
        to: opts.to,
        subject: `🔧 Service ${isDue ? 'Overdue' : 'Due Soon'}: ${opts.applianceName} — EnergyLens`,
        html: wrapHtml(`Service ${isDue ? 'Overdue' : 'Reminder'}: ${opts.applianceName}`, accentColor, body),
    });
};

// ══════════════════════════════════════════════════════════════════════════════
// 2. WARRANTY EXPIRY NOTIFICATION
// ══════════════════════════════════════════════════════════════════════════════
export const sendWarrantyExpiryEmail = async (opts: {
    to: string;
    userName: string;
    applianceName: string;
    warrantyExpiry: Date;
    daysLeft: number;
}) => {
    const isExpired = opts.daysLeft <= 0;
    const accentColor = isExpired ? '#ef4444' : '#8b5cf6';

    const body = `
      <p style="color:#94a3b8;font-size:15px;margin:0 0 24px 0;">Hi <strong style="color:#f1f5f9;">${opts.userName}</strong>, here's a warranty update for one of your appliances.</p>

      <div style="background:#0f172a;border-radius:12px;padding:24px;border:1px solid ${accentColor}44;margin-bottom:24px;">
        <div style="margin-bottom:16px;">
          <h2 style="color:#f1f5f9;font-size:18px;margin:0 0 8px 0;">🛡️ ${opts.applianceName}</h2>
          ${isExpired ? pill('Warranty Expired', '#ef4444') : pill(`${opts.daysLeft} days left`, accentColor)}
        </div>
        <table width="100%" cellpadding="8" cellspacing="0">
          <tr>
            ${statBox('Warranty Expiry', new Date(opts.warrantyExpiry).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }), '#94a3b8')}
            <td width="12"></td>
            ${statBox(isExpired ? 'Expired' : 'Days Remaining', isExpired ? '✗' : String(opts.daysLeft), accentColor)}
          </tr>
        </table>
      </div>

      <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin:0 0 28px 0;">
        ${isExpired
            ? 'Your warranty has expired. Consider purchasing an extended warranty or service plan to keep your appliance protected against unexpected repairs.'
            : `Your warranty expires in <strong style="color:${accentColor};">${opts.daysLeft} days</strong>. Now is a great time to consider an extended warranty or to log any issues while still covered.`}
      </p>

      <div style="text-align:center;">
        ${ctaButton('Manage Appliances', `${process.env.CLIENT_URL || 'http://localhost:5173'}/appliances`, accentColor)}
      </div>`;

    return sendEmail({
        to: opts.to,
        subject: `🛡️ Warranty ${isExpired ? 'Expired' : 'Expiring Soon'}: ${opts.applianceName} — EnergyLens`,
        html: wrapHtml(`Warranty ${isExpired ? 'Expired' : 'Expiry Alert'}: ${opts.applianceName}`, accentColor, body),
    });
};

// ══════════════════════════════════════════════════════════════════════════════
// 3. BUDGET OVERRUN NOTIFICATION
// ══════════════════════════════════════════════════════════════════════════════
export const sendBudgetAlertEmail = async (opts: {
    to: string;
    userName: string;
    currentSpend: number;
    budget: number;
    percentUsed: number;
    month: string;
}) => {
    const isOver = opts.percentUsed >= 100;
    const accentColor = isOver ? '#ef4444' : '#f97316';

    const body = `
      <p style="color:#94a3b8;font-size:15px;margin:0 0 24px 0;">Hi <strong style="color:#f1f5f9;">${opts.userName}</strong>, your energy budget needs your attention this month.</p>

      <!-- Progress Bar -->
      <div style="background:#0f172a;border-radius:12px;padding:24px;border:1px solid ${accentColor}44;margin-bottom:24px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <span style="color:#f1f5f9;font-size:15px;font-weight:600;">📊 ${opts.month} Budget</span>
          ${pill(isOver ? 'Budget Exceeded' : `${opts.percentUsed.toFixed(0)}% Used`, accentColor)}
        </div>
        <div style="background:#334155;border-radius:999px;height:10px;margin-bottom:16px;overflow:hidden;">
          <div style="background:linear-gradient(90deg,${accentColor},${accentColor}cc);height:100%;width:${Math.min(opts.percentUsed, 100)}%;border-radius:999px;"></div>
        </div>
        <table width="100%" cellpadding="8" cellspacing="0">
          <tr>
            ${statBox('Spent', `₹${opts.currentSpend.toFixed(0)}`, accentColor)}
            <td width="12"></td>
            ${statBox('Budget', `₹${opts.budget.toFixed(0)}`, '#64748b')}
            <td width="12"></td>
            ${statBox(isOver ? 'Over By' : 'Remaining', `₹${Math.abs(opts.budget - opts.currentSpend).toFixed(0)}`, isOver ? '#ef4444' : '#22c55e')}
          </tr>
        </table>
      </div>

      <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin:0 0 28px 0;">
        ${isOver
            ? `You have exceeded your monthly budget by <strong style="color:#ef4444;">₹${(opts.currentSpend - opts.budget).toFixed(0)}</strong>. Review your usage patterns and consider shifting high-consumption appliances to off-peak hours.`
            : `You are at <strong style="color:${accentColor};">${opts.percentUsed.toFixed(0)}%</strong> of your ₹${opts.budget} budget. Moderate usage for the rest of the month to stay within your limit.`}
      </p>

      <div style="text-align:center;">
        ${ctaButton('View Full Dashboard', `${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard`, accentColor)}
      </div>`;

    return sendEmail({
        to: opts.to,
        subject: `📊 ${isOver ? '🚨 Budget Exceeded' : 'Budget Alert'}: ₹${opts.currentSpend.toFixed(0)} / ₹${opts.budget} — EnergyLens`,
        html: wrapHtml(isOver ? 'Monthly Budget Exceeded!' : 'Approaching Monthly Budget', accentColor, body),
    });
};

// ══════════════════════════════════════════════════════════════════════════════
// 4. MAX CAPACITY APPLIANCE NOTIFICATION
// ══════════════════════════════════════════════════════════════════════════════
export const sendMaxCapacityEmail = async (opts: {
    to: string;
    userName: string;
    applianceName: string;
    dailyUsageHours: number;
    maxSafeHours: number;
}) => {
    const overBy = opts.dailyUsageHours - opts.maxSafeHours;
    const accentColor = '#ef4444';

    const body = `
      <p style="color:#94a3b8;font-size:15px;margin:0 0 24px 0;">Hi <strong style="color:#f1f5f9;">${opts.userName}</strong>, one of your appliances is running beyond its safe operating limit.</p>

      <div style="background:#0f172a;border-radius:12px;padding:24px;border:1px solid ${accentColor}44;margin-bottom:24px;">
        <div style="margin-bottom:16px;">
          <h2 style="color:#f1f5f9;font-size:18px;margin:0 0 8px 0;">⚡ ${opts.applianceName}</h2>
          ${pill(`${overBy.toFixed(1)}h over safe limit`, accentColor)}
        </div>
        <table width="100%" cellpadding="8" cellspacing="0">
          <tr>
            ${statBox('Daily Usage', `${opts.dailyUsageHours}h`, accentColor)}
            <td width="12"></td>
            ${statBox('Safe Limit', `${opts.maxSafeHours}h`, '#22c55e')}
            <td width="12"></td>
            ${statBox('Over By', `${overBy.toFixed(1)}h`, '#ef4444')}
          </tr>
        </table>
      </div>

      <div style="background:#7f1d1d22;border:1px solid #ef444444;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
        <p style="color:#fca5a5;font-size:13px;margin:0;line-height:1.7;">
          ⚠️ <strong>Why this matters:</strong> Running appliances beyond their rated capacity increases wear, raises energy bills, and can be a safety hazard. Please reduce daily usage or spread load across multiple days.
        </p>
      </div>

      <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin:0 0 28px 0;">
        Your <strong style="color:#f1f5f9;">${opts.applianceName}</strong> is currently configured for <strong style="color:${accentColor};">${opts.dailyUsageHours} hours/day</strong>, which exceeds the manufacturer's recommended maximum of <strong style="color:#22c55e;">${opts.maxSafeHours} hours/day</strong>.
      </p>

      <div style="text-align:center;">
        ${ctaButton('Update Appliance Settings', `${process.env.CLIENT_URL || 'http://localhost:5173'}/appliances`, accentColor)}
      </div>`;

    return sendEmail({
        to: opts.to,
        subject: `⚡ Capacity Warning: ${opts.applianceName} is running ${overBy.toFixed(1)}h over safe limit — EnergyLens`,
        html: wrapHtml(`Max Capacity Warning: ${opts.applianceName}`, accentColor, body),
    });
};

// ─── Core send helper ─────────────────────────────────────────────────────────
export const sendEmail = async (opts: { to: string; subject: string; html: string; text?: string }) => {
    const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@energylens.app';
    const transporter = createTransporter();

    try {
        const info = await transporter.sendMail({
            from: `"EnergyLens ⚡" <${from}>`,
            to: opts.to,
            subject: opts.subject,
            html: opts.html,
            text: opts.text || opts.subject,
        });
        console.log(`📧 Email sent → ${opts.to} | msgId: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (err: any) {
        console.error(`❌ Email failed → ${opts.to}:`, err?.message);
        return { success: false, error: err?.message };
    }
};
