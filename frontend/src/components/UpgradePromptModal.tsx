import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Crown, Zap, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UpgradePromptModalProps {
    isOpen: boolean;
    onClose: () => void;
    /** Which plan is required: 'basic' | 'premium' */
    requiredPlan?: 'basic' | 'premium';
    /** Context-specific message shown in the body */
    message?: string;
}

export const UpgradePromptModal: React.FC<UpgradePromptModalProps> = ({
    isOpen,
    onClose,
    requiredPlan = 'basic',
    message,
}) => {
    const navigate = useNavigate();
    const isPremium = requiredPlan === 'premium';

    const defaultMessage = isPremium
        ? 'Upgrade to Premium to access AI-powered forecasting, anomaly detection, and export reports.'
        : 'Upgrade to Basic to unlock up to 15 appliances, detailed analysis, and historical tracking.';

    const IconComponent = isPremium ? Crown : Zap;
    const iconBg = isPremium
        ? 'bg-gradient-to-br from-amber-400 to-orange-500'
        : 'bg-gradient-to-br from-blue-500 to-cyan-500';
    const btnClass = isPremium
        ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
        : 'bg-blue-600 hover:bg-blue-700';
    const planLabel = isPremium ? 'Premium' : 'Basic';

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm p-7 shadow-2xl border border-gray-200 dark:border-gray-700 relative"
                    >
                        {/* Close */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        {/* Icon */}
                        <div className={`mx-auto w-14 h-14 rounded-2xl ${iconBg} flex items-center justify-center mb-5 shadow-lg`}>
                            <IconComponent className="h-7 w-7 text-white" />
                        </div>

                        {/* Lock indicator */}
                        <div className="flex items-center justify-center gap-1.5 mb-3">
                            <Lock className="h-3.5 w-3.5 text-gray-400" />
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                {planLabel} Plan Required
                            </span>
                        </div>

                        {/* Title */}
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
                            Upgrade Required
                        </h2>

                        {/* Message */}
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-7 leading-relaxed">
                            {message ?? defaultMessage}
                        </p>

                        {/* Actions */}
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => { onClose(); navigate('/upgrade'); }}
                                className={`w-full h-11 rounded-xl text-white font-semibold text-sm transition-all shadow-md ${btnClass}`}
                            >
                                Upgrade to {planLabel}
                            </button>
                            <button
                                onClick={onClose}
                                className="w-full h-11 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
