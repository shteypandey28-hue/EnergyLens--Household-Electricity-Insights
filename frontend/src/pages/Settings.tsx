import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import {
    User, Moon, Sun, Monitor, Save, Bell, Shield, Crown,
    ChevronDown
} from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import axios from 'axios';
import { format } from 'date-fns';

const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
    'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand',
    'West Bengal',
];

const TARIFF_TYPES = ['Residential', 'Commercial', 'Industrial', 'Agricultural'];

interface SectionProps { title: string; icon: React.ComponentType<{ className?: string }>; iconBg: string; iconColor: string; children: React.ReactNode; delay?: number; }

const Section: React.FC<SectionProps> = ({ title, icon: Icon, iconBg, iconColor, children, delay = 0 }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
        className="premium-card rounded-3xl p-6 transition-all">
        <div className="flex items-center gap-3 mb-5">
            <div className={`p-2.5 rounded-xl ${iconBg}`}><Icon className={`h-5 w-5 ${iconColor}`} /></div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">{title}</h2>
        </div>
        {children}
    </motion.div>
);

export const Settings: React.FC = () => {
    const { user, updateProfile } = useAuth();
    const { theme, setTheme } = useTheme();
    const navigate = useNavigate();

    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [state, setState] = useState(user?.state || 'Delhi');
    const [tariffType, setTariffType] = useState(user?.tariffType || 'Residential');
    const [monthlyBudget, setMonthlyBudget] = useState<number>(user?.monthlyBudget || 2000);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [notifEmail, setNotifEmail] = useState(true);
    const [notifBudget, setNotifBudget] = useState(true);
    const [notifPeak, setNotifPeak] = useState(true);
    const [notifAnomaly, setNotifAnomaly] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isChangingPwd, setIsChangingPwd] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [isManagingSubscription, setIsManagingSubscription] = useState(false);
    const [subscriptionStatus, setSubscriptionStatus] = useState<{
        plan: string;
        subscriptionExpires: string | null;
        autoRenew: boolean;
        isActive: boolean;
    } | null>(null);
    const [isTogglingAutoRenew, setIsTogglingAutoRenew] = useState(false);
    const [isLoadingStatus, setIsLoadingStatus] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setPhone(user.phone || '');
            setState(user.state || 'Delhi');
            setTariffType((user as any).tariffType || 'Residential');
            setMonthlyBudget((user as any).monthlyBudget || 2000);
        }
    }, [user]);

    const fetchSubscriptionStatus = async () => {
        setIsLoadingStatus(true);
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get('http://localhost:5001/api/subscription/status', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSubscriptionStatus(data);
        } catch (err) {
            console.error('Failed to fetch subscription status:', err);
        } finally {
            setIsLoadingStatus(false);
        }
    };

    const handleToggleAutoRenew = async () => {
        setIsTogglingAutoRenew(true);
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.patch('http://localhost:5001/api/subscription/toggle-auto-renew', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSubscriptionStatus(prev => prev ? { ...prev, autoRenew: data.autoRenew } : null);
            showMsg(data.message, 'success');
        } catch (err) {
            showMsg('Failed to update renewal status', 'error');
        } finally {
            setIsTogglingAutoRenew(false);
        }
    };

    const showMsg = (text: string, type: 'success' | 'error') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 3500);
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updateProfile({ name, state, tariffType, phone, monthlyBudget, notificationPreferences: { email: notifEmail, budgetAlert: notifBudget, peakHourAlert: notifPeak, anomalyAlert: notifAnomaly } });
            showMsg('Profile updated successfully!', 'success');
        } catch {
            showMsg('Failed to update profile', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsChangingPwd(true);
        try {
            await axios.put('http://localhost:5001/api/auth/change-password', { currentPassword, newPassword });
            showMsg('Password changed successfully!', 'success');
            setCurrentPassword(''); setNewPassword('');
        } catch (err: any) {
            showMsg(err.response?.data?.message || 'Failed to change password', 'error');
        } finally {
            setIsChangingPwd(false);
        }
    };

    const inputCls = "w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-dark-border bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";
    const labelCls = "block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5";

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your account, preferences, and subscription</p>
            </div>

            {message.text && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl text-sm font-semibold ${message.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'}`}>
                    {message.text}
                </motion.div>
            )}

            {/* Profile */}
            <Section title="Profile Settings" icon={User} iconBg="bg-blue-100 dark:bg-blue-900/30" iconColor="text-blue-600 dark:text-blue-400">
                <div className="mb-8 flex flex-col items-center sm:flex-row sm:items-end gap-6">
                    <div className="relative group">
                        <div className="h-20 w-20 rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-dark-border bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-inner">
                            {user?.profilePicture ? (
                                <img 
                                    src={user.profilePicture.startsWith('http') ? user.profilePicture : `http://localhost:5001${user.profilePicture}`} 
                                    alt="Profile" 
                                    className="h-full w-full object-cover" 
                                />
                            ) : (
                                <User className="h-8 w-8 text-slate-400" />
                            )}
                        </div>
                        <label className="absolute -bottom-2 -right-2 p-2 bg-blue-600 rounded-xl text-white shadow-lg cursor-pointer hover:bg-blue-700 transition-all active:scale-95 group-hover:scale-110">
                            <Save className="h-4 w-4" />
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    
                                    const formData = new FormData();
                                    formData.append('image', file);
                                    
                                    try {
                                        setIsSaving(true);
                                        const token = localStorage.getItem('token');
                                        const res = await axios.post('http://localhost:5001/api/auth/profile-picture', formData, {
                                            headers: { 
                                                'Content-Type': 'multipart/form-data',
                                                Authorization: `Bearer ${token}`
                                            }
                                        });
                                        await updateProfile(res.data); // Update local context
                                        showMsg('Photo updated successfully!', 'success');
                                    } catch (err) {
                                        showMsg('Failed to upload photo', 'error');
                                    } finally {
                                        setIsSaving(false);
                                    }
                                }}
                            />
                        </label>
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Profile Photo</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Click the blue icon to upload a new one. <br className="hidden sm:block" />
                            Supports JPG, PNG or WebP. Max 5MB.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelCls}>Full Name</label>
                        <input value={name} onChange={e => setName(e.target.value)} className={inputCls} placeholder="Your name" />
                    </div>
                    <div>
                        <label className={labelCls}>Phone (optional)</label>
                        <input value={phone} onChange={e => setPhone(e.target.value)} className={inputCls} placeholder="+91 98765 43210" />
                    </div>
                    <div>
                        <label className={labelCls}>State</label>
                        <div className="relative">
                            <select value={state} onChange={e => setState(e.target.value)} className={`${inputCls} appearance-none pr-10`}>
                                {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                    <div>
                        <label className={labelCls}>Tariff Type</label>
                        <div className="relative">
                            <select value={tariffType} onChange={e => setTariffType(e.target.value)} className={`${inputCls} appearance-none pr-10`}>
                                {TARIFF_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <label className={labelCls}>Monthly Budget (₹)</label>
                        <input type="number" min={0} value={monthlyBudget} onChange={e => setMonthlyBudget(Number(e.target.value))} className={inputCls} placeholder="2000" />
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Used for budget tracking on your dashboard.</p>
                    </div>
                    <div className="md:col-span-2 flex items-center justify-between">
                        <button type="submit" disabled={isSaving} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm disabled:opacity-60 shadow-md shadow-blue-500/25 transition-all">
                            <Save className="h-4 w-4" />
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </Section>

            {/* Password */}
            <Section title="Change Password" icon={Shield} iconBg="bg-slate-100 dark:bg-slate-800" iconColor="text-slate-600 dark:text-slate-400" delay={0.05}>
                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                    <div>
                        <label className={labelCls}>Current Password</label>
                        <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required className={inputCls} placeholder="••••••••" />
                    </div>
                    <div>
                        <label className={labelCls}>New Password</label>
                        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} className={inputCls} placeholder="Min. 6 characters" />
                    </div>
                    <button type="submit" disabled={isChangingPwd} className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white font-semibold rounded-xl text-sm disabled:opacity-60 transition-all">
                        <Shield className="h-4 w-4" />
                        {isChangingPwd ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            </Section>

            {/* Notifications */}
            <Section title="Notification Preferences" icon={Bell} iconBg="bg-amber-100 dark:bg-amber-900/30" iconColor="text-amber-600 dark:text-amber-400" delay={0.1}>
                <div className="space-y-4">
                    {[
                        { label: 'Email notifications', sub: 'Receive weekly reports and alerts via email', value: notifEmail, set: setNotifEmail },
                        { label: 'Budget alerts', sub: 'Notify when approaching or exceeding monthly budget', value: notifBudget, set: setNotifBudget },
                        { label: 'Peak hour alerts', sub: 'Warning when high usage is detected in peak hours', value: notifPeak, set: setNotifPeak },
                        { label: 'Anomaly detection', sub: 'Alert on unusual appliance consumption patterns', value: notifAnomaly, set: setNotifAnomaly },
                    ].map(({ label, sub, value, set }) => (
                        <div key={label} className="flex items-center justify-between py-2">
                            <div>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">{label}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{sub}</p>
                            </div>
                            <button onClick={() => set(!value)}
                                className={clsx('relative w-11 h-6 rounded-full transition-all flex-shrink-0', value ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600')}>
                                <div className={clsx('absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all', value ? 'left-5.5' : 'left-0.5')} style={value ? { left: '1.375rem' } : {}} />
                            </button>
                        </div>
                    ))}
                    <button onClick={handleUpdateProfile} className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-sm">
                        Save Preferences
                    </button>
                </div>
            </Section>

            {/* Appearance */}
            <Section title="Appearance" icon={Monitor} iconBg="bg-purple-100 dark:bg-purple-900/30" iconColor="text-purple-600 dark:text-purple-400" delay={0.15}>
                <div className="flex flex-wrap gap-3">
                    {([['light', Sun, 'Light Mode'], ['dark', Moon, 'Dark Mode'], ['system', Monitor, 'System']] as const).map(([t, Icon, label]) => (
                        <button key={t} onClick={() => setTheme(t as any)}
                            className={clsx('flex items-center gap-2.5 px-5 py-3 rounded-xl border-2 font-medium text-sm transition-all',
                                theme === t ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                    : 'border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600')}>
                            <Icon className="h-4 w-4" />{label}
                        </button>
                    ))}
                </div>
            </Section>

            {/* Subscription */}
            <Section title="Subscription & Plan" icon={Crown} iconBg="bg-amber-100 dark:bg-amber-900/30" iconColor="text-amber-600 dark:text-amber-400" delay={0.2}>
                <div className="space-y-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                Current Plan: <span className="text-blue-600 dark:text-blue-400 capitalize">{user?.role || 'Free'}</span>
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {user?.role === 'premium' ? 'Full access to all features' : 'Upgrade for advanced analytics, forecasting, and more'}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            {user?.role === 'premium' && (
                                <button
                                    onClick={() => {
                                        if (!isManagingSubscription) fetchSubscriptionStatus();
                                        setIsManagingSubscription(!isManagingSubscription);
                                    }}
                                    className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700"
                                >
                                    Manage Subscription
                                </button>
                            )}
                            {user?.role !== 'premium' && (
                                <button onClick={() => navigate('/upgrade')} className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl text-sm hover:from-amber-600 hover:to-orange-600 transition-all shadow-md shadow-amber-500/25">
                                    Upgrade to Premium
                                </button>
                            )}
                        </div>
                    </div>

                    {isManagingSubscription && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="pt-4 border-t border-slate-100 dark:border-dark-border space-y-4"
                        >
                            {isLoadingStatus ? (
                                <div className="flex justify-center py-4">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white">Plan Validity</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {subscriptionStatus?.subscriptionExpires 
                                                    ? `Valid till ${format(new Date(subscriptionStatus.subscriptionExpires), 'dd MMM yyyy')}`
                                                    : 'No expiry information available'}
                                            </p>
                                        </div>
                                        <div className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                                            Active
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-2">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white">Auto-Pay Renewal</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Automatically renew your plan when it expires</p>
                                        </div>
                                        <button 
                                            onClick={handleToggleAutoRenew}
                                            disabled={isTogglingAutoRenew}
                                            className={clsx(
                                                'relative w-11 h-6 rounded-full transition-all flex-shrink-0 disabled:opacity-50',
                                                subscriptionStatus?.autoRenew ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
                                            )}
                                        >
                                            <div className={clsx(
                                                'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all',
                                                subscriptionStatus?.autoRenew ? 'left-5.5' : 'left-0.5'
                                            )} style={subscriptionStatus?.autoRenew ? { left: '1.375rem' } : {}} />
                                        </button>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    )}
                </div>
            </Section>
        </div>
    );
};
