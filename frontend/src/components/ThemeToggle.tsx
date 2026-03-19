import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

export const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className="relative p-3 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all shadow-sm hover:shadow-md"
            aria-label="Toggle theme"
        >
            <div className="relative w-6 h-6">
                <motion.div
                    initial={false}
                    animate={{
                        scale: theme === 'light' ? 1 : 0,
                        opacity: theme === 'light' ? 1 : 0,
                        rotate: theme === 'light' ? 0 : 180,
                    }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 flex items-center justify-center"
                >
                    <Sun className="h-6 w-6 text-amber-500" />
                </motion.div>
                <motion.div
                    initial={false}
                    animate={{
                        scale: theme === 'dark' ? 1 : 0,
                        opacity: theme === 'dark' ? 1 : 0,
                        rotate: theme === 'dark' ? 0 : -180,
                    }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 flex items-center justify-center"
                >
                    <Moon className="h-6 w-6 text-blue-400" />
                </motion.div>
            </div>
        </motion.button>
    );
};
