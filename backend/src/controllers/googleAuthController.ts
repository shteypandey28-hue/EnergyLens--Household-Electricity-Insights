import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Household from '../models/Household';

const JWT_SECRET = process.env.JWT_SECRET || 'energylens_secret_key_2024';

const generateToken = (id: string) =>
    jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });

/**
 * POST /api/auth/google
 * Body: { credential: string }  ← Google ID token from @react-oauth/google
 */
export const googleSignIn = async (req: Request, res: Response) => {
    const { credential } = req.body;

    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    console.log('--- Google Sign-In Attempt ---');
    console.log('Credential present:', !!credential);
    if (credential) {
        console.log('Credential length:', credential.length);
    }
    console.log('Client ID length:', GOOGLE_CLIENT_ID?.length);

    if (!credential) {
        return res.status(400).json({ message: 'Google credential is required' });
    }

    if (!GOOGLE_CLIENT_ID) {
        console.error('❌ GOOGLE_CLIENT_ID is missing in server environment variables');
        return res.status(500).json({ message: 'Server configuration error' });
    }

    try {
        const client = new OAuth2Client(GOOGLE_CLIENT_ID);
        // ── Step 1: Verify Google ID token ──────────────────────────────
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload) {
            console.error('❌ No payload returned from verifyIdToken');
            return res.status(401).json({ message: 'Invalid Google token' });
        }

        const { sub: googleId, email, name, picture } = payload;

        if (!email || !name) {
            return res.status(400).json({ message: 'Google account missing email or name' });
        }

        // ── Step 2: Find or create user ──────────────────────────────────
        let user = await User.findOne({
            $or: [{ googleId }, { email }],
        });

        let isNewUser = false;

        if (user) {
            // Existing user — link googleId if not already linked
            if (!user.googleId) {
                user.googleId = googleId;
                user.authProvider = 'google';
                user.isEmailVerified = true;
            }
            // Refresh profile picture from Google ONLY if they don't have one,
            // or if the current one is an external (Google) photo.
            // If they uploaded a local photo (/uploads/), keep it!
            const isLocalPhoto = user.profilePicture?.startsWith('/uploads/');
            if (!isLocalPhoto) {
                user.profilePicture = picture || user.profilePicture;
            }
            await user.save();
        } else {
            // Brand-new user via Google
            isNewUser = true;
            user = await User.create({
                name,
                email,
                googleId,
                authProvider: 'google',
                profilePicture: picture,
                avatar: picture,
                isEmailVerified: true,
                state: 'Delhi',
                tariffType: 'Residential',
            });

            // Create a default household (mirrors registerUser flow)
            const household = await Household.create({
                user: user._id,
                name: 'My Home',
                state: user.state,
                tariffType: user.tariffType,
                isDefault: true,
            });
            await User.findByIdAndUpdate(user._id, { activeHousehold: household._id });
            user.activeHousehold = household._id as any;
        }

        // ── Step 3: Return JWT + user ────────────────────────────────────
        const needsOnboarding = !user.activeHousehold;

        return res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            state: user.state,
            tariffType: user.tariffType,
            monthlyBudget: user.monthlyBudget,
            isEmailVerified: user.isEmailVerified,
            profilePicture: user.profilePicture,
            authProvider: user.authProvider,
            notificationPreferences: user.notificationPreferences,
            token: generateToken(user.id),
            isNewUser,
            needsOnboarding,
        });
    } catch (error: any) {
        console.error('❌ Google sign-in verification failed:');
        console.error('Error Name:', error?.name);
        console.error('Error Message:', error?.message);
        console.error('Expected Audience:', GOOGLE_CLIENT_ID);

        if (error?.message?.includes('Token used too late')) {
            return res.status(401).json({ message: 'Google token has expired. Please try again.' });
        }
        if (error?.message?.includes('Invalid token')) {
            return res.status(401).json({ message: 'Invalid Google token. Please try again.' });
        }
        return res.status(500).json({ message: 'Google authentication failed. Please try again.' });
    }
};
