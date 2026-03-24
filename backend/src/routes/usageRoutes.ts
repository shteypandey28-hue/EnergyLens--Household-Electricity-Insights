import express from 'express';
import { addReading, getReadings } from '../controllers/meterController';
import { addAppliance, getAppliances, deleteAppliance, patchApplianceService } from '../controllers/applianceController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/readings').post(protect, addReading).get(protect, getReadings);
router.route('/appliances').post(protect, addAppliance).get(protect, getAppliances);
router.route('/appliances/:id').delete(protect, deleteAppliance);
router.patch('/appliances/:id/service', protect, patchApplianceService);

export default router;

