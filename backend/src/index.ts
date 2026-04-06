import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './middleware/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(logger);

// ─── Routes ──────────────────────────────────────────────────
import authRoutes from './routes/authRoutes';
import usageRoutes from './routes/usageRoutes';
import forecastRoutes from './routes/forecastRoutes';
import paymentRoutes from './routes/paymentRoutes';
import alertRoutes from './routes/alertRoutes';
import householdRoutes from './routes/householdRoutes';
import subscriptionRoutes from './routes/subscriptionRoutes';
import tariffRoutes from './routes/tariffRoutes';

app.use('/api/auth', authRoutes);
app.use('/api/usage', usageRoutes);
app.use('/api/forecast', forecastRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/households', householdRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/tariffs', tariffRoutes);

// Health check
app.get('/', (_req, res) => {
    res.json({
        status: 'ok',
        message: 'EnergyLens API v2.0 is running',
        timestamp: new Date().toISOString(),
    });
});

// DB connection health check
app.get('/health/db', (_req, res) => {
    const state = mongoose.connection.readyState;
    // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
    const stateMap: Record<number, string> = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
    const uri = process.env.MONGO_URI || '';
    res.json({
        db: stateMap[state] || 'unknown',
        readyState: state,
        uriSet: !!uri,
        uriPrefix: uri.substring(0, 30), // Show first 30 chars only (safe)
    });
});

// Global Error Handler
app.use(errorHandler);

// ─── Database ────────────────────────────────────────────────
mongoose
    .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/energylens')
    .then(() => console.log('✅ MongoDB connected successfully'))
    .catch((err) => {
        console.error('❌ MongoDB connection error name:', err?.name);
        console.error('❌ MongoDB connection error message:', err?.message);
        console.error('❌ MongoDB connection error code:', err?.code);
    });

app.listen(PORT, () => {
    console.log(`🚀 EnergyLens Server running on http://localhost:${PORT}`);
});

export default app;
