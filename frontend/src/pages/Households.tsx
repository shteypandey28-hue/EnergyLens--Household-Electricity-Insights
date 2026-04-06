import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Home, Plus, Star, Trash2, Edit3, MapPin, Zap, Check, Building2 } from 'lucide-react';
import axios from 'axios';

interface Household {
    _id: string;
    name: string;
    address?: string;
    state: string;
    tariffType: string;
    isDefault: boolean;
    connectedLoad?: number;
    sanctionedLoad?: number;
    meterNumber?: string;
}

const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa',
    'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
    'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
    'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

const TARIFF_RATES: Record<string, number> = {
    'Andhra Pradesh': 5.70, 'Arunachal Pradesh': 4.50, 'Assam': 6.90, 'Bihar': 5.48,
    'Chhattisgarh': 5.50, 'Delhi': 4.50, 'Goa': 3.50, 'Gujarat': 4.85,
    'Haryana': 6.30, 'Himachal Pradesh': 3.75, 'Jharkhand': 5.20, 'Karnataka': 7.00,
    'Kerala': 5.80, 'Madhya Pradesh': 5.55, 'Maharashtra': 7.34, 'Manipur': 5.50,
    'Meghalaya': 5.75, 'Mizoram': 5.00, 'Nagaland': 5.20, 'Odisha': 4.50,
    'Punjab': 5.25, 'Rajasthan': 5.50, 'Sikkim': 4.00, 'Tamil Nadu': 2.25,
    'Telangana': 5.70, 'Tripura': 4.50, 'Uttar Pradesh': 6.00, 'Uttarakhand': 4.35,
    'West Bengal': 6.27,
};

const TARIFF_TYPES = ['Residential', 'Commercial', 'Industrial', 'Agricultural'];

const emptyForm = { name: '', address: '', state: 'Delhi', tariffType: 'Residential', connectedLoad: 5, meterNumber: '' };

