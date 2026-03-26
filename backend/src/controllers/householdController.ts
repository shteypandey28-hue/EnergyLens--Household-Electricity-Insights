import { Request, Response } from 'express';
import Household from '../models/Household';
import User from '../models/User';

export const getHouseholds = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user?._id;
    try {
        const households = await Household.find({ user: userId }).sort({ createdAt: -1 });
        res.json(households);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch households' });
    }
};

export const createHousehold = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user?._id;
    // @ts-ignore
    const userRole = req.user?.role;

    // Check if free users are limited to 1 household
    const existingCount = await Household.countDocuments({ user: userId });
    if (userRole === 'free' && existingCount >= 1) {
        return res.status(403).json({
            message: 'Free plan allows only 1 household. Upgrade to Premium for multi-household support.',
            requiresUpgrade: true,
        });
    }

    const { name, address, state, tariffType, connectedLoad, monthlyBudget, meterNumber, discom } = req.body;
    try {
        // If this is a new one, make others non-default
        if (existingCount === 0) {
            await Household.updateMany({ user: userId }, { isDefault: false });
        }

        const household = await Household.create({
            user: userId,
            name,
            address,
            state,
            tariffType,
            connectedLoad,
            monthlyBudget,
            meterNumber,
            discom,
            isDefault: existingCount === 0,
        });

        // If first household, set as active
        if (existingCount === 0) {
            await User.findByIdAndUpdate(userId, { activeHousehold: household._id });
        }

        res.status(201).json(household);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create household' });
    }
};

export const updateHousehold = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user?._id;
    const { id } = req.params;
    try {
        const household = await Household.findOneAndUpdate(
            { _id: id, user: userId },
            req.body,
            { new: true }
        );
        if (!household) return res.status(404).json({ message: 'Household not found' });
        res.json(household);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update household' });
    }
};

export const setActiveHousehold = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user?._id;
    const { id } = req.params;
    try {
        const household = await Household.findOne({ _id: id, user: userId });
        if (!household) return res.status(404).json({ message: 'Household not found' });
        await User.findByIdAndUpdate(userId, { activeHousehold: id });
        res.json({ message: 'Active household updated', household });
    } catch (error) {
        res.status(500).json({ message: 'Failed to set active household' });
    }
};

export const deleteHousehold = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user?._id;
    const { id } = req.params;
    try {
        const count = await Household.countDocuments({ user: userId });
        if (count <= 1) return res.status(400).json({ message: 'Cannot delete your only household' });
        await Household.findOneAndDelete({ _id: id, user: userId });
        res.json({ message: 'Household deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete household' });
    }
};
