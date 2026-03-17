import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User';
import Household from '../models/Household';

const JWT_SECRET = process.env.JWT_SECRET || 'energylens_secret_key_2024';

const generateToken = (id: string) => {
    return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

export const registerUser = async (req: Request, res: Response) => {
    const { name, email, password, state, tariffType } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            state: state || 'Delhi',
            tariffType: tariffType || 'Residential',
            isEmailVerified: true, // Auto-verify for demo
        });

        // Create default household
        const household = await Household.create({
            user: user._id,
            name: 'My Home',
            state: user.state,
            tariffType: user.tariffType,
            isDefault: true,
        });

        await User.findByIdAndUpdate(user._id, { activeHousehold: household._id });

        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            state: user.state,
            tariffType: user.tariffType,
            monthlyBudget: user.monthlyBudget,
            isEmailVerified: user.isEmailVerified,
            profilePicture: user.profilePicture,
            token: generateToken(user.id),
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: 'Invalid email or password' });

        const isMatch = await bcrypt.compare(password, user.password || '');
        if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            state: user.state,
            tariffType: user.tariffType,
            monthlyBudget: user.monthlyBudget,
            isEmailVerified: user.isEmailVerified,
            notificationPreferences: user.notificationPreferences,
            profilePicture: user.profilePicture,
            token: generateToken(user.id),
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const getMe = async (req: Request, res: Response) => {
    // @ts-ignore
    const user = req.user;
    if (user) {
        res.status(200).json(user);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

export const updateProfile = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user?._id;
    const { name, state, tariffType, phone, monthlyBudget, notificationPreferences } = req.body;
    try {
        const user = await User.findByIdAndUpdate(
            userId,
            { name, state, tariffType, phone, monthlyBudget, notificationPreferences },
            { new: true, select: '-password' }
        );
        // Also update active household tariff/state if changed
        if (user?.activeHousehold && (state || tariffType)) {
            await Household.findByIdAndUpdate(user.activeHousehold, { state, tariffType });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update profile' });
    }
};

export const changePassword = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user?._id;
    const { currentPassword, newPassword } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(currentPassword, user.password || '');
        if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();
        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to change password' });
    }
};

export const forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            // Don't reveal if user exists
            return res.json({ message: 'If this email exists, a reset link has been sent.' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await user.save();

        // In production, send email here
        // For demo, return the token directly
        const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
        console.log(`Reset URL (demo): ${resetUrl}`);

        res.json({
            message: 'Password reset link sent to your email.',
            // Demo: expose token so frontend can work without email
            resetToken: process.env.NODE_ENV !== 'production' ? resetToken : undefined,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    const { token } = req.params;
    const { password } = req.body;
    try {
        const hashedToken = crypto.createHash('sha256').update(token as string).digest('hex');
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) return res.status(400).json({ message: 'Invalid or expired reset token' });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: 'Password reset successful. You can now log in.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const uploadProfilePicture = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user?._id;
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const profilePicture = `/uploads/${req.file.filename}`;
        const user = await User.findByIdAndUpdate(
            userId,
            { profilePicture, avatar: profilePicture }, // Update both for compatibility
            { new: true, select: '-password' }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Failed to upload profile picture' });
    }
};
