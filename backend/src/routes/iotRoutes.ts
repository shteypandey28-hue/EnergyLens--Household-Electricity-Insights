import express from 'express';
import { ingestTelemetry } from '../controllers/iotController';

const router = express.Router();

// POST /api/iot/telemetry
// Note: In production, you might want to secure this with an API key from the hardware
router.post('/telemetry', ingestTelemetry);

export default router;
