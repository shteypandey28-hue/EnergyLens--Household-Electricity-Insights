import express from 'express';
import { getForecast } from '../controllers/forecastController';
import { protect, requirePremium } from '../middleware/authMiddleware';

const router = express.Router();

/**
 * @route  GET /api/forecast
 * @desc   Get AI-powered consumption forecast for the authenticated user
 * @access Private – Premium plan required
 */
router.get('/', protect, requirePremium, getForecast);

export default router;
