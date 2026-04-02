import React, { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import {
    Plus, Tv, Trash2, Zap, X, AlertTriangle, ShieldCheck, ShieldX,
    Wrench, Clock, CalendarDays, CheckCircle2, BarChart2, Lock
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { format, differenceInDays, isPast } from 'date-fns';
import { usePlan } from '../hooks/usePlan';
import { UpgradePromptModal } from '../components/UpgradePromptModal';

// ─── Types ────────────────────────────────────────────────────────
interface Appliance {
    _id: string;
    name: string;
    type: string;
    wattage: number;
    dailyUsageHours: number;
    maxSafeHours?: number;
    quantity: number;
    efficiencyRating?: number;
    purchaseDate?: string;
    warrantyExpiry?: string;
    lastServiceDate?: string;
    serviceNotes?: string;
}

const STATES = [
    'AC', 'Refrigerator', 'WashingMachine', 'Geyser', 'TV', 'Fan', 'Light', 'Other'
];

// ─── Alert helpers ─────────────────────────────────────────────────
function getWarrantyStatus(a: Appliance) {
    if (!a.warrantyExpiry) return null;
    const exp = new Date(a.warrantyExpiry);
    if (isPast(exp)) return 'expired';
    const daysLeft = differenceInDays(exp, new Date());
    if (daysLeft <= 30) return 'expiring_soon';
    return 'active';
}

function isRunningAtMaxCapacity(a: Appliance) {
    if (!a.maxSafeHours) return false;
    return a.dailyUsageHours >= a.maxSafeHours;
}

// ─── Service Modal ─────────────────────────────────────────────────
const ServiceModal: React.FC<{
    appliance: Appliance;
    onClose: () => void;
    onSave: (id: string, date: string, notes: string) => void;
}> = ({ appliance, onClose, onSave }) => {
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [notes, setNotes] = useState('');
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md p-8 shadow-2xl border border-gray-200 dark:border-gray-700"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-xl">
                        <Wrench className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Log Service — {appliance.name}</h2>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Service Date
                        </label>
                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            max={format(new Date(), 'yyyy-MM-dd')}
                            className="w-full h-11 rounded-xl border-0 bg-gray-50 dark:bg-gray-800 px-4 text-sm text-gray-900 dark:text-white ring-1 ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Service Notes (optional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            rows={3}
                            placeholder="e.g. Filter cleaned, gas refilled..."
                            className="w-full rounded-xl border-0 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white ring-1 ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-blue-500 outline-none resize-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        />
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="flex-1 h-11 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onSave(appliance._id, date, notes)}
                        className="flex-1 h-11 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition"
                    >
                        <CheckCircle2 className="h-4 w-4 inline mr-1.5" />
                        Save Service
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

// ─── Alert Banner ─────────────────────────────────────────────────
const AlertBanner: React.FC<{
    appliance: Appliance;
    onService: (a: Appliance) => void;
}> = ({ appliance, onService }) => {
    const ws = getWarrantyStatus(appliance);
    const overCapacity = isRunningAtMaxCapacity(appliance);
    if (!ws && !overCapacity) return null;

    const daysLeft = appliance.warrantyExpiry
        ? differenceInDays(new Date(appliance.warrantyExpiry), new Date())
        : null;

    return (
        <div className="space-y-2 mt-3">
            {ws === 'expired' && (
                <div className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl text-xs">
                    <ShieldX className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
                    <span className="text-red-700 dark:text-red-300 font-medium">Warranty expired</span>
                    <span className="text-red-500 dark:text-red-400">
                        — {format(new Date(appliance.warrantyExpiry!), 'dd MMM yyyy')}
                    </span>
                    <button
                        onClick={() => onService(appliance)}
                        className="ml-auto flex items-center gap-1 px-2 py-0.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium whitespace-nowrap"
                    >
                        <Wrench className="h-3 w-3" /> Service
                    </button>
                </div>
            )}
            {ws === 'expiring_soon' && daysLeft !== null && (
                <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl text-xs">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                    <span className="text-amber-700 dark:text-amber-300 font-medium">
                        Warranty expires in {daysLeft} day{daysLeft !== 1 ? 's' : ''}
                    </span>
                    <span className="text-amber-500 dark:text-amber-400">
                        — renew before {format(new Date(appliance.warrantyExpiry!), 'dd MMM')}
                    </span>
                </div>
            )}
            {ws === 'active' && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl text-xs">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-emerald-700 dark:text-emerald-300">
                        Warranty valid till {format(new Date(appliance.warrantyExpiry!), 'dd MMM yyyy')}
                    </span>
                </div>
            )}
            {overCapacity && (
                <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/50 rounded-xl text-xs">
                    <Zap className="h-3.5 w-3.5 text-orange-500 flex-shrink-0" />
                    <span className="text-orange-700 dark:text-orange-300 font-medium">
                        Running at max capacity — {appliance.dailyUsageHours}h/{appliance.maxSafeHours}h max
                    </span>
                    <button
                        onClick={() => onService(appliance)}
                        className="ml-auto flex items-center gap-1 px-2 py-0.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium whitespace-nowrap"
                    >
                        <Wrench className="h-3 w-3" /> Service
                    </button>
                </div>
            )}
        </div>
    );
};

// ─── Main Page ─────────────────────────────────────────────────────
export const Appliances: React.FC = () => {
    const { canDo, plan } = usePlan();
    const [appliances, setAppliances] = useState<Appliance[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [serviceTarget, setServiceTarget] = useState<Appliance | null>(null);
    const [upgradeModal, setUpgradeModal] = useState<{
        open: boolean;
        requiredPlan: 'basic' | 'premium';
        message: string;
    }>({ open: false, requiredPlan: 'basic', message: '' });

    // Form state
    const [name, setName] = useState('');
    const [type, setType] = useState('Other');
    const [wattage, setWattage] = useState('');
    const [hours, setHours] = useState('');
    const [maxHours, setMaxHours] = useState('');
    const [purchaseDate, setPurchaseDate] = useState('');
    const [warrantyExpiry, setWarrantyExpiry] = useState('');

    useEffect(() => { fetchAppliances(); }, []);

    const fetchAppliances = async () => {
        try {
            const res = await axios.get('http://localhost:5001/api/usage/appliances');
            setAppliances(res.data);
        } catch (e) { console.error('Fetch appliances', e); }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await axios.post('http://localhost:5001/api/usage/appliances', {
                name,
                type,
                wattage: Number(wattage),
                dailyUsageHours: Number(hours),
                maxSafeHours: maxHours ? Number(maxHours) : undefined,
                purchaseDate: purchaseDate || undefined,
                warrantyExpiry: warrantyExpiry || undefined,
                quantity: 1,
            });
            await fetchAppliances();
            setIsModalOpen(false);
            resetForm();
        } catch (e: any) {
            if (e?.response?.data?.requiresUpgrade) {
                setIsModalOpen(false);
                setUpgradeModal({
                    open: true,
                    requiredPlan: e.response.data.requiredPlan ?? 'basic',
                    message: e.response.data.message,
                });
            } else {
                console.error('Add appliance', e);
            }
        }
        finally { setIsLoading(false); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Remove this appliance?')) return;
        try {
            await axios.delete(`http://localhost:5001/api/usage/appliances/${id}`);
            setAppliances(prev => prev.filter(a => a._id !== id));
        } catch (e) { console.error('Delete appliance', e); }
    };

    const handleServiceSave = async (id: string, date: string, notes: string) => {
        try {
            // PATCH to update lastServiceDate and serviceNotes
            const res = await axios.patch(`http://localhost:5001/api/usage/appliances/${id}/service`, {
                lastServiceDate: date,
                serviceNotes: notes,
            });
            setAppliances(prev => prev.map(a => a._id === id ? { ...a, ...res.data } : a));
        } catch {
            // optimistic update if endpoint not yet wired
            setAppliances(prev => prev.map(a => a._id === id
                ? { ...a, lastServiceDate: date, serviceNotes: notes }
                : a
            ));
        } finally {
            setServiceTarget(null);
        }
    };

    const resetForm = () => {
        setName(''); setType('Other'); setWattage(''); setHours('');
        setMaxHours(''); setPurchaseDate(''); setWarrantyExpiry('');
    };

    const totalConsumption = appliances.reduce((a, c) => a + (c.wattage * c.dailyUsageHours) / 1000, 0);
    const expiredCount = appliances.filter(a => getWarrantyStatus(a) === 'expired').length;
    const overCapCount = appliances.filter(isRunningAtMaxCapacity).length;

    return (
        <div className="space-y-8 max-w-7xl mx-auto">

            {/* Header */}
            <div className="flex justify-between items-end border-b border-gray-200 dark:border-gray-800 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Appliances</h1>
                    <p className="mt-1 text-gray-500 dark:text-gray-400 text-sm">
                        Manage devices, track efficiency, and monitor warranties
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Free plan limit badge */}
                    {plan === 'free' && (
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                            appliances.length >= 3
                                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
                                : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'
                        }`}>
                            {appliances.length}/3 appliances
                        </span>
                    )}
                    <Button onClick={() => setIsModalOpen(true)} disabled={plan === 'free' && appliances.length >= 3}>
                        <Plus className="h-4 w-4 mr-2" /> Add Appliance
                    </Button>
                </div>
            </div>

            {/* Global Alerts */}
            <AnimatePresence>
                {(expiredCount > 0 || overCapCount > 0) && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3"
                    >
                        {expiredCount > 0 && (
                            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
                                <ShieldX className="h-5 w-5 text-red-600 flex-shrink-0" />
                                <p className="text-sm font-semibold text-red-900 dark:text-red-100">
                                    {expiredCount} appliance{expiredCount > 1 ? 's' : ''} with expired warranty —
                                    <span className="font-normal ml-1">consider renewing or servicing them</span>
                                </p>
                            </div>
                        )}
                        {overCapCount > 0 && (
                            <div className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl">
                                <Zap className="h-5 w-5 text-orange-600 flex-shrink-0" />
                                <p className="text-sm font-semibold text-orange-900 dark:text-orange-100">
                                    {overCapCount} appliance{overCapCount > 1 ? 's' : ''} running at max capacity —
                                    <span className="font-normal ml-1">service recommended to prevent damage</span>
                                </p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20">
                    <p className="text-blue-100 text-sm font-medium">Total Daily Load</p>
                    <div className="mt-2 text-3xl font-bold">{totalConsumption.toFixed(2)} kWh</div>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Appliances</p>
                    <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{appliances.length}</div>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Est. Monthly Bill</p>
                    <div className="mt-2 text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                        ₹{(totalConsumption * 30 * 7).toFixed(0)}
                    </div>
                </div>
            </div>

            {/* Monthly Breakdown Card */}
            {appliances.length > 0 && (
                <div className="relative">
                    {/* Lock overlay for free users */}
                    {!canDo('applianceBreakdown') && (
                        <div className="absolute inset-0 z-10 rounded-3xl backdrop-blur-[6px] bg-white/60 dark:bg-gray-900/60 flex flex-col items-center justify-center gap-3">
                            <div className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                                <Lock className="h-6 w-6 text-blue-500" />
                            </div>
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Basic Plan Feature</p>
                            <button
                                onClick={() => setUpgradeModal({ open: true, requiredPlan: 'basic', message: 'Upgrade to Basic to unlock the full appliance cost breakdown and see exactly how much each device costs per month.' })}
                                className="text-xs font-bold text-blue-600 dark:text-blue-400 underline underline-offset-2 hover:text-blue-700 transition"
                            >
                                Upgrade to Basic →
                            </button>
                        </div>
                    )}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Monthly Cost Breakdown</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">How each appliance contributes to your ₹{(totalConsumption * 30 * 7).toFixed(0)} monthly bill</p>
                            </div>
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl">
                                <BarChart2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                            {appliances
                                .sort((a, b) => (b.wattage * b.dailyUsageHours) - (a.wattage * a.dailyUsageHours))
                                .map((a, i) => {
                                    const monthlyKwh = (a.wattage * a.dailyUsageHours * 30) / 1000;
                                    const monthlyCost = monthlyKwh * 7;
                                    const totalMonthlyCost = totalConsumption * 30 * 7;
                                    const percentage = totalMonthlyCost > 0 ? (monthlyCost / totalMonthlyCost) * 100 : 0;

                                    return (
                                        <div key={a._id} className="relative group">
                                            <div className="flex justify-between items-center mb-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-400">
                                                        {i + 1}
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-bold text-gray-900 dark:text-white block">{a.name}</span>
                                                        <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">
                                                            {monthlyKwh.toFixed(1)} kWh · {a.type}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 block">₹{monthlyCost.toFixed(0)}</span>
                                                    <span className="text-[10px] font-bold text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">
                                                        {percentage.toFixed(1)}%
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${percentage}%` }}
                                                    transition={{ duration: 1, delay: 0.1 + i * 0.05 }}
                                                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Appliance Cards */}
            {appliances.length === 0 ? (
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-16 text-center">
                    <div className="mx-auto h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                        <Tv className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">No appliances yet</h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                        Add your devices to track consumption, warranties, and get service alerts.
                    </p>
                    <div className="mt-8">
                        <Button onClick={() => setIsModalOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" /> Add Appliance
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {appliances.map((a) => {
                            return (
                                <motion.div
                                    key={a._id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="group bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-lg transition-all relative"
                                >
                                    {/* Delete */}
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleDelete(a._id)}
                                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>

                                    {/* Name + icon */}
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                                            <Zap className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white">{a.name}</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{a.type} · {a.wattage}W</p>
                                        </div>
                                    </div>

                                    {/* Usage / Cost */}
                                    <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-1.5 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 dark:text-gray-400">Daily Usage</span>
                                            <span className={`font-medium ${isRunningAtMaxCapacity(a) ? 'text-orange-600 dark:text-orange-400' : 'text-gray-900 dark:text-white'}`}>
                                                {a.dailyUsageHours}h {a.maxSafeHours ? `/ ${a.maxSafeHours}h max` : ''}/day
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 dark:text-gray-400">Est. Daily Cost</span>
                                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                                ₹{(((a.wattage * a.dailyUsageHours) / 1000) * 7).toFixed(1)}
                                            </span>
                                        </div>
                                        {a.purchaseDate && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-500 dark:text-gray-400">Purchased</span>
                                                <span className="text-gray-900 dark:text-white text-xs">
                                                    {format(new Date(a.purchaseDate), 'dd MMM yyyy')}
                                                </span>
                                            </div>
                                        )}
                                        {a.lastServiceDate && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-500 dark:text-gray-400">Last Service</span>
                                                <span className="text-blue-600 dark:text-blue-400 text-xs">
                                                    {format(new Date(a.lastServiceDate), 'dd MMM yyyy')}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Alert banners + service button */}
                                    <AlertBanner appliance={a} onService={setServiceTarget} />

                                    {/* Service button (always visible) */}
                                    <button
                                        onClick={() => setServiceTarget(a)}
                                        className="mt-3 w-full flex items-center justify-center gap-2 h-9 rounded-xl border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
                                    >
                                        <Wrench className="h-3.5 w-3.5" /> Log Service
                                    </button>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}

            {/* Add Appliance Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg p-8 shadow-2xl relative border border-gray-200 dark:border-gray-700 my-8"
                    >
                        <button
                            onClick={() => { setIsModalOpen(false); resetForm(); }}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Add New Appliance</h2>

                        <form onSubmit={handleAdd} className="space-y-5">
                            {/* Name */}
                            <Input
                                label="Appliance Name"
                                placeholder="e.g. Air Conditioner"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                            />

                            {/* Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Appliance Type
                                </label>
                                <select
                                    value={type}
                                    onChange={e => setType(e.target.value)}
                                    className="w-full h-11 rounded-xl border-0 bg-gray-50 dark:bg-gray-800 px-4 text-sm text-gray-900 dark:text-white ring-1 ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    {STATES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>

                            {/* Wattage + Daily Hours */}
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Wattage (W)"
                                    type="number"
                                    placeholder="e.g. 1500"
                                    value={wattage}
                                    onChange={e => setWattage(e.target.value)}
                                    required
                                />
                                <Input
                                    label="Daily Usage (hrs)"
                                    type="number"
                                    step="0.5"
                                    max="24"
                                    placeholder="e.g. 8"
                                    value={hours}
                                    onChange={e => setHours(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Max Safe Hours */}
                            <Input
                                label="Max Safe Daily Hours (optional)"
                                type="number"
                                step="0.5"
                                max="24"
                                placeholder="e.g. 10 — alerts if usage exceeds this"
                                value={maxHours}
                                onChange={e => setMaxHours(e.target.value)}
                            />

                            {/* Warranty section */}
                            <div className="pt-1">
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                                    <ShieldCheck className="h-3.5 w-3.5" /> Warranty Details
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                            <CalendarDays className="h-3.5 w-3.5 inline mr-1" />
                                            Purchase Date
                                        </label>
                                        <input
                                            type="date"
                                            value={purchaseDate}
                                            onChange={e => setPurchaseDate(e.target.value)}
                                            max={format(new Date(), 'yyyy-MM-dd')}
                                            className="w-full h-11 rounded-xl border-0 bg-gray-50 dark:bg-gray-800 px-3 text-sm text-gray-900 dark:text-white ring-1 ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                            <Clock className="h-3.5 w-3.5 inline mr-1" />
                                            Warranty Expiry
                                        </label>
                                        <input
                                            type="date"
                                            value={warrantyExpiry}
                                            onChange={e => setWarrantyExpiry(e.target.value)}
                                            className="w-full h-11 rounded-xl border-0 bg-gray-50 dark:bg-gray-800 px-3 text-sm text-gray-900 dark:text-white ring-1 ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2">
                                <Button type="submit" className="w-full" isLoading={isLoading}>
                                    <Plus className="h-4 w-4 mr-2" /> Add Appliance
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Service Modal */}
            {serviceTarget && (
                <ServiceModal
                    appliance={serviceTarget}
                    onClose={() => setServiceTarget(null)}
                    onSave={handleServiceSave}
                />
            )}

            {/* Upgrade Prompt Modal */}
            <UpgradePromptModal
                isOpen={upgradeModal.open}
                onClose={() => setUpgradeModal(prev => ({ ...prev, open: false }))}
                requiredPlan={upgradeModal.requiredPlan}
                message={upgradeModal.message}
            />
        </div>
    );
};
