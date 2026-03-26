import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

interface SummaryCardProps {
    title: string;
    value: string | number;
    unit?: string;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    color?: 'primary' | 'secondary' | 'warning' | 'danger';
    delay?: number;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
    title,
    value,
    unit,
    icon: Icon,
    trend,
    color = 'primary',
    delay = 0,
}) => {
    const colorStyles = {
        primary: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 ring-1 ring-indigo-500/10 dark:ring-indigo-500/20",
        secondary: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 ring-1 ring-emerald-500/10 dark:ring-emerald-500/20",
        warning: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 ring-1 ring-amber-500/10 dark:ring-amber-500/20",
        danger: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 ring-1 ring-red-500/10 dark:ring-red-500/20",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className="group relative overflow-hidden bg-white dark:bg-dark-card rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 dark:border-gray-800 p-6"
        >
            <div className="flex items-center justify-between relative z-10">
                <div>
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 tracking-wide uppercase text-[10px]">{title}</p>
                    <div className="mt-2 flex items-baseline">
                        <span className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                            {value}
                        </span>
                        {unit && <span className="ml-1 text-sm font-medium text-gray-500 dark:text-gray-400">{unit}</span>}
                    </div>
                </div>
                <div className={clsx("p-3 rounded-xl shadow-inner", colorStyles[color])}>
                    <Icon className="h-6 w-6" />
                </div>
            </div>

            {trend && (
                <div className="mt-4 flex items-center text-sm">
                    <span
                        className={clsx(
                            "font-medium",
                            trend.isPositive ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
                        )}
                    >
                        {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
                    </span>
                    <span className="ml-2 text-gray-500 dark:text-gray-400">from last month</span>
                </div>
            )}
        </motion.div>
    );
};
