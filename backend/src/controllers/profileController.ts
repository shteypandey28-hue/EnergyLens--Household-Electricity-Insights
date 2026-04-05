import { Request, Response } from 'express';
import User from '../models/User';

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req: Request, res: Response) => {
    // @ts-ignore
    const user = req.user;
    const { name, state } = req.body;

    try {
        const updatedUser = await User.findById(user._id);

        if (updatedUser) {
            updatedUser.name = name || updatedUser.name;
            updatedUser.state = state || updatedUser.state;

            const savedUser = await updatedUser.save();

            res.json({
                _id: savedUser._id,
                name: savedUser.name,
                email: savedUser.email,
                role: savedUser.role,
                state: savedUser.state,
                token: req.headers.authorization?.split(' ')[1] // Return existing token
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
