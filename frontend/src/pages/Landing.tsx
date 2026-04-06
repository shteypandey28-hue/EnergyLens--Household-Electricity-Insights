import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { 
    Zap, TrendingDown, BarChart3, ArrowRight, 
    Play, Check, Shield, Cpu, Cloud, Users, Globe, Clock,
    Sun, Moon
} from 'lucide-react';

export const Landing: React.FC = () => {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';
    const [showMoreInfo, setShowMoreInfo] = React.useState(false);
    const { scrollYProgress } = useScroll();
    const phoneRotateX = useTransform(scrollYProgress, [0, 0.2], [0, -15]);
    const phoneRotateY = useTransform(scrollYProgress, [0, 0.2], [0, 25]);
    const phoneScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.9]);

    const additionalFeatures = [
        {
            icon: Shield,
            title: 'Bank-Grade Security',
            description: 'Your energy data is encrypted and stored securely using industry-leading protocols.'
        },
        {
            icon: Cpu,
            title: 'AI Signal Processing',
            description: 'Advanced algorithms identify individual appliances without the need for expensive smart plugs.'
        },
        {
            icon: Cloud,
            title: 'Cloud Sync',
            description: 'Access your energy dashboard from any device, anywhere in the world and stay updated.'
        }
    ];

    return (
        <div className={`min-h-screen ${isDark ? 'bg-[#0f172a] text-white' : 'bg-slate-50 text-slate-900'} selection:bg-emerald-500/30 relative scroll-smooth transition-colors duration-500`}>
            {/* Animated Electricity Line Background */}
            <div className={`absolute inset-0 z-0 pointer-events-none overflow-hidden h-full ${isDark ? 'opacity-[0.12]' : 'opacity-[0.08]'}`}>
                <svg className="w-full h-full">
                    <motion.path
                        d="M 100 0 C 100 400, 800 200, 800 800 S 200 1200, 200 1600 S 800 2000, 800 2400 S 200 2800, 200 3200 S 800 3600, 800 4200 S 200 4800, 200 5500"
                        stroke="#10b981"
                        strokeWidth="3"
                        fill="none"
                        strokeDasharray="10 20"
                        style={{ pathLength: scrollYProgress }}
                    />
                    <motion.path
                        d="M 100 0 C 100 400, 800 200, 800 800 S 200 1200, 200 1600 S 800 2000, 800 2400 S 200 2800, 200 3200 S 800 3600, 800 4200 S 200 4800, 200 5500"
                        stroke="#10b981"
                        strokeWidth="1"
                        fill="none"
                        animate={{ strokeDashoffset: [0, -60] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        strokeDasharray="10 20"
                    />
                </svg>
            </div>

            {/* Optimized Navigation */}
            <nav className={`fixed top-0 left-0 right-0 z-50 ${isDark ? 'bg-[#0f172a]/70 border-white/5' : 'bg-white/80 border-slate-200'} backdrop-blur-2xl border-b transition-colors duration-500`}>
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <Zap className="h-6 w-6 text-white" />
                        </div>
                        <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight`}>EnergyLens</span>
                    </div>

                    <div className={`hidden md:flex items-center gap-8 text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        <a href="#features" className={`hover:text-emerald-500 transition-colors`}>Features</a>
                        <a href="#how-it-works" className={`hover:text-emerald-500 transition-colors`}>How it Works</a>
                        <a href="#about" className={`hover:text-emerald-500 transition-colors`}>About</a>
                    </div>

                    <div className="flex items-center gap-4">
                        <button 
                            onClick={toggleTheme}
                            className={`p-2.5 rounded-xl border transition-all ${
                                isDark ? 'bg-white/5 border-white/10 text-emerald-400 hover:bg-white/10' : 'bg-slate-100 border-slate-200 text-emerald-600 hover:bg-slate-200'
                            }`}
                        >
                            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </button>
                        <button onClick={() => navigate('/login')} className={`px-5 py-2 ${isDark ? 'text-white' : 'text-slate-900'} font-semibold hover:text-emerald-500 transition-colors`}>
                            Log In
                        </button>
                        <button onClick={() => navigate('/signup')} className={`px-5 py-2.5 ${isDark ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'} rounded-xl font-bold hover:bg-emerald-500 hover:text-white transition-all shadow-md`}>
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>

            {/* Premium Hero Section */}
            <div className="relative pt-44 pb-32 px-6 overflow-hidden">
                {/* Visual Depth Elements */}
                <div className={`absolute -top-24 -left-24 w-96 h-96 ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-500/5'} rounded-full blur-[128px]`}></div>
                <div className="absolute top-1/2 -right-24 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[160px]"></div>

                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className={`inline-flex items-center gap-2 px-3 py-1 ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-emerald-50 border-emerald-100'} border rounded-full mb-8`}>
                            <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                            <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>#1 choice for smart energy</span>
                        </div>

                        <h1 className={`text-6xl md:text-7xl font-bold ${isDark ? 'text-white' : 'text-slate-900'} leading-[1.1] mb-8`}>
                            Optimize Your Power.<br />
                            <span className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Lower Your Bill.</span>
                        </h1>

                        <p className={`text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'} max-w-xl leading-relaxed mb-12`}>
                            Real-time appliance monitoring to help you save on your next bill and live sustainably. 
                            Understand your consumption patterns like never before.
                        </p>

                        <div className="flex flex-wrap items-center gap-4">
                            <button
                                onClick={() => navigate('/signup')}
                                className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-emerald-600/20 hover:-translate-y-1 transition-all flex items-center gap-2"
                            >
                                Get Started Free <ArrowRight className="h-5 w-5" />
                            </button>
                            <button className={`px-8 py-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-200 border-slate-300 text-slate-900'} border rounded-2xl font-bold text-lg hover:bg-opacity-80 transition-all flex items-center gap-2`}>
                                <Play className="h-5 w-5 fill-current" /> Watch Demo
                            </button>
                        </div>
                    </motion.div>

                    {/* 3D Animated Phone Visual */}
                    <div className="relative perspective-1000">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, rotate: 10 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            whileHover={{ scale: 1.1, rotateY: 15, transition: { duration: 0.3 } }}
                            whileTap={{ scale: 0.95 }}
                            style={{ rotateX: phoneRotateX, rotateY: phoneRotateY, scale: phoneScale }}
                            className="relative z-10 mx-auto max-w-[480px] cursor-pointer"
                        >
                            <div className={`absolute inset-0 ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-500/10'} blur-[80px] rounded-[60px] -z-10 animate-pulse`}></div>
                            <img 
                                src="/energylens_3d_phone.png" 
                                alt="EnergyLens App" 
                                className={`w-full ${isDark ? 'drop-shadow-[0_35px_35px_rgba(0,0,0,0.6)]' : 'drop-shadow-[0_35px_35px_rgba(0,0,0,0.1)]'} rounded-[48px]`}
                            />
                        </motion.div>

                        {/* Floating Feature Tags */}
                        <motion.div 
                            animate={{ y: [0, -15, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className={`absolute -right-8 top-1/4 p-4 ${isDark ? 'bg-white/5 border-white/10 shadow-2xl' : 'bg-white border-slate-200 shadow-xl'} backdrop-blur-xl border rounded-2xl z-20`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                                    <TrendingDown className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                    <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'} font-bold uppercase tracking-wider`}>Total Saved</p>
                                    <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>₹12,450.00</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div 
                            animate={{ y: [0, 15, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className={`absolute -left-12 bottom-1/4 p-4 ${isDark ? 'bg-white/5 border-white/10 shadow-2xl' : 'bg-white border-slate-200 shadow-xl'} backdrop-blur-xl border rounded-2xl z-20`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                    <BarChart3 className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                    <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'} font-bold uppercase tracking-wider`}>Live Load</p>
                                    <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>2.41 kW</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Redesigned Features Section */}
            <div id="features" className={`py-32 px-6 ${isDark ? 'bg-slate-900/30' : 'bg-slate-100/50'} transition-colors duration-500`}>
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
                        <div className="max-w-2xl">
                            <h2 className={`text-4xl md:text-5xl font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-6 tracking-tight`}>
                                Powering Your Home <br />
                                <span className="text-emerald-500">With Intelligence.</span>
                            </h2>
                            <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} text-lg font-medium`}>
                                EnergyLens combines advanced signal processing with beautiful visualization 
                                to give you complete control over your household consumption.
                            </p>
                        </div>
                        <button className="text-emerald-500 font-bold flex items-center gap-2 hover:gap-4 transition-all uppercase tracking-widest text-xs">
                            View All Features <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {additionalFeatures.map((f, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className={`group p-8 ${isDark ? 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]' : 'bg-white border-slate-200 hover:bg-slate-50 shadow-sm'} border rounded-[32px] hover:border-emerald-500/30 transition-all`}
                            >
                                <div className={`h-14 w-14 ${isDark ? 'bg-slate-800' : 'bg-slate-100'} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-500 transition-all`}>
                                    <f.icon className={`h-7 w-7 ${isDark ? 'text-emerald-500' : 'text-emerald-600'} group-hover:text-white transition-colors`} />
                                </div>
                                <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-4 tracking-tight`}>{f.title}</h3>
                                <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} leading-relaxed font-medium`}>{f.description}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* New Advanced Features Section */}
                    <div className="mt-40">
                        <div className="text-center mb-20">
                            <span className="text-emerald-500 font-bold uppercase tracking-[0.2em] text-xs">The EnergyLens Ecosystem</span>
                            <h2 className={`text-4xl md:text-5xl font-bold ${isDark ? 'text-white' : 'text-slate-900'} mt-4 mb-6 tracking-tight`}>Designed for the Next Decade.</h2>
                            <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} max-w-2xl mx-auto text-lg font-medium`}>
                                We've built the most advanced energy tracking platform in India, integrating 
                                every part of your electrical life into one seamless experience.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { t: 'Appliance Fingerprinting', d: 'Our AI identifies your AC, Fridge, and Geyser signatures without extra hardware.', i: Cpu },
                                { t: 'Time-of-Use Savings', d: 'Automatically suggests the best time to run heavy appliances based on state tariffs.', i: TrendingDown },
                                { t: 'Community Pulse', d: 'See how your household efficiency compares with your neighborhood average.', i: BarChart3 },
                                { t: 'Solar Ready', d: 'Integrated support for solar panel monitoring and grid injection tracking.', i: Zap }
                            ].map((feature, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className={`p-8 ${isDark ? 'bg-gradient-to-b from-white/[0.04] to-transparent border-white/5' : 'bg-white border-slate-200 shadow-sm'} border rounded-[40px] hover:border-emerald-500/20 transition-all group`}
                                >
                                    <div className={`h-12 w-12 rounded-full ${isDark ? 'bg-emerald-500/10 text-emerald-500' : 'bg-emerald-50 text-emerald-600'} flex items-center justify-center mb-6 group-hover:bg-emerald-500 group-hover:text-white transition-all`}>
                                        <feature.i className="h-6 w-6" />
                                    </div>
                                    <h4 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-3 tracking-tight`}>{feature.t}</h4>
                                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'} leading-relaxed font-medium`}>{feature.d}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium Modular "Measure What Matters" Section */}
            <div id="how-it-works" className={`py-32 px-6 relative overflow-hidden transition-colors duration-500`}>
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] ${isDark ? 'bg-emerald-500/5' : 'bg-emerald-500/[0.03]'} rounded-full blur-[160px] pointer-events-none`}></div>
                
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
                    <div className="relative h-[500px] flex items-center justify-center order-2 lg:order-1">
                        {/* Main Efficiency Tile */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className={`relative z-20 p-10 ${isDark ? 'bg-slate-900/60' : 'bg-white shadow-2xl'} backdrop-blur-3xl rounded-[48px] border ${isDark ? 'border-white/10' : 'border-slate-100'} w-[320px] h-[320px] flex flex-col items-center justify-center transition-all hover:scale-105`}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${isDark ? 'from-emerald-500/10' : 'from-emerald-50'} to-transparent rounded-[48px]`}></div>
                            <div className="relative mb-4">
                                <motion.div 
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                    className={`w-32 h-32 border-2 ${isDark ? 'border-emerald-500/20' : 'border-emerald-100'} rounded-full border-t-emerald-500`}
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Zap className="h-8 w-8 text-emerald-500" />
                                </div>
                            </div>
                            <div className="text-center relative z-10">
                                <p className={`text-4xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>84%</p>
                                <p className="text-emerald-500 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">Efficiency Rating</p>
                            </div>
                        </motion.div>

                        {/* Floating Mini Chart Tile */}
                        <motion.div 
                            initial={{ opacity: 0, x: 40, y: -40 }}
                            whileInView={{ opacity: 1, x: 0, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="absolute z-30 top-10 right-10 p-6 bg-slate-800/80 backdrop-blur-xl rounded-3xl border border-white/10 shadow-xl w-48 hover:translate-y-[-5px] transition-transform"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <BarChart3 className="h-4 w-4 text-emerald-400" />
                                <span className="text-[10px] text-slate-400 font-bold">LIVE LOAD</span>
                            </div>
                            <div className="flex items-end gap-1 h-12">
                                {[30, 60, 45, 80, 50, 70, 40].map((h, i) => (
                                    <motion.div 
                                        key={i}
                                        initial={{ height: 0 }}
                                        animate={{ height: `${h}%` }}
                                        transition={{ delay: 0.5 + (i * 0.1) }}
                                        className="w-full bg-emerald-500/30 rounded-t-sm" 
                                    />
                                ))}
                            </div>
                        </motion.div>

                        {/* Floating Device Alert Tile */}
                        <motion.div 
                            initial={{ opacity: 0, x: -40, y: 40 }}
                            whileInView={{ opacity: 1, x: 0, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="absolute z-10 bottom-10 left-10 p-5 bg-emerald-600/10 backdrop-blur-xl rounded-3xl border border-emerald-500/20 shadow-xl w-56 hover:translate-y-[5px] transition-transform"
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                                    <Cpu className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-white font-bold text-xs">AC Detected</p>
                                    <p className="text-emerald-400/80 text-[10px]">High usage spike</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <div className="order-1 lg:order-2">
                        <span className="text-emerald-500 font-bold uppercase tracking-[0.2em] text-xs mb-4 block">Precision Analytics</span>
                        <h2 className={`text-5xl md:text-6xl font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-10 tracking-tight leading-tight`}>Measure What <br /> <span className={`${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Matters.</span></h2>
                        <div className="space-y-6">
                            {[
                                { t: 'Real-time Monitoring', d: 'High-frequency sampling tracks every watt as it flows through your home.' },
                                { t: 'Monthly Forecasting', d: 'Predict your next bill with 98% accuracy using historical trend analysis.' },
                                { t: 'Custom Budgeting', d: 'Set smart thresholds and receive push notifications before you overspend.' }
                            ].map((item, i) => (
                                <motion.div 
                                    key={i} 
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    whileHover={{ x: 10 }}
                                    className={`group flex gap-6 p-6 rounded-3xl ${isDark ? 'hover:bg-white/[0.03] hover:border-white/5' : 'hover:bg-emerald-50 hover:border-emerald-100'} border border-transparent transition-all cursor-default`}
                                >
                                    <div className={`flex-shrink-0 h-12 w-12 rounded-2xl ${isDark ? 'bg-emerald-500/10 text-emerald-500' : 'bg-emerald-50 text-emerald-600'} flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-lg shadow-emerald-500/5`}>
                                        <Check className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-2 group-hover:text-emerald-500 transition-colors uppercase tracking-tight`}>{item.t}</h4>
                                        <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} leading-relaxed font-medium text-sm md:text-base`}>{item.d}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Redesigned Premium CTA Section / About */}
            <div id="about" className={`py-24 px-6 relative transition-colors duration-500`}>
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-500/5'} rounded-full blur-[160px] pointer-events-none`}></div>
                
                <div className="max-w-4xl mx-auto relative transition-all duration-500">
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className={`relative p-12 md:p-16 ${isDark ? 'bg-slate-900/40 border-white/10 shadow-black/40' : 'bg-white border-slate-200 shadow-xl'} backdrop-blur-3xl border rounded-[48px] text-center overflow-hidden group shadow-2xl transition-all duration-500`}
                    >
                        {/* Interactive Background Glows */}
                        <div className={`absolute -top-24 -right-24 w-64 h-64 ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-500/10'} rounded-full blur-[100px] group-hover:scale-150 transition-transform duration-700`}></div>
                        <div className={`absolute -bottom-24 -left-24 w-64 h-64 ${isDark ? 'bg-blue-500/10' : 'bg-blue-500/5'} rounded-full blur-[100px] group-hover:scale-150 transition-transform duration-700`}></div>

                        <div className="relative z-10 max-w-2xl mx-auto">
                            <h2 className={`text-4xl md:text-5xl font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-6 tracking-tight leading-tight`}>
                                Join the Energy <br /> 
                                <span className="text-emerald-500">Revolution.</span>
                            </h2>
                            <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} text-base md:text-lg mb-10 leading-relaxed font-medium`}>
                                Get access to real-time insights, smart recommendations, and 
                                a community committed to a more efficient, greener future.
                            </p>
                            
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <button
                                    onClick={() => navigate('/signup')}
                                    className="w-full sm:w-auto px-10 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-black text-lg transition-all shadow-xl shadow-emerald-500/20 hover:-translate-y-1"
                                >
                                    Get Started Now
                                </button>
                                <button 
                                    onClick={() => setShowMoreInfo(!showMoreInfo)}
                                    className={`w-full sm:w-auto px-10 py-4 ${showMoreInfo ? (isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600') : (isDark ? 'bg-white/5 text-white' : 'bg-slate-100 text-slate-900')} hover:bg-emerald-500/10 border ${isDark ? 'border-white/10' : 'border-slate-200'} rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2`}
                                >
                                    {showMoreInfo ? 'Close Info' : 'Learn More'}
                                </button>
                            </div>

                            {/* Expandable More Info Content */}
                            <motion.div
                                initial={false}
                                animate={{ height: showMoreInfo ? 'auto' : 0, opacity: showMoreInfo ? 1 : 0 }}
                                className="overflow-hidden"
                            >
                                <div className={`pt-12 mt-12 border-t ${isDark ? 'border-white/5' : 'border-slate-100'} grid grid-cols-2 lg:grid-cols-5 gap-8 text-left`}>
                                    {[
                                        { t: 'Bill Splitting', d: 'Fairly divide energy costs among roommates.', i: Users },
                                        { t: 'Solar ROI', d: 'Track your solar payback period automatically.', i: Zap },
                                        { t: 'Appliance Health', d: 'Detect early signs of motor wear in ACs.', i: Cpu },
                                        { t: 'Carbon Score', d: 'Compare your footprint with global goals.', i: Globe },
                                        { t: 'Smart Schedule', d: 'Alerts for the cheapest tariff hours.', i: Clock },
                                        { t: 'Offline Core', d: 'Tracking works without active internet.', i: Shield },
                                        { t: 'API Access', d: 'Professional API for home automation.', i: Cpu },
                                        { t: 'Child Safety', d: 'Monitor power patterns in specific rooms.', i: Shield },
                                        { t: 'Auto Audits', d: 'Spotlight "Energy Vampires" weekly.', i: BarChart3 },
                                        { t: 'Community Sync', d: 'Benchmark against your neighborhood.', i: Users }
                                    ].map((point, i) => (
                                        <div key={i} className="group/item">
                                            <h4 className={`${isDark ? 'text-white' : 'text-slate-900'} font-bold mb-2 flex items-center gap-2 text-xs group-hover/item:text-emerald-500 transition-colors`}>
                                                <point.i className="h-3 w-3 text-emerald-500" />
                                                {point.t}
                                            </h4>
                                            <p className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-600'} leading-relaxed font-medium`}>
                                                {point.d}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Minimalist Footer */}
            <footer className={`py-12 border-t ${isDark ? 'border-white/5' : 'border-slate-200'} mx-6 transition-colors duration-500`}>
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className={`flex items-center gap-3 ${isDark ? 'grayscale opacity-50' : ''} hover:grayscale-0 hover:opacity-100 transition-all`}>
                        <div className={`h-8 w-8 ${isDark ? 'bg-slate-700' : 'bg-emerald-500 shadow-lg shadow-emerald-500/20'} rounded-lg flex items-center justify-center`}>
                            <Zap className="h-5 w-5 text-white" />
                        </div>
                        <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight`}>EnergyLens</span>
                    </div>
                    <p className={`${isDark ? 'text-slate-500' : 'text-slate-600'} text-sm font-medium`}>
                        &copy; 2026 EnergyLens. Building a sustainable future, together.
                    </p>
                    <div className={`flex gap-6 ${isDark ? 'text-slate-500' : 'text-slate-600'} text-sm font-bold`}>
                        <a href="#" className={`hover:text-emerald-500 transition-colors`}>Privacy</a>
                        <a href="#" className={`hover:text-emerald-500 transition-colors`}>Terms</a>
                        <a href="#" className={`hover:text-emerald-500 transition-colors`}>Twitter</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};
