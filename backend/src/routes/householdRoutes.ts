import express from 'express';
import { getHouseholds, createHousehold, updateHousehold, setActiveHousehold, deleteHousehold } from '../controllers/householdController';
import { protect, requireBasicOrAbove } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', protect, getHouseholds);
// Creating additional households requires Basic or above
router.post('/', protect, requireBasicOrAbove, createHousehold);
router.put('/:id', protect, updateHousehold);
router.put('/:id/activate', protect, setActiveHousehold);
router.delete('/:id', protect, deleteHousehold);

export default router;
