import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import User from '../models/User';

interface DecodedToken {
    id: string;
}

/**
 * Core auth middleware.
 * Also handles automatic subscription expiry:
 * - If subscriptionExpires has passed AND user is not admin,
 *   the role is reset to 'free' in the DB and in the request object.
 */
export const protect = async (req: Request, res: Response, next: NextFunction) => {
    let token: string | undefined;

    if (req.headers.authorization?.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET || 'energylens_secret_key_2024'
            ) as DecodedToken;

            const user = await User.findById(decoded.id).select('-password');
            if (!user) return res.status(401).json({ message: 'User not found' });

            // ── Auto-expiry check ─────────────────────────────────────────
            // If the user has a paid role (not free, not admin) and their
            // subscription has expired, immediately downgrade them to 'free'.
            if (
                user.role !== 'free' &&
                user.role !== 'admin' &&
                user.subscriptionExpires &&
                new Date(user.subscriptionExpires) < new Date()
            ) {
                // Update in DB (fire-and-forget – don't block the request)
                User.findByIdAndUpdate(user._id, {
                    role: 'free',
                    subscriptionExpires: null,
                }).exec().catch(() => { });

                // Mutate in-memory so this request also sees the downgrade
                user.role = 'free';
                (user as any).subscriptionExpires = null;
            }
            // ─────────────────────────────────────────────────────────────

            // @ts-ignore
            req.user = user;
            next();
        } catch {
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

/**
 * Require premium or admin role.
 * Depends on `protect` running first.
 */
export const requirePremium = (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Not authorized' });

    if (user.role === 'premium' || user.role === 'admin') {
        return next();
    }

    return res.status(403).json({
        message: 'This feature requires a Premium plan. Please upgrade.',
        requiresUpgrade: true,
    });
};

/**
 * Require basic, premium, or admin role.
 */
export const requireBasicOrAbove = (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Not authorized' });

    if (user.role === 'free') {
        return res.status(403).json({
            message: 'This feature requires Basic or Premium plan.',
            requiresUpgrade: true,
        });
    }
    next();
};
