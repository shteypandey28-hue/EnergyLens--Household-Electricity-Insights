import express from 'express';
import { getSubscriptionStatus, subscribe, cancelSubscription, getTransactionHistory, toggleAutoRenew } from '../controllers/subscriptionController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/status', protect, getSubscriptionStatus);
router.post('/subscribe', protect, subscribe);
router.patch('/toggle-auto-renew', protect, toggleAutoRenew);
router.post('/cancel', protect, cancelSubscription);
router.get('/transactions', protect, getTransactionHistory);

export default router;
