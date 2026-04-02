import express from 'express';
import { getAllTariffRates, getTariffForState } from '../controllers/tariffController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Public endpoint — frontend can fetch tariff info without auth
router.get('/', getAllTariffRates);
router.get('/:state', getTariffForState);

export default router;
