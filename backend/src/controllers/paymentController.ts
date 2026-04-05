import { Request, Response } from 'express';
import User from '../models/User';

// @desc    Subscribe to a plan
// @route   POST /api/payment/subscribe
// @access  Private
export const subscribe = async (req: Request, res: Response) => {
    // @ts-ignore
    const user = req.user;
    const { plan } = req.body; // 'basic' or 'pro'

    // Simulate payment processing...
    // In real app, verify Razorpay/Stripe signature here.

    try {
        if (plan === 'basic') {
            user.role = 'basic';
        } else if (plan === 'pro') {
            user.role = 'premium';
        } else {
            return res.status(400).json({ message: 'Invalid plan selected' });
        }

        await user.save();

        const planName = plan === 'basic' ? 'Basic' : 'Pro';
        res.json({ message: `Upgraded to ${planName} successfully!`, user });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}
