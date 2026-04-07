import { Request, Response } from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import User from '../models/User';
import Transaction from '../models/Transaction';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

const PLAN_PRICES: Record<string, { amount: number; label: string; role: 'basic' | 'premium' }> = {
    basic:   { amount: 4900,  label: 'Basic Plan',   role: 'basic'   }, // ₹49 in paise
    premium: { amount: 9900,  label: 'Premium Plan', role: 'premium' },
};

// ── POST /api/payment/create-order ──────────────────────────
// Creates a Razorpay order and returns order_id to frontend
export const createOrder = async (req: Request, res: Response) => {
    // @ts-ignore
    const user = req.user;
    const { plan } = req.body; // 'basic' | 'premium'

    const config = PLAN_PRICES[plan];
    if (!config) {
        return res.status(400).json({ message: 'Invalid plan. Choose basic or premium.' });
    }

    try {
        const order = await razorpay.orders.create({
            amount: config.amount,   // in paise
            currency: 'INR',
            receipt: `rcpt_${user._id.toString().slice(-8)}_${Date.now().toString().slice(-12)}`,
            notes: {
                userId: user._id.toString(),
                plan,
            },
        });

        res.json({
            orderId:  order.id,
            amount:   config.amount,
            currency: 'INR',
            plan,
            label:    config.label,
            keyId:    process.env.RAZORPAY_KEY_ID,
            userName: user.name,
            userEmail: user.email,
        });
    } catch (error: any) {
        console.error('Razorpay create order error:', JSON.stringify(error, null, 2));
        console.error('Error message:', error?.message);
        console.error('Error description:', error?.error?.description);
        console.error('RAZORPAY_KEY_ID set:', !!process.env.RAZORPAY_KEY_ID, '| prefix:', process.env.RAZORPAY_KEY_ID?.substring(0, 12));
        res.status(500).json({
            message: 'Failed to create payment order',
            error: error?.message || String(error),
            razorpay_error: error?.error?.description || error?.error || null,
            key_set: !!process.env.RAZORPAY_KEY_ID,
            key_prefix: process.env.RAZORPAY_KEY_ID?.substring(0, 12),
        });
    }
};

// ── POST /api/payment/verify ─────────────────────────────────
// Verifies Razorpay signature and upgrades the user's plan
export const verifyPayment = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user?._id;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;

    try {
        // 1. Verify signature
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ message: 'Payment verification failed. Invalid signature.' });
        }

        // 2. Map plan to role
        const config = PLAN_PRICES[plan];
        if (!config) {
            return res.status(400).json({ message: 'Invalid plan.' });
        }

        // 3. Record transaction
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        await Transaction.create({
            user: userId,
            plan: config.role,
            amount: config.amount / 100, // back to ₹
            status: 'success',
            paymentMethod: 'razorpay',
            transactionId: razorpay_payment_id,
            subscriptionDuration: 30,
            notes: `Razorpay order ${razorpay_order_id}`,
        });

        // 4. Upgrade user
        await User.findByIdAndUpdate(userId, {
            role: config.role,
            subscriptionExpires: expiresAt,
        });

        res.json({
            message: `Successfully upgraded to ${config.label}! Valid until ${expiresAt.toLocaleDateString('en-IN')}.`,
            plan: config.role,
            expiresAt,
        });
    } catch (error: any) {
        console.error('Payment verify error:', error);
        res.status(500).json({ message: 'Payment verification failed', error: error.message });
    }
};

// ── POST /api/payment/subscribe (legacy demo mode) ───────────
export const subscribe = async (req: Request, res: Response) => {
    // @ts-ignore
    const user = req.user;
    const { plan } = req.body;
    try {
        const config = PLAN_PRICES[plan];
        if (!config) return res.status(400).json({ message: 'Invalid plan selected' });
        user.role = config.role;
        await user.save();
        res.json({ message: `Upgraded to ${config.label} successfully!`, user });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
