import express from 'express';
import { triggerNotifications, sendTestEmail } from '../controllers/notificationController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// POST /api/notifications/trigger  — run full notification check immediately
router.post('/trigger', protect, triggerNotifications);

// POST /api/notifications/test-email — send a test email to the logged-in user
router.post('/test-email', protect, sendTestEmail);

export default router;
