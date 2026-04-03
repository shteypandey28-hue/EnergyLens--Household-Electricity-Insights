import express from 'express';
import { getForecast } from '../controllers/forecastController';
import { protect, requirePremium } from '../middleware/authMiddleware';

const router = express.Router();

// Forecast is a Premium-only feature
router.get('/', protect, requirePremium, getForecast);

export default router;
