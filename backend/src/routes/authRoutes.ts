import express from 'express';
import multer from 'multer';
import path from 'path';
import {
    registerUser,
    loginUser,
    getMe,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    uploadProfilePicture,
} from '../controllers/authController';
import { googleSignIn } from '../controllers/googleAuthController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// ─── Multer Config ───────────────────────────────────────────
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req: any, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `profile-${req.user?._id}-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (_req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) return cb(null, true);
        cb(new Error('Only images (jpg, jpeg, png, webp) are allowed'));
    },
});

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleSignIn);          // ← Google OAuth
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/profile-picture', protect, upload.single('image'), uploadProfilePicture);

export default router;

