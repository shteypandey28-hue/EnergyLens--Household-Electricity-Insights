import { Request, Response } from 'express';
import Appliance from '../models/Appliance';

// @desc    Get all appliances
// @route   GET /api/usage/appliances
// @access  Private
export const getAppliances = async (req: Request, res: Response) => {
    // @ts-ignore
    const user = req.user;
    try {
        const appliances = await Appliance.find({ user: user._id });
        res.json(appliances);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}

// @desc    Add new appliance
// @route   POST /api/usage/appliances
// @access  Private
export const addAppliance = async (req: Request, res: Response) => {
    // @ts-ignore
    const user = req.user;
    const {
        name, type, wattage, dailyUsageHours, quantity,
        maxSafeHours, purchaseDate, warrantyExpiry,
    } = req.body;

    try {
        // ── Plan-based appliance caps ─────────────────────────────────
        const BASE_LIMITS: Record<string, number> = {
            free: 3,
            basic: 15,
            premium: 30,
        };
        const baseLimit = BASE_LIMITS[user.role];
        if (baseLimit !== undefined) {
            // Premium users get extra slots they purchased as add-ons
            const extraSlots = user.role === 'premium' ? (user.extraApplianceSlots || 0) : 0;
            const effectiveLimit = baseLimit + extraSlots;
            const count = await Appliance.countDocuments({ user: user._id });

            if (count >= effectiveLimit) {
                const isPremium = user.role === 'premium';
                const nextPlan = user.role === 'free' ? 'basic' : 'premium';

                if (isPremium) {
                    // Premium users can buy add-on slots instead of upgrading
                    return res.status(403).json({
                        success: false,
                        message: `You have used all ${effectiveLimit} appliance slots. Purchase an add-on to add more (₹9 per appliance).`,
                        requiresAddon: true,
                        currentLimit: effectiveLimit,
                    });
                }

                const message = user.role === 'free'
                    ? `Free plan allows a maximum of ${baseLimit} appliances. Upgrade to Basic for up to 15 appliances.`
                    : `Basic plan allows a maximum of ${baseLimit} appliances. Upgrade to Premium for up to 30 appliances.`;
                return res.status(403).json({
                    success: false,
                    message,
                    requiresUpgrade: true,
                    requiredPlan: nextPlan,
                });
            }
        }
        // ─────────────────────────────────────────────────────────────

        const appliance = await Appliance.create({
            user: user._id,
            name, type, wattage, dailyUsageHours,
            quantity: quantity || 1,
            maxSafeHours: maxSafeHours || null,
            purchaseDate: purchaseDate || null,
            warrantyExpiry: warrantyExpiry || null,
        });
        res.status(201).json(appliance);
    } catch (error: any) {
        console.error('Error creating appliance:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Log a service for an appliance
// @route   PATCH /api/usage/appliances/:id/service
// @access  Private
export const patchApplianceService = async (req: Request, res: Response) => {
    // @ts-ignore
    const user = req.user;
    const { lastServiceDate, serviceNotes } = req.body;

    try {
        const appliance = await Appliance.findById(req.params.id);
        if (!appliance) return res.status(404).json({ message: 'Appliance not found' });
        if (appliance.user.toString() !== user._id.toString())
            return res.status(401).json({ message: 'Not authorized' });

        appliance.set({ lastServiceDate, serviceNotes });
        await appliance.save();
        res.json(appliance);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};


// @desc    Delete appliance
// @route   DELETE /api/usage/appliances/:id
// @access  Private
export const deleteAppliance = async (req: Request, res: Response) => {
    // @ts-ignore
    const user = req.user;
    try {
        const appliance = await Appliance.findById(req.params.id);

        if (!appliance) {
            return res.status(404).json({ message: 'Appliance not found' });
        }

        if (appliance.user.toString() !== user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await appliance.deleteOne();
        res.json({ message: 'Appliance removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}
