import React from 'react';
import { Crown, Zap } from 'lucide-react';

interface PremiumBadgeProps {
    plan: 'basic' | 'premium';
    size?: 'sm' | 'md' | 'lg';
}

export const PremiumBadge: React.FC<PremiumBadgeProps> = ({ plan, size = 'md' }) => {
    const sizeClasses = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-3 py-1',
        lg: 'text-base px-4 py-1.5'
    };

    const Icon = plan === 'premium' ? Crown : Zap;
    const gradientClass = plan === 'premium'
        ? 'from-purple-600 to-pink-600'
        : 'from-blue-600 to-cyan-600';
    const label = plan === 'premium' ? 'PRO' : 'BASIC';

    return (
        <div className={`inline-flex items-center gap-1.5 bg-gradient-to-r ${gradientClass} text-white font-bold rounded-full ${sizeClasses[size]} shadow-md`}>
            <Icon className="h-3 w-3" />
            {label}
        </div>
    );
};