export const Households: React.FC = () => {
    const [households, setHouseholds] = useState<Household[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    const fetchHouseholds = async () => {
        setIsFetching(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5001"}/api/households`);
            setHouseholds(res.data);
        } catch {
            // Show demo fallback
            setHouseholds([]);
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => { fetchHouseholds(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (editId) {
                const res = await axios.put(`${import.meta.env.VITE_API_URL || "http://localhost:5001"}/api/households/${editId}`, form);
                setHouseholds(prev => prev.map(h => h._id === editId ? res.data : h));
            } else {
                const res = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5001"}/api/households`, form);
                setHouseholds(prev => [...prev, res.data]);
            }
            setShowForm(false);
            setEditId(null);
            setForm(emptyForm);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to save household');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSetActive = async (id: string) => {
        try {
            await axios.put(`${import.meta.env.VITE_API_URL || "http://localhost:5001"}/api/households/${id}/activate`);
            setHouseholds(prev => prev.map(h => ({ ...h, isDefault: h._id === id })));
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to set active household');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this household?')) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL || "http://localhost:5001"}/api/households/${id}`);
            setHouseholds(prev => prev.filter(h => h._id !== id));
        } catch (err: any) {
            alert(err.response?.data?.message || 'Cannot delete');
        }
    };

    const startEdit = (h: Household) => {
        setForm({ name: h.name, address: h.address || '', state: h.state, tariffType: h.tariffType, connectedLoad: h.connectedLoad || 5, meterNumber: h.meterNumber || '' });
        setEditId(h._id);
        setShowForm(true);
    };

    const inputCls = "w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-dark-border bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
    const labelCls = "block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1";

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Building2 className="h-6 w-6 text-blue-600" />
                        Households
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Manage your connected properties and energy accounts
                    </p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-blue-500/25 transition-all"
                >
                    <Plus className="h-4 w-4" />
                    Add Household
                </motion.button>
            </div>

            {/* Add/Edit Form */}
            {showForm && (
                <motion.div
                    initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-dark-card rounded-2xl border-2 border-blue-200 dark:border-blue-800 p-6 shadow-lg"
                >
                    <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                        {editId ? 'Edit Household' : 'Add New Household'}
                    </h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Household Name *</label>
                            <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                className={inputCls} placeholder="My Home, Office, Parents' House..." />
                        </div>
                        <div>
                            <label className={labelCls}>Address</label>
                            <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                                className={inputCls} placeholder="Full address" />
                        </div>
                        <div>
                            <label className={labelCls}>State *</label>
                            <select required value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} className={inputCls}>
                                {INDIAN_STATES.map(s => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>Tariff Type</label>
                            <select value={form.tariffType} onChange={e => setForm({ ...form, tariffType: e.target.value })} className={inputCls}>
                                {TARIFF_TYPES.map(t => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>Connected Load (kW)</label>
                            <input type="number" min={0.5} max={100} step={0.5}
                                value={form.connectedLoad} onChange={e => setForm({ ...form, connectedLoad: Number(e.target.value) })}
                                className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Meter Number</label>
                            <input value={form.meterNumber} onChange={e => setForm({ ...form, meterNumber: e.target.value })}
                                className={inputCls} placeholder="e.g. DL-045-1234567" />
                        </div>

                        {/* Tariff preview */}
                        {form.state && (
                            <div className="md:col-span-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                                <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                                    ⚡ {form.state} tariff: avg ₹{TARIFF_RATES[form.state] || 5.0}/kWh — estimated bill for 200 units: ₹{Math.round((TARIFF_RATES[form.state] || 5.0) * 200)}
                                </p>
                            </div>
                        )}

                        <div className="md:col-span-2 flex justify-end gap-3">
                            <button type="button" onClick={() => { setShowForm(false); setEditId(null); }}
                                className="px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all">
                                Cancel
                            </button>
                            <button type="submit" disabled={isLoading}
                                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-md disabled:opacity-60 transition-all">
                                {isLoading ? 'Saving...' : editId ? 'Save Changes' : 'Add Household'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}

            {/* Loading */}
            {isFetching ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2].map(i => <div key={i} className="h-44 skeleton rounded-2xl" />)}
                </div>
            ) : households.length === 0 ? (
                /* Empty state */
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-20 text-center"
                >
                    <div className="h-20 w-20 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-5 border border-blue-100 dark:border-blue-800">
                        <Home className="h-10 w-10 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Households Yet</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mb-6">
                        Add your home, office, or any property to track and compare their energy usage.
                    </p>
                    <button onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl text-sm hover:bg-blue-700 transition-all shadow-md shadow-blue-500/25">
                        <Plus className="h-4 w-4" />
                        Add Your First Household
                    </button>
                </motion.div>
            ) : (
                /* Household Cards */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {households.map((h, i) => {
                        const rate = TARIFF_RATES[h.state] || 5.0;
                        return (
                            <motion.div
                                key={h._id}
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.07 }}
                                className={`relative bg-white dark:bg-dark-card rounded-2xl border-2 p-5 shadow-sm transition-all hover:shadow-md ${h.isDefault ? 'border-blue-400 dark:border-blue-600' : 'border-slate-200 dark:border-dark-border'
                                    }`}
                            >
                                {h.isDefault && (
                                    <div className="absolute top-3 right-3">
                                        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-blue-600 text-white rounded-full">
                                            <Check className="h-2.5 w-2.5" /> ACTIVE
                                        </span>
                                    </div>
                                )}

                                <div className="flex items-start gap-3 mb-4">
                                    <div className={`p-2.5 rounded-xl ${h.isDefault ? 'bg-blue-100 dark:bg-blue-900/40' : 'bg-slate-100 dark:bg-slate-800'}`}>
                                        <Home className={`h-5 w-5 ${h.isDefault ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight">{h.name}</h3>
                                        {h.address && (
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                                                <MapPin className="h-3 w-3 flex-shrink-0" />{h.address}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Info grid */}
                                <div className="grid grid-cols-2 gap-2.5 mb-4">
                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2.5">
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">State</p>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{h.state}</p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2.5">
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Tariff</p>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{h.tariffType}</p>
                                    </div>
                                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-2.5">
                                        <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">Rate/kWh</p>
                                        <p className="text-sm font-bold text-blue-700 dark:text-blue-300 mt-0.5">₹{rate}</p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2.5">
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Load</p>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{h.connectedLoad || '—'} kW</p>
                                    </div>
                                </div>

                                {h.meterNumber && (
                                    <div className="flex items-center gap-1.5 mb-3">
                                        <Zap className="h-3 w-3 text-slate-400" />
                                        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{h.meterNumber}</span>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                                    {!h.isDefault && (
                                        <button onClick={() => handleSetActive(h._id)}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all">
                                            <Star className="h-3.5 w-3.5" />
                                            Set Active
                                        </button>
                                    )}
                                    <button onClick={() => startEdit(h)}
                                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all">
                                        <Edit3 className="h-3.5 w-3.5" />
                                        Edit
                                    </button>
                                    {!h.isDefault && (
                                        <button onClick={() => handleDelete(h._id)}
                                            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all">
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Info footer */}
            <div className="flex items-start gap-2.5 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded-xl">
                <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 dark:text-amber-300">
                    Each household uses state-wise DISCOM slab tariffs for accurate bill estimation.
                    Setting a household as <strong>Active</strong> applies its state tariff to your dashboard calculations.
                </p>
            </div>
        </div>
    );
};
