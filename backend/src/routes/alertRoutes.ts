import express from 'express';
import { getAlerts, markAlertRead, markAllAlertsRead, deleteAlert, generateSampleAlerts } from '../controllers/alertController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', protect, getAlerts);
router.put('/mark-all-read', protect, markAllAlertsRead);
router.put('/:id/read', protect, markAlertRead);
router.delete('/:id', protect, deleteAlert);
router.post('/generate-samples', protect, generateSampleAlerts);

export default router;
