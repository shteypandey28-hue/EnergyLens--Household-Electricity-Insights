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
        // ── Free plan cap: max 3 appliances ──────────────────────────
        if (user.role === 'free') {
            const count = await Appliance.countDocuments({ user: user._id });
            if (count >= 3) {
                return res.status(403).json({
                    success: false,
                    message: 'Free plan allows a maximum of 3 appliances. Upgrade to Basic for unlimited appliances.',
                    requiresUpgrade: true,
                    requiredPlan: 'basic',
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
