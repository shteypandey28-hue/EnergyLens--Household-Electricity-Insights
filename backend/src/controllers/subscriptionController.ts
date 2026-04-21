import { Request, Response } from 'express';
import User from '../models/User';
import Transaction from '../models/Transaction';

export const getSubscriptionStatus = async (req: Request, res: Response) => {
    // @ts-ignore
    const user = req.user;
    try {
        const transactions = await Transaction.find({ user: user._id, status: 'success' })
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            plan: user.role,
            subscriptionExpires: user.subscriptionExpires,
            autoRenew: user.autoRenew,
            isActive: user.role === 'premium' ||
                (user.subscriptionExpires && new Date(user.subscriptionExpires) > new Date()),
            transactions,
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to get subscription status' });
    }
};

export const subscribe = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user?._id;
    const { plan } = req.body;

    const PLAN_PRICES: Record<string, number> = {
        basic: 149,
        premium: 299,
        pro: 299,
    };

    const planKey = plan === 'pro' ? 'premium' : plan;
    const price = PLAN_PRICES[plan] || 299;

    try {
        // Create transaction record (demo mode - instant success)
        const txn = await Transaction.create({
            user: userId,
            plan: planKey,
            amount: price,
            status: 'success',
            paymentMethod: 'demo',
            transactionId: `DEMO_${Date.now()}`,
            subscriptionDuration: 30,
            notes: 'Demo upgrade - no actual payment',
        });

        // Update user role and subscription expiry
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        await User.findByIdAndUpdate(userId, {
            role: planKey,
            subscriptionExpires: expiresAt,
        });

        res.json({
            message: `Successfully upgraded to ${plan} plan! Valid until ${expiresAt.toLocaleDateString('en-IN')}`,
            transaction: txn,
            expiresAt,
        });
    } catch (error) {
        res.status(500).json({ message: 'Subscription update failed' });
    }
};

export const cancelSubscription = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user?._id;
    try {
        await User.findByIdAndUpdate(userId, {
            role: 'free',
            subscriptionExpires: null,
        });
        res.json({ message: 'Subscription cancelled. You have been downgraded to free plan.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to cancel subscription' });
    }
};

export const getTransactionHistory = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user?._id;
    try {
        const transactions = await Transaction.find({ user: userId }).sort({ createdAt: -1 });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Failed to get transactions' });
    }
};
export const toggleAutoRenew = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user?._id;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.autoRenew = !user.autoRenew;
        await user.save();

        res.json({
            message: `Auto-renewal turned ${user.autoRenew ? 'on' : 'off'}`,
            autoRenew: user.autoRenew,
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to toggle auto-renewal' });
    }
};
