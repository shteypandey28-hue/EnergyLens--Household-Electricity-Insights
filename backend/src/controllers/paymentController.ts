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
    basic:   { amount: 14900, label: 'Basic Plan',   role: 'basic'   }, // ₹149 in paise
    premium: { amount: 29900, label: 'Premium Plan', role: 'premium' }, // ₹299 in paise
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
            paymentMethod: 'card',
            transactionId: razorpay_payment_id,
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
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

// ── POST /api/payment/addon/create-order ─────────────────────
// Creates a Razorpay order for purchasing extra appliance slots (₹9 per slot)
export const createAddonOrder = async (req: Request, res: Response) => {
    // @ts-ignore
    const user = req.user;
    const { quantity } = req.body; // number of extra slots to buy

    if (!quantity || typeof quantity !== 'number' || quantity < 1 || quantity > 100) {
        return res.status(400).json({ message: 'Quantity must be between 1 and 100.' });
    }

    if (user.role !== 'premium' && user.role !== 'admin') {
        return res.status(403).json({ message: 'Appliance add-ons are only available for Premium users.' });
    }

    const PRICE_PER_SLOT = 1900; // ₹19 in paise
    const totalAmount = PRICE_PER_SLOT * quantity;

    try {
        const order = await razorpay.orders.create({
            amount: totalAmount,
            currency: 'INR',
            receipt: `addon_${user._id.toString().slice(-8)}_${Date.now().toString().slice(-8)}`,
            notes: {
                userId: user._id.toString(),
                type: 'appliance_addon',
                quantity: quantity.toString(),
            },
        });

        res.json({
            orderId: order.id,
            amount: totalAmount,
            currency: 'INR',
            quantity,
            pricePerSlot: 9,
            label: `${quantity} Extra Appliance Slot${quantity > 1 ? 's' : ''}`,
            keyId: process.env.RAZORPAY_KEY_ID,
            userName: user.name,
            userEmail: user.email,
        });
    } catch (error: any) {
        console.error('Addon order create error:', error);
        res.status(500).json({ message: 'Failed to create addon order', error: error?.message });
    }
};

// ── POST /api/payment/addon/verify ───────────────────────────
// Verifies signature and increments user's extraApplianceSlots
export const verifyAddonPayment = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user?._id;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, quantity } = req.body;

    if (!quantity || typeof quantity !== 'number' || quantity < 1) {
        return res.status(400).json({ message: 'Invalid quantity.' });
    }

    try {
        // 1. Verify Razorpay signature
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ message: 'Addon payment verification failed. Invalid signature.' });
        }

        const PRICE_PER_SLOT = 19; // ₹19
        const totalAmount = PRICE_PER_SLOT * quantity;

        // 2. Record transaction
        await Transaction.create({
            user: userId,
            plan: 'premium',
            amount: totalAmount,
            status: 'success',
            paymentMethod: 'card',
            transactionId: razorpay_payment_id,
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            subscriptionDuration: 0,
            notes: `Appliance add-on: ${quantity} slot${quantity > 1 ? 's' : ''} @ ₹9 each`,
        });

        // 3. Increment extra slots on user
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $inc: { extraApplianceSlots: quantity } },
            { new: true }
        );

        res.json({
            message: `Successfully added ${quantity} appliance slot${quantity > 1 ? 's' : ''} at ₹19 each! You can now add up to ${30 + (updatedUser?.extraApplianceSlots || 0)} appliances.`,
            extraApplianceSlots: updatedUser?.extraApplianceSlots,
        });
    } catch (error: any) {
        console.error('Addon verify error:', error);
        res.status(500).json({ message: 'Addon payment verification failed', error: error.message });
    }
};
