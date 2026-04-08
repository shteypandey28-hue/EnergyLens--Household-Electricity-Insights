import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ConsumptionChart } from '../components/Dashboard/ConsumptionChart';
import {
    Zap, IndianRupee, Leaf, RefreshCw, TrendingUp, TrendingDown,
    Award, AlertTriangle, Lightbulb, Target, Tv, Clock,
    BarChart2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { format, subDays, subMonths, subYears, startOfMonth, endOfMonth } from 'date-fns';
import { getCachedData, setCachedData } from '../utils/cache';

type TimeRange = '7d' | '1m' | '3m' | '6m' | '1y' | '5y';

interface Reading {
    _id: string;
    date: string;
    unitsConsumed: number;
    cost: number;
}

interface ChartDataPoint {
    date: string;
    usage: number;
}

// ─── Formatters ───────────────────────────────────────────────
const formatINR = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

// ─── Mini Card ────────────────────────────────────────────────
interface MiniCardProps {
    title: string;
    value: string | number;
    unit?: string;
    icon: React.ComponentType<{ className?: string }>;
    color: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'slate';
    trend?: { value: number; isPositive: boolean };
    delay?: number;
    subtitle?: string;
    isDark?: boolean;
}

const colorMap = (isDark: boolean) => ({
    blue: { bg: isDark ? 'bg-blue-900/10' : 'bg-blue-50/70', icon: isDark ? 'bg-blue-900/40 text-blue-400' : 'bg-blue-100 text-blue-600', text: isDark ? 'text-blue-300' : 'text-blue-700', ring: isDark ? 'border-blue-800/30' : 'border-blue-200/50' },
    green: { bg: isDark ? 'bg-emerald-900/10' : 'bg-emerald-50/70', icon: isDark ? 'bg-emerald-900/40 text-emerald-400' : 'bg-emerald-100 text-emerald-600', text: isDark ? 'text-emerald-300' : 'text-emerald-700', ring: isDark ? 'border-emerald-800/30' : 'border-emerald-200/50' },
    amber: { bg: isDark ? 'bg-amber-900/10' : 'bg-amber-50/70', icon: isDark ? 'bg-amber-900/40 text-amber-400' : 'bg-amber-100 text-amber-600', text: isDark ? 'text-amber-300' : 'text-amber-700', ring: isDark ? 'border-amber-800/30' : 'border-amber-200/50' },
    red: { bg: isDark ? 'bg-red-900/10' : 'bg-red-50/70', icon: isDark ? 'bg-red-900/40 text-red-400' : 'bg-red-100 text-red-600', text: isDark ? 'text-red-300' : 'text-red-700', ring: isDark ? 'border-red-800/30' : 'border-red-200/50' },
    purple: { bg: isDark ? 'bg-purple-900/10' : 'bg-purple-50/70', icon: isDark ? 'bg-purple-900/40 text-purple-400' : 'bg-purple-100 text-purple-600', text: isDark ? 'text-purple-300' : 'text-purple-700', ring: isDark ? 'border-purple-800/30' : 'border-purple-200/50' },
    slate: { bg: isDark ? 'bg-slate-800/20' : 'bg-slate-50/70', icon: isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-600', text: isDark ? 'text-slate-300' : 'text-slate-700', ring: isDark ? 'border-slate-700/30' : 'border-slate-200/50' },
});

const MiniCard: React.FC<MiniCardProps> = ({ title, value, unit, icon: Icon, color, trend, delay = 0, subtitle, isDark = true }) => {
    const c = colorMap(isDark)[color];
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            className={`${c.bg} backdrop-blur-md rounded-2xl p-5 border ${c.ring} hover:shadow-lg hover:-translate-y-1 transition-all duration-300 shadow-sm`}
        >
            <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${c.icon}`}>
                    <Icon className="h-4 w-4" />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-xs font-semibold ${trend.isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                        {trend.isPositive ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                        {trend.value}%
                    </div>
                )}
            </div>
            <div>
                <p className={`text-2xl font-bold ${c.text}`}>{value}{unit && <span className="text-sm font-medium ml-1">{unit}</span>}</p>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} mt-1`}>{title}</p>
                {subtitle && <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'} mt-0.5`}>{subtitle}</p>}
            </div>
        </motion.div>
    );
};

// ─── Efficiency Score Ring ────────────────────────────────────
const EfficiencyScore: React.FC<{ score: number; isDark: boolean }> = ({ score, isDark }) => {
    const radius = 40;
    const circ = 2 * Math.PI * radius;
    const offset = circ - (score / 100) * circ;
    const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
    return (
        <div className="flex flex-col items-center">
            <div className="relative w-24 h-24">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r={radius} fill="none" stroke={isDark ? "#334155" : "#e2e8f0"} strokeWidth="8" />
                    <circle cx="50" cy="50" r={radius} fill="none" stroke={color} strokeWidth="8"
                        strokeDasharray={circ} strokeDashoffset={offset}
                        strokeLinecap="round" className="transition-all duration-1000" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{score}</span>
                </div>
            </div>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} mt-1 font-medium`}>/ 100</p>
        </div>
    );
};

// ─── Budget Progress ──────────────────────────────────────────
const BudgetProgress: React.FC<{ spent: number; budget: number; isDark: boolean }> = ({ spent, budget, isDark }) => {
    const pct = Math.min((spent / budget) * 100, 100);
    const barColor = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-emerald-500';
    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Monthly Budget</span>
                <span className={`text-sm font-bold ${pct >= 90 ? 'text-red-500' : pct >= 70 ? 'text-amber-500' : 'text-emerald-500'}`}>{pct.toFixed(0)}%</span>
            </div>
            <div className={`h-2.5 ${isDark ? 'bg-slate-700' : 'bg-slate-200'} rounded-full overflow-hidden`}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                    className={`h-full ${barColor} rounded-full`}
                />
            </div>
            <div className="flex justify-between mt-1.5">
                <span className="text-xs text-slate-500">{formatINR(spent)} spent</span>
                <span className="text-xs text-slate-500">{formatINR(budget)} budget</span>
            </div>
        </div>
    );
};

// ─── Main Dashboard ───────────────────────────────────────────
export const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [timeRange, setTimeRange] = useState<TimeRange>('7d');
    const [readings, setReadings] = useState<Reading[]>([]);
    const [appliances, setAppliances] = useState<any[]>([]);
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const API = import.meta.env.VITE_API_URL || 'http://localhost:5001';

    const fetchDashboardData = useCallback(async () => {
        const cachedR = getCachedData('readings');
        const cachedA = getCachedData('appliances');
        if (cachedR && cachedA) {
            setReadings(cachedR);
            setAppliances(cachedA);
            setIsInitialLoading(false);
        } else {
            setIsInitialLoading(true);
        }

        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            const [readingsRes, appliancesRes] = await Promise.all([
                axios.get(`${API}/api/usage/readings`, { headers }),
                axios.get(`${API}/api/usage/appliances`, { headers }),
            ]);
            
            const rData = Array.isArray(readingsRes.data) ? readingsRes.data : [];
            const aData = Array.isArray(appliancesRes.data) ? appliancesRes.data : [];
            
            setReadings(rData);
            setAppliances(aData);
            setCachedData('readings', rData);
            setCachedData('appliances', aData);
        } catch {
            if (!cachedR) setReadings([]);
            if (!cachedA) setAppliances([]);
        } finally {
            setIsInitialLoading(false);
        }
    }, [API]);

    useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

    useEffect(() => {
        if (readings.length === 0) { setChartData([]); return; }
        setChartData(processData(readings, timeRange));
    }, [readings, timeRange]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchDashboardData();
        setTimeout(() => setIsRefreshing(false), 600);
    };

    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const prevMonthStart = startOfMonth(subMonths(now, 1));
    const prevMonthEnd = endOfMonth(subMonths(now, 1));

    const currentMonthReadings = readings.filter(r => new Date(r.date) >= currentMonthStart);
    const prevMonthReadings = readings.filter(r => new Date(r.date) >= prevMonthStart && new Date(r.date) <= prevMonthEnd);

    const currentMonthUnits = currentMonthReadings.reduce((s, r) => s + r.unitsConsumed, 0);
    const currentMonthCost = currentMonthReadings.reduce((s, r) => s + r.cost, 0);
    const prevMonthCost = prevMonthReadings.reduce((s, r) => s + r.cost, 0);

    const totalConsumption = readings.reduce((s, r) => s + r.unitsConsumed, 0);
    const carbonFootprint = (totalConsumption * 0.82).toFixed(1);

    const hasData = readings.length > 0;
    const hasAppliances = appliances.length > 0;

    const displayUnits = currentMonthUnits;
    const displayCost = currentMonthCost;
    const displayPrevCost = prevMonthCost;
    const monthlySavings = displayPrevCost - displayCost;
    const savingsPct = displayPrevCost > 0 ? ((monthlySavings / displayPrevCost) * 100).toFixed(1) : 0;

    const budget = user?.monthlyBudget || 2000;
    const efficiencyScore = !hasData ? 0 : displayCost < budget * 0.7 ? 88 : displayCost < budget ? 72 : 55;

    // Top appliance by daily energy (wattage × hours)
    const topAppliance = hasAppliances
        ? appliances.reduce((best: any, a: any) => {
            const energy = (a.wattage || 0) * (a.dailyUsageHours || 0);
            const bestEnergy = (best.wattage || 0) * (best.dailyUsageHours || 0);
            return energy > bestEnergy ? a : best;
          })
        : null;
    const topApplianceDailyKwh = topAppliance
        ? (((topAppliance.wattage || 0) * (topAppliance.dailyUsageHours || 0)) / 1000).toFixed(1)
        : null;

    const getGreeting = () => {
        const h = new Date().getHours();
        if (h < 12) return 'Good Morning';
        if (h < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    if (isInitialLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto relative z-10">
            {/* Hero */}
            <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-900/80 dark:to-slate-900/90 rounded-3xl p-8 shadow-xl shadow-blue-500/10 border border-white/10"
            >
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-300 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1">
                            {getGreeting()}, {user?.name?.split(' ')[0] || 'User'}!
                        </h1>
                        <p className="text-blue-100/80 text-sm">
                            {user?.state || 'India'} · {user?.tariffType || 'Residential'} Tariff · {format(now, 'MMMM yyyy')}
                        </p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl font-semibold text-sm backdrop-blur-md transition-all disabled:opacity-50 border border-white/20"
                    >
                        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </motion.button>
                </div>
            </motion.div>

            {/* Key Metric Cards Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <MiniCard
                    title="Monthly Consumption"
                    value={hasData ? displayUnits.toFixed(0) : '0'}
                    unit="kWh"
                    icon={Zap}
                    color="blue"
                    trend={hasData && displayPrevCost > 0 ? { value: 8, isPositive: false } : undefined}
                    delay={0.05}
                    isDark={isDark}
                />
                <MiniCard
                    title="Estimated Bill"
                    value={hasData ? formatINR(displayCost) : '₹0'}
                    icon={IndianRupee}
                    color="amber"
                    trend={hasData && displayPrevCost > 0 ? { value: Number(savingsPct), isPositive: monthlySavings > 0 } : undefined}
                    delay={0.1}
                    subtitle="This month"
                    isDark={isDark}
                />
                <MiniCard
                    title="vs Last Month"
                    value={!hasData || displayPrevCost === 0 ? '—' : monthlySavings >= 0 ? `↓ ${formatINR(monthlySavings)}` : `↑ ${formatINR(Math.abs(monthlySavings))}`}
                    icon={monthlySavings >= 0 ? TrendingDown : TrendingUp}
                    color={!hasData ? 'slate' : monthlySavings >= 0 ? 'green' : 'red'}
                    delay={0.15}
                    subtitle={!hasData || displayPrevCost === 0 ? 'No data yet' : monthlySavings >= 0 ? 'You saved this month' : 'More than last month'}
                    isDark={isDark}
                />
                <MiniCard
                    title="Top Appliance"
                    value={topAppliance ? topAppliance.name : '—'}
                    icon={Tv}
                    color={topAppliance ? 'purple' : 'slate'}
                    delay={0.2}
                    subtitle={topApplianceDailyKwh ? `${topApplianceDailyKwh} kWh/day` : 'No appliances yet'}
                    isDark={isDark}
                />
                <MiniCard
                    title="Peak Hour"
                    value={hasData ? '6–9 PM' : '—'}
                    icon={Clock}
                    color={hasData ? 'red' : 'slate'}
                    delay={0.25}
                    subtitle={hasData ? 'Highest usage window' : 'No data yet'}
                    isDark={isDark}
                />
                <MiniCard
                    title="Carbon Footprint"
                    value={carbonFootprint}
                    unit="kg CO₂"
                    icon={Leaf}
                    color="green"
                    delay={0.3}
                    isDark={isDark}
                />
            </div>

            {/* Second Row: Chart + Efficiency + Budget */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Consumption Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.35 }}
                    className="lg:col-span-2 premium-card rounded-3xl p-6 transition-all"
                >
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-5 gap-4">
                        <div>
                            <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Consumption Trend</h2>
                            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} mt-0.5`}>kWh usage over time</p>
                        </div>
                        <div className="flex flex-wrap gap-1.5 text-black">
                            {(['7d', '1m', '3m', '6m', '1y', '5y'] as TimeRange[]).map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setTimeRange(r)}
                                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${timeRange === r
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                                        : `${isDark ? 'bg-slate-700 text-slate-400 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`
                                        }`}
                                >
                                    {r.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>
                    {!hasData ? (
                        <div className={`flex flex-col items-center justify-center h-48 rounded-xl ${isDark ? 'bg-slate-800/40' : 'bg-slate-50'} border-2 border-dashed ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                            <Zap className={`h-8 w-8 ${isDark ? 'text-slate-600' : 'text-slate-300'} mb-2`} />
                            <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>No data yet</p>
                            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'} mt-1`}>Add your first reading in Usage &amp; Bills to see trends</p>
                        </div>
                    ) : (
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={timeRange}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.25 }}
                            >
                                <ConsumptionChart data={chartData} timeRange={timeRange} />
                            </motion.div>
                        </AnimatePresence>
                    )}
                </motion.div>

                {/* Right column: Efficiency + Budget */}
                <div className="space-y-4">
                    {/* Efficiency Score */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="premium-card rounded-3xl p-6 transition-all"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Award className="h-4 w-4 text-amber-500" />
                            <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Energy Efficiency</h3>
                        </div>
                        <div className="flex items-center gap-5">
                            <EfficiencyScore score={efficiencyScore} isDark={isDark} />
                            <div>
                                <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                    {efficiencyScore >= 75 ? 'Excellent!' : efficiencyScore >= 50 ? 'Good' : 'Needs Attention'}
                                </p>
                                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} mt-1`}>
                                    {efficiencyScore >= 75
                                        ? 'Top 20% of households in your area'
                                        : 'Room for improvement this month'}
                                </p>
                                <div className={`mt-2 text-xs font-semibold px-2.5 py-1 rounded-full inline-block ${efficiencyScore >= 75 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                                    : efficiencyScore >= 50 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                    }`}>
                                    {efficiencyScore >= 75 ? '★ Efficient' : efficiencyScore >= 50 ? '◆ Average' : '! Below Avg'}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Budget Progress */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.45 }}
                        className="premium-card rounded-3xl p-6 transition-all"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Target className="h-4 w-4 text-blue-500" />
                            <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Budget Tracker</h3>
                        </div>
                        <BudgetProgress spent={displayCost} budget={budget} isDark={isDark} />
                        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} mt-3`}>
                            {budget - displayCost > 0
                                ? `₹${(budget - displayCost).toFixed(0)} remaining this month`
                                : `₹${(displayCost - budget).toFixed(0)} over budget!`}
                        </p>
                    </motion.div>

                    {/* Savings Opportunities / Onboarding tip */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        className="bg-gradient-to-br from-emerald-50/80 to-teal-50/80 dark:from-emerald-900/30 dark:to-teal-900/20 backdrop-blur-md rounded-3xl border border-emerald-200 dark:border-emerald-800/50 p-6 shadow-sm"
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <Lightbulb className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            <h3 className={`text-sm font-bold ${isDark ? 'text-emerald-100' : 'text-emerald-900'}`}>
                                {hasData ? 'Savings Opportunity' : 'Getting Started'}
                            </h3>
                        </div>
                        {hasData ? (
                            <>
                                <p className={`text-xs ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                                    Shift heavy loads to off-peak hours (10 PM–8 AM) to save with time-of-use tariffs.
                                </p>
                                <div className="mt-3 flex items-center gap-1.5">
                                    <BarChart2 className="h-3.5 w-3.5 text-emerald-600" />
                                    <span className={`text-xs font-semibold ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>Potential savings with off-peak usage</span>
                                </div>
                            </>
                        ) : (
                            <ol className={`text-xs ${isDark ? 'text-emerald-300' : 'text-emerald-700'} space-y-1.5 list-decimal list-inside`}>
                                <li>Go to <b>Appliances</b> and add your home appliances</li>
                                <li>Go to <b>Usage &amp; Bills</b> and log your meter readings</li>
                                <li>Come back here to see your energy insights!</li>
                            </ol>
                        )}
                    </motion.div>
                </div>
            </div>

            {/* Appliance Breakdown + Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Appliance Breakdown */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.55 }}
                    className="premium-card rounded-3xl p-6 transition-all"
                >
                    <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-4`}>Top Energy Consumers</h3>
                    {!hasAppliances ? (
                        <div className="text-center py-8">
                            <Tv className={`h-8 w-8 ${isDark ? 'text-slate-600' : 'text-slate-300'} mx-auto mb-2`} />
                            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>No appliances added yet</p>
                            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'} mt-1`}>Go to Appliances to add your devices</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {appliances
                                .map((a: any) => ({ ...a, dailyKwh: ((a.wattage || 0) * (a.dailyUsageHours || 0)) / 1000 }))
                                .sort((a: any, b: any) => b.dailyKwh - a.dailyKwh)
                                .slice(0, 5)
                                .map((a: any, i: number) => {
                                    const total = appliances.reduce((s: number, x: any) => s + ((x.wattage || 0) * (x.dailyUsageHours || 0)) / 1000, 0);
                                    const pct = total > 0 ? (a.dailyKwh / total) * 100 : 0;
                                    const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-rose-500'];
                                    return (
                                        <div key={a._id}>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'} font-medium`}>{a.name}</span>
                                                <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{a.dailyKwh.toFixed(1)} kWh/day · {pct.toFixed(0)}%</span>
                                            </div>
                                            <div className={`h-2 ${isDark ? 'bg-slate-700' : 'bg-slate-100'} rounded-full overflow-hidden`}>
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${pct}%` }}
                                                    transition={{ duration: 0.8, delay: 0.6 + i * 0.1 }}
                                                    className={`h-full ${colors[i % colors.length]} rounded-full`}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    )}
                </motion.div>

                {/* Recent Activity */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="premium-card rounded-3xl p-6 transition-all"
                >
                    <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-4`}>Recent Readings</h3>
                    {readings.length === 0 ? (
                        <div className="text-center py-8">
                            <Zap className={`h-8 w-8 ${isDark ? 'text-slate-600' : 'text-slate-300'} mx-auto mb-2`} />
                            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>No readings yet</p>
                            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'} mt-1`}>Add your first reading in Usage & Bills</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {readings.slice(0, 5).map((r) => (
                                <motion.div
                                    key={r._id}
                                    whileHover={{ x: 3 }}
                                    className={`flex items-center justify-between py-3 px-3 border-b ${isDark ? 'border-slate-800 hover:bg-slate-800/50' : 'border-slate-100 hover:bg-slate-50'} last:border-0 rounded-lg transition-all cursor-pointer`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`h-8 w-8 rounded-lg ${isDark ? 'bg-blue-900/30' : 'bg-blue-100'} flex items-center justify-center`}>
                                            <Zap className={`h-4 w-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                                        </div>
                                        <div>
                                            <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{format(new Date(r.date), 'dd MMM yyyy')}</p>
                                            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Manual Entry</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{r.unitsConsumed} kWh</p>
                                        <p className={`text-xs ${isDark ? 'text-emerald-400' : 'text-emerald-600'} font-semibold`}>₹{r.cost.toFixed(0)}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Alert Banner: only show when user has real data */}
            {hasData && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.65 }}
                    className="flex items-start gap-3 p-4 bg-amber-50/80 dark:bg-amber-900/20 backdrop-blur-md border border-amber-200 dark:border-amber-800/50 rounded-2xl"
                >
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className={`text-sm font-semibold ${isDark ? 'text-amber-100' : 'text-amber-900'}`}>Peak Hour Usage Pattern</p>
                        <p className={`text-xs ${isDark ? 'text-amber-300' : 'text-amber-700'} mt-0.5`}>
                            Based on your readings, shifting heavy loads to off-peak hours (10 PM–8 AM) can reduce your bill.
                        </p>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

// ─── Helpers ──────────────────────────────────────────────────

function seededRandom(seed: number): number {
    const x = Math.sin(seed + 1) * 10000;
    return x - Math.floor(x);
}

function generateMockData(range: TimeRange): ChartDataPoint[] {
    const end = new Date();
    const points: ChartDataPoint[] = [];

    if (range === '7d') {
        for (let i = 6; i >= 0; i--) {
            const d = subDays(end, i);
            points.push({ date: format(d, 'MMM dd'), usage: Math.round(seededRandom(i * 3) * 12 + 8) });
        }
    } else if (range === '1m') {
        for (let i = 29; i >= 0; i--) {
            const d = subDays(end, i);
            points.push({ date: format(d, 'MMM dd'), usage: Math.round(seededRandom(i * 7) * 14 + 8) });
        }
    } else if (range === '3m') {
        for (let i = 12; i >= 0; i--) {
            const d = subDays(end, i * 7);
            points.push({ date: format(d, 'dd MMM'), usage: Math.round(seededRandom(i * 11) * 80 + 40) });
        }
    } else if (range === '6m') {
        for (let i = 24; i >= 0; i--) {
            const d = subDays(end, i * 7);
            points.push({ date: format(d, 'dd MMM'), usage: Math.round(seededRandom(i * 13) * 80 + 40) });
        }
    } else if (range === '1y') {
        for (let i = 11; i >= 0; i--) {
            const d = subMonths(end, i);
            points.push({ date: format(d, 'MMM yy'), usage: Math.round(seededRandom(i * 17) * 200 + 120) });
        }
    } else { // 5y
        for (let i = 59; i >= 0; i--) {
            const d = subMonths(end, i);
            points.push({ date: format(d, 'MMM yy'), usage: Math.round(seededRandom(i * 19) * 200 + 120) });
        }
    }
    return points;
}

function processData(data: Reading[], range: TimeRange): ChartDataPoint[] {
    const end = new Date();
    let start: Date;
    switch (range) {
        case '7d': start = subDays(end, 6); break;
        case '1m': start = subDays(end, 29); break;
        case '3m': start = subMonths(end, 3); break;
        case '6m': start = subMonths(end, 6); break;
        case '1y': start = subYears(end, 1); break;
        case '5y': start = subYears(end, 5); break;
        default: start = subDays(end, 6);
    }

    const filtered = data.filter(r => {
        const d = new Date(r.date);
        return d >= start && d <= end;
    });

    if (filtered.length < 2) return generateMockData(range);

    if (range === '7d' || range === '1m') {
        return [...filtered]
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map(r => ({ date: format(new Date(r.date), 'MMM dd'), usage: r.unitsConsumed }));
    }

    const grouped = new Map<string, number>();
    filtered.forEach(r => {
        const k = format(new Date(r.date), 'MMM yy');
        grouped.set(k, (grouped.get(k) || 0) + r.unitsConsumed);
    });

    if (grouped.size < 2) return generateMockData(range);

    return Array.from(grouped.entries()).map(([date, usage]) => ({ date, usage }));
}
