import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Check, Crown, Zap, Sparkles, Star, Shield, BarChart3, Bell, FileDown, Home } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface PlanFeature {
    label: string;
    free: boolean | string;
    basic: boolean | string;
    premium: boolean | string;
}

const features: PlanFeature[] = [
    { label: 'Manual reading entry', free: true, basic: true, premium: true },
    { label: 'Basic dashboard', free: true, basic: true, premium: true },
    { label: 'CSV data upload', free: true, basic: true, premium: true },
    { label: 'Appliance tracking', free: '3 appliances', basic: '10 appliances', premium: 'Unlimited' },
    { label: 'Consumption charts', free: '7 days', basic: '6 months', premium: '5 years' },
    { label: 'Advanced analytics', free: false, basic: true, premium: true },
    { label: 'AI-powered forecasting', free: false, basic: false, premium: true },
    { label: 'Multi-household support', free: false, basic: false, premium: true },
    { label: 'Smart alerts & notifications', free: false, basic: '5 per month', premium: 'Unlimited' },
    { label: 'PDF report downloads', free: false, basic: false, premium: true },
    { label: 'Bill spike alerts', free: false, basic: true, premium: true },
    { label: 'Appliance anomaly detection', free: false, basic: false, premium: true },
    { label: 'Energy efficiency score', free: false, basic: true, premium: true },
    { label: 'Savings recommendations', free: false, basic: true, premium: true },
    { label: 'Priority support', free: false, basic: false, premium: true },
];

const FeatureValue: React.FC<{ value: boolean | string }> = ({ value }) => {
    if (value === true) return <Check className="h-4 w-4 text-emerald-500 mx-auto" />;
    if (value === false) return <span className="text-slate-300 dark:text-slate-600 text-lg mx-auto block text-center">—</span>;
    return <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 text-center block">{value}</span>;
};

