import express from 'express';
import { createOrder, verifyPayment, subscribe, createAddonOrder, verifyAddonPayment } from '../controllers/paymentController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

/**
 * @route  POST /api/payment/create-order
 * @desc   Create a Razorpay order for the selected plan
 * @access Private
 */
router.post('/create-order', protect, createOrder);

/**
 * @route  POST /api/payment/verify
 * @desc   Verify Razorpay signature and upgrade user plan
 * @access Private
 */
router.post('/verify', protect, verifyPayment);

/**
 * @route  POST /api/payment/subscribe
 * @desc   Legacy subscribe endpoint (demo/admin use only)
 * @access Private
 */
router.post('/subscribe', protect, subscribe);

/**
 * @route  POST /api/payment/addon/create-order
 * @desc   Create a Razorpay order for extra appliance slots (₹9/slot, Premium only)
 * @access Private
 */
router.post('/addon/create-order', protect, createAddonOrder);

/**
 * @route  POST /api/payment/addon/verify
 * @desc   Verify addon payment and increment user's extraApplianceSlots
 * @access Private
 */
router.post('/addon/verify', protect, verifyAddonPayment);

export default router;
