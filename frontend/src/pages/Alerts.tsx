import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCheck, Trash2, Filter, AlertTriangle, TrendingUp, Zap, Clock, IndianRupee, Info } from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';

interface Alert {
    _id: string;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

const severityConfig = {
    low: { bg: 'bg-slate-50 dark:bg-slate-800/50', border: 'border-slate-200 dark:border-slate-700', badge: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300', dot: 'bg-slate-400' },
    medium: { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800/50', badge: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300', dot: 'bg-blue-500' },
    high: { bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800/50', badge: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300', dot: 'bg-amber-500' },
    critical: { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800/50', badge: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300', dot: 'bg-red-500' },
};

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    budget_exceeded: IndianRupee,
    bill_spike: TrendingUp,
    appliance_anomaly: Zap,
    peak_hour_overuse: Clock,
    threshold_breach: AlertTriangle,
    usage_milestone: Info,
    forecast_warning: TrendingUp,
};

export const Alerts: React.FC = () => {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [filter, setFilter] = useState<'all' | 'unread' | 'high' | 'critical'>('all');
    const [isLoading, setIsLoading] = useState(true);

    const API = import.meta.env.VITE_API_URL || 'http://localhost:5001';

    const getHeaders = () => {
        const token = localStorage.getItem('token');
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    const fetchAlerts = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(`${API}/api/alerts`, getHeaders());
            setAlerts(res.data.alerts || []);
        } catch {
            setAlerts([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchAlerts(); }, []);

    const markRead = async (id: string) => {
        try {
            await axios.put(`${API}/api/alerts/${id}/read`, {}, getHeaders());
        } catch { }
        setAlerts(prev => prev.map(a => a._id === id ? { ...a, isRead: true } : a));
    };

    const markAllRead = async () => {
        try {
            await axios.put(`${API}/api/alerts/mark-all-read`, {}, getHeaders());
        } catch { }
        setAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
    };

    const deleteAlert = async (id: string) => {
        try {
            await axios.delete(`${API}/api/alerts/${id}`, getHeaders());
        } catch { }
        setAlerts(prev => prev.filter(a => a._id !== id));
    };

    const filtered = alerts.filter(a => {
        if (filter === 'unread') return !a.isRead;
        if (filter === 'high') return a.severity === 'high';
        if (filter === 'critical') return a.severity === 'critical';
        return true;
    });

    const unreadCount = alerts.filter(a => !a.isRead).length;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Bell className="h-6 w-6 text-blue-600" />
                        Alert Center
                        {unreadCount > 0 && (
                            <span className="h-6 w-6 flex items-center justify-center text-xs font-bold bg-red-500 text-white rounded-full">{unreadCount}</span>
                        )}
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Monitor energy alerts, spikes, and anomalies</p>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllRead}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                    >
                        <CheckCheck className="h-4 w-4" />
                        Mark All Read
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <Filter className="h-4 w-4 text-slate-400 flex-shrink-0" />
                {(['all', 'unread', 'high', 'critical'] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize whitespace-nowrap transition-all ${filter === f
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                    >
                        {f === 'all' ? `All (${alerts.length})` : f === 'unread' ? `Unread (${unreadCount})` : f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {/* Alert List */}
            <div className="space-y-3">
                {filtered.length === 0 ? (
                    <div className="text-center py-16">
                        <Bell className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-500 dark:text-slate-400 font-medium">No alerts found</p>
                        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">You're all caught up!</p>
                    </div>
                ) : (
                    filtered.map((alert, i) => {
                        const cfg = severityConfig[alert.severity];
                        const Icon = typeIcons[alert.type] || AlertTriangle;
                        return (
                            <motion.div
                                key={alert._id}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: i * 0.05 }}
                                className={`relative flex gap-4 p-4 rounded-2xl border ${cfg.bg} ${cfg.border} ${!alert.isRead ? 'shadow-sm' : 'opacity-80'}`}
                                onClick={() => !alert.isRead && markRead(alert._id)}
                            >
                                {/* Unread dot */}
                                {!alert.isRead && (
                                    <span className={`absolute top-4 right-4 h-2 w-2 rounded-full ${cfg.dot}`} />
                                )}

                                <div className={`p-2.5 rounded-xl h-fit ${cfg.badge}`}>
                                    <Icon className="h-4 w-4" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <p className={`text-sm font-bold ${!alert.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                                                {alert.title}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{alert.message}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${cfg.badge}`}>
                                            {alert.severity}
                                        </span>
                                        <span className="text-[10px] text-slate-400">
                                            {format(new Date(alert.createdAt), 'dd MMM, hh:mm a')}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={(e) => { e.stopPropagation(); deleteAlert(alert._id); }}
                                    className="self-start p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 rounded-lg transition-all"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
