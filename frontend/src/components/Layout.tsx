import React from 'react';
import { Sidebar } from './Sidebar';
import { Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div className={`min-h-screen ${isDark ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'} transition-colors duration-500 relative overflow-hidden`}>
            {/* Dynamic Mesh Background (Global for Dashboard Suite) */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                {/* Subtle Dot Grid */}
                <div 
                    className="absolute inset-0" 
                    style={{ 
                        backgroundImage: `radial-gradient(${isDark ? '#10b981' : '#059669'} 0.5px, transparent 0.5px)`, 
                        backgroundSize: '24px 24px',
                        opacity: isDark ? 0.12 : 0.08
                    }}
                ></div>

                {/* Moving Mesh Gradients */}
                <motion.div
                    animate={{ 
                        x: [0, 80, 0],
                        y: [0, 40, 0],
                        scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className={`absolute top-[-10%] right-[-5%] w-[50%] h-[50%] ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-300/15'} rounded-full blur-[120px]`}
                />
                <motion.div
                    animate={{ 
                        x: [0, -80, 0],
                        y: [0, -40, 0],
                        scale: [1, 1.05, 1]
                    }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className={`absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] ${isDark ? 'bg-blue-500/10' : 'bg-blue-300/15'} rounded-full blur-[120px]`}
                />
            </div>

            {/* Subtle Electricity Spark (Background Layer) */}
            <div className={`fixed inset-0 z-0 pointer-events-none ${isDark ? 'opacity-[0.1]' : 'opacity-[0.05]'}`}>
                <svg className="w-full h-full" preserveAspectRatio="none">
                    <defs>
                        <filter id="glow-layout">
                            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                    <motion.path
                        d="M 20% 0 Q 30% 50%, 20% 100%"
                        stroke={isDark ? "#10b981" : "#059669"}
                        strokeWidth="1"
                        fill="none"
                        className="opacity-10"
                    />
                    <motion.path
                        d="M 20% 0 Q 30% 50%, 20% 100%"
                        stroke={isDark ? "#10b981" : "#059669"}
                        strokeWidth="2"
                        fill="none"
                        filter="url(#glow-layout)"
                        initial={{ pathLength: 0.05, pathOffset: 0 }}
                        animate={{ pathOffset: [0, 1] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.path
                        d="M 80% 0 Q 70% 50%, 80% 100%"
                        stroke="#3b82f6"
                        strokeWidth="1"
                        fill="none"
                        className="opacity-10"
                    />
                    <motion.path
                        d="M 80% 0 Q 70% 50%, 80% 100%"
                        stroke="#3b82f6"
                        strokeWidth="2"
                        fill="none"
                        filter="url(#glow-layout)"
                        initial={{ pathLength: 0.05, pathOffset: 1 }}
                        animate={{ pathOffset: [1, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                    />
                </svg>
            </div>

            <Sidebar />

            {/* Mobile Header */}
            <div className="md:hidden flex h-16 items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-dark-card/80 backdrop-blur-md px-4 sticky top-0 z-10 w-full transition-colors duration-500">
                <span className="text-xl font-bold text-gray-900 dark:text-white">EnergyLens</span>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
                    <Menu className="h-6 w-6 text-gray-600 dark:text-gray-200" />
                </button>
            </div>

            {/* Main Content */}
            <main className="md:pl-64 min-h-screen pt-4 md:pt-0">
                <div className="container mx-auto px-4 py-8 md:px-8">
                    {children}
                </div>
            </main>
        </div>
    );
};