export const Upgrade: React.FC = () => {
    const { user, updateProfile } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const [success, setSuccess] = useState('');
    const [activeTab, setActiveTab] = useState<'cards' | 'table'>('cards');

    const handleUpgrade = async (plan: 'basic' | 'pro') => {
        setIsLoading(plan);
        try {
            const res = await axios.post('http://localhost:5001/api/subscription/subscribe', { plan });
            setSuccess(res.data.message);
            // Refresh user state after 1.5s
            setTimeout(() => { window.location.reload(); }, 1500);
        } catch (err: any) {
            // Fallback: demo mode
            setSuccess(`Upgraded to ${plan} plan! (demo mode)`);
            setTimeout(() => window.location.reload(), 1500);
        } finally {
            setIsLoading(null);
        }
    };

    const isPremium = user?.role === 'premium' || user?.role === 'admin';

    if (isPremium) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', duration: 0.6 }}
                    className="h-20 w-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mb-5 shadow-2xl shadow-amber-500/30">
                    <Crown className="h-10 w-10 text-white" />
                </motion.div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">You're on Premium!</h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-md">
                    Enjoy unlimited access to all advanced features including AI forecasting, multi-household, and PDF reports.
                </p>
                <button onClick={() => navigate('/dashboard')} className="mt-6 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all">
                    Go to Dashboard
                </button>
            </div>
        );
    }

    const plans = [
        {
            id: 'free', name: 'Free', price: 0, period: 'forever',
            description: 'Get started with essentials',
            icon: Sparkles, iconBg: 'bg-slate-100 dark:bg-slate-800', iconColor: 'text-slate-600 dark:text-slate-400',
            border: 'border-slate-200 dark:border-dark-border',
            highlights: ['Manual readings', 'Basic dashboard', 'CSV upload'],
            isCurrent: user?.role === 'free' || !user?.role,
            buttonText: 'Current Plan',
            ctaClass: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-not-allowed',
        },
        {
            id: 'basic', name: 'Basic', price: 49, period: '/month',
            description: 'Advanced analytics for power users',
            icon: Zap, iconBg: 'bg-blue-100 dark:bg-blue-900/40', iconColor: 'text-blue-600 dark:text-blue-400',
            border: 'border-blue-200 dark:border-blue-700',
            highlights: ['6-month history', 'Advanced analytics', 'Bill spike alerts', 'Efficiency score'],
            isCurrent: false,
            buttonText: 'Upgrade to Basic',
            ctaClass: 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25',
        },
        {
            id: 'pro', name: 'Premium', price: 99, period: '/month',
            description: 'Complete power with AI insights',
            icon: Crown, iconBg: 'bg-amber-100 dark:bg-amber-900/40', iconColor: 'text-amber-600 dark:text-amber-400',
            border: 'border-amber-300 dark:border-amber-700',
            popular: true,
            highlights: ['AI forecasting', 'Multi-household', 'PDF reports', 'Anomaly detection', 'Priority support'],
            isCurrent: false,
            buttonText: 'Upgrade to Premium',
            ctaClass: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md shadow-amber-500/25',
        },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-8 py-4">
            {/* Header */}
            <div className="text-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-full mb-4">
                    <Star className="h-3 w-3" /> Plans & Pricing
                </span>
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">
                    Unlock the Full Power of EnergyLens
                </h1>
                <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
                    Choose a plan that fits your energy monitoring needs. Upgrade anytime, cancel anytime.
                </p>
            </div>

            {success && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-300 text-sm font-semibold text-center">
                    ✅ {success}
                </motion.div>
            )}

            {/* View toggle */}
            <div className="flex justify-center">
                <div className="inline-flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 gap-1">
                    {(['cards', 'table'] as const).map(t => (
                        <button key={t} onClick={() => setActiveTab(t)}
                            className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${activeTab === t ? 'bg-white dark:bg-dark-card text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>
                            {t === 'cards' ? 'Pricing Cards' : 'Feature Comparison'}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === 'cards' ? (
                /* Plan Cards */
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((plan, i) => (
                        <motion.div key={plan.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`relative bg-white dark:bg-dark-card rounded-2xl border-2 ${plan.border} p-6 flex flex-col ${plan.popular ? 'shadow-xl' : 'shadow-sm'}`}>
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md">
                                        ⭐ MOST POPULAR
                                    </span>
                                </div>
                            )}
                            <div className={`w-10 h-10 rounded-xl ${plan.iconBg} flex items-center justify-center mb-4`}>
                                <plan.icon className={`h-5 w-5 ${plan.iconColor}`} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 mt-1">{plan.description}</p>
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-4xl font-black text-slate-900 dark:text-white">
                                    {plan.price === 0 ? '₹0' : `₹${plan.price}`}
                                </span>
                                <span className="text-sm text-slate-500 dark:text-slate-400">{plan.period}</span>
                            </div>
                            <ul className="space-y-2.5 mb-6 flex-1">
                                {plan.highlights.map(h => (
                                    <li key={h} className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                                        <div className="h-4 w-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                                            <Check className="h-2.5 w-2.5 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        {h}
                                    </li>
                                ))}
                            </ul>
                            <button
                                disabled={plan.isCurrent || isLoading !== null}
                                onClick={() => !plan.isCurrent && plan.id !== 'free' && handleUpgrade(plan.id as 'basic' | 'pro')}
                                className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all ${plan.ctaClass} disabled:opacity-60`}
                            >
                                {isLoading === plan.id ? 'Processing...' : plan.buttonText}
                            </button>
                        </motion.div>
                    ))}
                </div>
            ) : (
                /* Feature Comparison Table */
                <div className="bg-white dark:bg-dark-card rounded-2xl border border-slate-200 dark:border-dark-border shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-dark-border">
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Feature</th>
                                    {['Free', 'Basic', 'Premium'].map(p => (
                                        <th key={p} className="px-4 py-4 text-center text-sm font-bold text-slate-900 dark:text-white w-32">{p}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {features.map((f, i) => (
                                    <tr key={f.label} className={`border-b border-slate-100 dark:border-slate-800 ${i % 2 === 0 ? '' : 'bg-slate-50/50 dark:bg-slate-800/20'}`}>
                                        <td className="px-6 py-3 text-sm text-slate-700 dark:text-slate-300">{f.label}</td>
                                        <td className="px-4 py-3"><FeatureValue value={f.free} /></td>
                                        <td className="px-4 py-3"><FeatureValue value={f.basic} /></td>
                                        <td className="px-4 py-3"><FeatureValue value={f.premium} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Trust badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { icon: Shield, label: 'Secure Payments', sub: 'UPI / Card / NetBanking' },
                    { icon: StarIcon, label: 'Cancel Anytime', sub: 'No lock-in contracts' },
                    { icon: BarChart3, label: 'Instant Activation', sub: 'Access in seconds' },
                    { icon: Bell, label: 'Priority Support', sub: 'Premium plan only' },
                ].map(({ icon: Icon, label, sub }, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-dark-border">
                        <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        <div>
                            <p className="text-xs font-semibold text-slate-900 dark:text-white">{label}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{sub}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Workaround for inline icon use
const StarIcon: React.FC<{ className?: string }> = ({ className }) => <Star className={className} />;
