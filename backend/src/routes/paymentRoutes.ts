import express from 'express';
import { createOrder, verifyPayment, subscribe } from '../controllers/paymentController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/create-order', protect, createOrder);  // Step 1: get Razorpay order
router.post('/verify',       protect, verifyPayment); // Step 2: verify & upgrade
router.post('/subscribe',    protect, subscribe);      // Legacy demo

export default router;
