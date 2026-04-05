import React from 'react';
import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './Button';

interface FeatureCardProps {
    title: string;
    description: string;
    icon?: React.ComponentType<{ className?: string }>;
    locked?: boolean;
    requiredPlan?: 'basic' | 'premium';
    children?: React.ReactNode;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
    title,
    description,
    icon: Icon,
    locked = false,
    requiredPlan = 'premium',
    children
}) => {
    const navigate = useNavigate();

    if (locked) {
        return (
            <div className="relative bg-white/50 dark:bg-dark-card/50 backdrop-blur-sm rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 p-8 text-center">
                <div className="absolute -top-3 -right-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full p-3 shadow-lg">
                    <Lock className="h-5 w-5 text-white" />
                </div>

                {Icon && (
                    <div className="inline-flex p-4 rounded-full bg-gray-100 dark:bg-gray-800 mb-4 opacity-50">
                        <Icon className="h-8 w-8 text-gray-400" />
                    </div>
                )}

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {title}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                    {description}
                </p>

                <div className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold px-4 py-1.5 rounded-full mb-4">
                    {requiredPlan === 'basic' ? 'BASIC PLAN' : 'PRO PLAN'}
                </div>

                <Button
                    onClick={() => navigate('/upgrade')}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white w-full"
                >
                    Upgrade to Unlock
                </Button>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-200 dark:border-gray-700 p-8 shadow-lg hover:shadow-xl transition-all duration-300">
            {Icon && (
                <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 bg-opacity-10 mb-4">
                    <Icon className="h-8 w-8 text-primary" />
                </div>
            )}

            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
                {description}
            </p>

            {children}
        </div>
    );
};
