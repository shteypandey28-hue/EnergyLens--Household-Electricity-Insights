import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, ArrowLeft, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

export const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [resetToken, setResetToken] = useState(''); // Demo only
    const { theme } = useTheme();
    const navigate = useNavigate();

    const isDark = theme === 'dark';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5001"}/api/auth/forgot-password`, { email });
            setMessage(res.data.message);
            // Demo: show reset link directly
            if (res.data.resetToken) {
                setResetToken(res.data.resetToken);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to send reset email');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`flex min-h-screen flex-col justify-center items-center py-12 px-6 ${isDark ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'} relative overflow-hidden transition-colors duration-500`}>
            {/* Dynamic Mesh Background */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                {/* Subtle Dot Grid */}
                <div 
                    className="absolute inset-0" 
                    style={{ 
                        backgroundImage: `radial-gradient(${isDark ? '#10b981' : '#059669'} 0.5px, transparent 0.5px)`, 
                        backgroundSize: '24px 24px',
                        opacity: isDark ? 0.15 : 0.12
                    }}
                ></div>

                {/* Moving Mesh Gradients */}
                <motion.div
                    animate={{ 
                        x: [0, 100, 0],
                        y: [0, 50, 0],
                        scale: [1, 1.2, 1]
                    }}
                    transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
                    className={`absolute top-[-20%] left-[-10%] w-[60%] h-[60%] ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-300/15'} rounded-full blur-[120px]`}
                />
                <motion.div
                    animate={{ 
                        x: [0, -100, 0],
                        y: [0, -50, 0],
                        scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
                    className={`absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] ${isDark ? 'bg-blue-500/10' : 'bg-blue-300/15'} rounded-full blur-[120px]`}
                />
                <motion.div
                    animate={{ 
                        opacity: isDark ? [0.02, 0.05, 0.02] : [0.03, 0.08, 0.03],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full ${isDark ? 'bg-emerald-500/5' : 'bg-emerald-400/5'} blur-[160px]`}
                />
            </div>

            {/* Animated Electricity Line Background */}
            <div className={`absolute inset-0 z-0 pointer-events-none ${isDark ? 'opacity-[0.2]' : 'opacity-[0.12]'}`}>
                <svg className="w-full h-full" preserveAspectRatio="none">
                    <defs>
                        <filter id="glow-forgot">
                            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                    <motion.path
                        d="M 50% 0 Q 60% 25%, 50% 50% T 50% 100%"
                        stroke={isDark ? "#10b981" : "#059669"}
                        strokeWidth="1.5"
                        fill="none"
                        className="opacity-20"
                    />
                    <motion.path
                        d="M 50% 0 Q 60% 25%, 50% 50% T 50% 100%"
                        stroke={isDark ? "#10b981" : "#059669"}
                        strokeWidth="2.5"
                        fill="none"
                        filter="url(#glow-forgot)"
                        initial={{ pathLength: 0.1, pathOffset: 0 }}
                        animate={{ pathOffset: [0, 1] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.path
                        d="M 50% 0 Q 40% 25%, 50% 50% T 50% 100%"
                        stroke="#3b82f6"
                        strokeWidth="1"
                        fill="none"
                        className="opacity-20"
                    />
                    <motion.path
                        d="M 50% 0 Q 40% 25%, 50% 50% T 50% 100%"
                        stroke="#3b82f6"
                        strokeWidth="2"
                        fill="none"
                        filter="url(#glow-forgot)"
                        initial={{ pathLength: 0.05, pathOffset: 0 }}
                        animate={{ pathOffset: [0, 1] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: 1 }}
                    />
                </svg>
            </div>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-[400px] relative z-10 px-4"
            >
                <div className={`backdrop-blur-3xl py-10 px-7 shadow-2xl rounded-[32px] border ${isDark ? 'bg-slate-900/40 border-white/10' : 'bg-white/85 border-slate-200 shadow-slate-200/50'} overflow-hidden group transition-all duration-500`}>
                    {/* Inner Glow Effect */}
                    <div className={`absolute -top-24 -right-24 w-64 h-64 ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-400/5'} rounded-full blur-[100px] group-hover:scale-125 transition-transform duration-700`}></div>
                    <div className="relative z-10 text-center mb-10">
                        <div className="flex justify-center mb-6">
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                className={`h-16 w-16 ${isDark ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-emerald-600 shadow-emerald-600/10'} rounded-2xl flex items-center justify-center shadow-xl`}
                            >
                                <Zap className={`h-8 w-8 ${isDark ? 'text-slate-950' : 'text-white'}`} />
                            </motion.div>
                        </div>
                        <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight mb-2 uppercase`}>
                            Forgot Password
                        </h2>
                        <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} font-medium tracking-tight text-sm px-4`}>
                            Enter your email and we'll send you a reset link.
                        </p>
                    </div>

                    {message ? (
                        <div className="space-y-4 relative z-10">
                            <div className={`flex items-start gap-3 p-4 ${isDark ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100'} rounded-xl border`}>
                                <Mail className={`h-5 w-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'} flex-shrink-0 mt-0.5`} />
                                <div>
                                    <p className={`text-sm font-semibold ${isDark ? 'text-emerald-50' : 'text-emerald-900'}`}>{message}</p>
                                </div>
                            </div>
                            {resetToken && (
                                <div className={`p-4 ${isDark ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-100'} rounded-xl border`}>
                                    <p className={`text-xs font-black ${isDark ? 'text-amber-400' : 'text-amber-600'} mb-2 uppercase tracking-widest`}>Demo Mode – Click to reset:</p>
                                    <button
                                        onClick={() => navigate(`/reset-password/${resetToken}`)}
                                        className={`text-xs ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'} font-mono break-all font-bold transition-colors text-left`}
                                    >
                                        /reset-password/{resetToken.substring(0, 20)}...
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                            <div>
                                <label className={`block text-xs font-black ${isDark ? 'text-slate-400' : 'text-slate-500'} uppercase tracking-widest mb-2 ml-1`}>Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    placeholder="you@example.com"
                                    className={`w-full px-4 py-3 rounded-xl border ${isDark ? 'border-white/5 bg-slate-800/50 text-white' : 'border-slate-200 bg-slate-50 text-slate-900'} focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm`}
                                />
                            </div>
                            {error && <p className="text-sm text-red-400 font-bold text-center">{error}</p>}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full py-4 ${isDark ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/10'} font-black rounded-xl transition-all disabled:opacity-50 shadow-xl hover:-translate-y-0.5`}
                            >
                                {isLoading ? 'SENDING...' : 'SEND RESET LINK'}
                            </button>
                        </form>
                    )}

                    <Link to="/login" className={`flex items-center justify-center gap-2 text-sm ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'} mt-8 transition-colors font-bold relative z-10`}>
                        <ArrowLeft className="h-4 w-4" />
                        Back to Login
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};
