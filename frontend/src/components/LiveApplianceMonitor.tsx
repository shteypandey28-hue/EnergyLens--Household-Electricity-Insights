import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';

// Configure socket to point to the backend URL
const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

interface LiveApplianceMonitorProps {
    applianceId: string;
    applianceName: string;
}

interface TelemetryData {
    applianceId: string;
    powerWatts: number;
    voltage: number;
    current: number;
    state: string;
    timestamp: string;
}

const LiveApplianceMonitor: React.FC<LiveApplianceMonitorProps> = ({ applianceId, applianceName }) => {
    const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [history, setHistory] = useState<number[]>([]);

    useEffect(() => {
        // Initialize socket connection
        const socket: Socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'], // Prefer websocket
        });

        socket.on('connect', () => {
            setIsConnected(true);
            // Subscribe to this specific appliance's room
            socket.emit('subscribe_appliance', applianceId);
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
        });

        // Listen for live telemetry updates
        socket.on('telemetry_update', (data: TelemetryData) => {
            setTelemetry(data);
            setHistory((prev) => {
                const newHistory = [...prev, data.powerWatts];
                // Keep only the last 20 data points for the mini chart
                if (newHistory.length > 20) newHistory.shift();
                return newHistory;
            });
        });

        // Cleanup on unmount
        return () => {
            socket.emit('unsubscribe_appliance', applianceId);
            socket.disconnect();
        };
    }, [applianceId]);

    // Calculate dynamic styles based on power draw
    const getGlowColor = (watts: number) => {
        if (watts === 0) return 'rgba(148, 163, 184, 0.2)'; // Gray/Off
        if (watts < 500) return 'rgba(34, 197, 94, 0.4)';  // Green/Low
        if (watts < 1500) return 'rgba(234, 179, 8, 0.5)'; // Yellow/Medium
        return 'rgba(239, 68, 68, 0.6)';                   // Red/High
    };

    const currentWatts = telemetry?.powerWatts || 0;
    const glowColor = getGlowColor(currentWatts);

    return (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between" style={{ minHeight: '200px' }}>
            {/* Background Glow Effect */}
            <motion.div
                className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl pointer-events-none"
                animate={{ backgroundColor: glowColor }}
                transition={{ duration: 0.5 }}
                style={{ transform: 'translate(20%, -20%)' }}
            />

            <div className="flex justify-between items-start mb-4 z-10 relative">
                <div>
                    <h3 className="text-slate-200 font-semibold text-lg flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                            {isConnected && currentWatts > 0 && (
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            )}
                            <span className={`relative inline-flex rounded-full h-3 w-3 ${isConnected ? (currentWatts > 0 ? 'bg-emerald-500' : 'bg-slate-500') : 'bg-red-500'}`}></span>
                        </span>
                        {applianceName}
                    </h3>
                    <p className="text-slate-400 text-xs mt-1">Live Hardware Telemetry</p>
                </div>
                <div className="text-right">
                    <AnimatePresence mode="popLayout">
                        <motion.div
                            key={currentWatts}
                            initial={{ y: -10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 10, opacity: 0, position: 'absolute' }}
                            className="text-3xl font-bold text-white tracking-tight"
                        >
                            {currentWatts} <span className="text-sm font-medium text-slate-400">W</span>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4 mt-auto z-10 relative">
                <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-800">
                    <p className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold mb-1">Voltage</p>
                    <p className="text-slate-200 font-mono text-sm">{telemetry?.voltage || 0} V</p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-800">
                    <p className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold mb-1">Current</p>
                    <p className="text-slate-200 font-mono text-sm">{telemetry?.current || 0} A</p>
                </div>
            </div>
        </div>
    );
};

export default LiveApplianceMonitor;
