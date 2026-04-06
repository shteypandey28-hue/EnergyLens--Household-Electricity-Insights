import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Zap,
    Tv,
    BarChart3,
    Settings,
    LogOut,
    Bell,
    Crown,
    Home,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { clsx } from 'clsx';

interface NavItem {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    to: string;
    badge?: number;
    premiumOnly?: boolean;
}

export const Sidebar: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const isPremium = user?.role === 'premium' || user?.role === 'admin';

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navItems: NavItem[] = [
        { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
        { icon: Zap, label: 'Usage & Bills', to: '/usage' },
        { icon: Tv, label: 'Appliances', to: '/appliances' },
        { icon: Bell, label: 'Alerts', to: '/alerts' },
        { icon: BarChart3, label: 'Reports', to: '/reports' },
        { icon: Home, label: 'Households', to: '/households', premiumOnly: true },
        { icon: Settings, label: 'Settings', to: '/settings' },
    ];

    const planColors = {
        free: 'from-slate-500 to-slate-600',
        basic: 'from-blue-500 to-blue-600',
        premium: 'from-amber-500 to-orange-500',
        admin: 'from-purple-500 to-purple-600',
    };
    const planLabel = {
        free: 'Free Plan',
        basic: 'Basic',
        premium: 'Premium',
        admin: 'Admin',
    };

    return (
        <aside className="fixed inset-y-0 left-0 w-64 bg-white/80 dark:bg-dark-card/80 backdrop-blur-xl border-r border-slate-200 dark:border-dark-border transform transition-all duration-500 z-20 hidden md:flex md:flex-col shadow-xl">
            {/* Logo */}
            <div className="flex h-16 items-center px-5 border-b border-slate-200 dark:border-dark-border">
                <div className="flex items-center gap-2.5">
                    <div className="rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 p-2 shadow-md shadow-blue-500/30">
                        <Zap className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <span className="text-lg font-bold text-slate-900 dark:text-white">
                            Energy<span className="text-blue-600">Lens</span>
                        </span>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium leading-none mt-0.5">
                            Smart Energy Insights
                        </div>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
                {navItems.map((item) => (
                    <NavLink
                        key={item.label}
                        to={item.to}
                        className={({ isActive }) =>
                            clsx(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group relative',
                                isActive
                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white',
                                item.premiumOnly && !isPremium ? 'opacity-60' : ''
                            )
                        }
                    >
                        {({ isActive }) => (
                            <>
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-blue-600 rounded-r-full" />
                                )}
                                <item.icon className={clsx('h-4 w-4 flex-shrink-0', isActive ? 'text-blue-600 dark:text-blue-400' : '')} />
                                <span className="flex-1">{item.label}</span>
                                {item.premiumOnly && !isPremium && (
                                    <Crown className="h-3 w-3 text-amber-500" />
                                )}
                                {item.badge && (
                                    <span className="h-5 w-5 flex items-center justify-center text-[10px] font-bold bg-red-500 text-white rounded-full">
                                        {item.badge}
                                    </span>
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Bottom section */}
            <div className="border-t border-slate-200 dark:border-dark-border p-3 space-y-2">
                {/* User card */}
                {user && (
                    <div className="px-3 py-2.5 rounded-lg bg-slate-50/50 dark:bg-slate-800/30 border border-slate-200 dark:border-dark-border">
                        <div className="flex items-center gap-2.5">
                            <div className={`h-8 w-8 rounded-full overflow-hidden flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm ${!user.profilePicture ? (planColors[user.role as keyof typeof planColors] || planColors.free) : ''} bg-gradient-to-br`}>
                                {user.profilePicture ? (
                                    <img 
                                        src={user.profilePicture.startsWith('http') ? user.profilePicture : `${import.meta.env.VITE_API_URL || "http://localhost:5001"}${user.profilePicture}`} 
                                        alt={user.name} 
                                        className="h-full w-full object-cover" 
                                    />
                                ) : (
                                    user.name?.[0]?.toUpperCase() || 'U'
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{user.name}</p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                            </div>
                        </div>
                        <div className="mt-2">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${planColors[user.role as keyof typeof planColors] || planColors.free} text-white shadow-sm`}>
                                {user.role === 'premium' && <Crown className="h-2.5 w-2.5" />}
                                {planLabel[user.role as keyof typeof planLabel] || 'Free Plan'}
                            </span>
                        </div>
                    </div>
                )}

                {/* Upgrade CTA for free users */}
                {user?.role === 'free' && (
                    <NavLink
                        to="/upgrade"
                        className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md shadow-blue-500/25"
                    >
                        <Crown className="h-3.5 w-3.5" />
                        Upgrade to Premium
                    </NavLink>
                )}

                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                >
                    <LogOut className="h-4 w-4" />
                    Log Out
                </button>
            </div>
        </aside>
    );
};
