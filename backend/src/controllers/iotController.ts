import { Request, Response } from 'express';
import { getIO } from '../utils/socket';
import mongoose from 'mongoose';

// ─── IoT Telemetry Ingestion ──────────────────────────────────────────────
export const ingestTelemetry = async (req: Request, res: Response) => {
    try {
        const { applianceId, powerWatts, voltage, current, state } = req.body;

        if (!applianceId) {
            return res.status(400).json({ message: 'applianceId is required' });
        }

        const io = getIO();

        // 1. Broadcast real-time data to anyone subscribed to this appliance
        const telemetryData = {
            applianceId,
            powerWatts: Number(powerWatts) || 0,
            voltage: Number(voltage) || 0,
            current: Number(current) || 0,
            state: state || 'ON',
            timestamp: new Date().toISOString()
        };

        io.to(`appliance_${applianceId}`).emit('telemetry_update', telemetryData);

        // Optional: Save to a time-series DB or process alerts here
        // We skip saving to DB right now to keep it lightweight and focused on real-time WebSockets.
        // If we want to persist it, we would add an IotReading.create(...) call here.

        res.status(200).json({ success: true, message: 'Telemetry received and broadcasted' });
    } catch (err: any) {
        console.error('IoT Ingestion Error:', err.message);
        res.status(500).json({ message: 'Failed to process telemetry' });
    }
};
