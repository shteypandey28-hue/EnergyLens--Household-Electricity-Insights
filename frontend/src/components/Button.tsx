import React from 'react';
import { Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    className,
    variant = 'primary',
    isLoading,
    disabled,
    ...props
}) => {
    const baseStyles = "inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
        primary: "bg-primary text-white hover:bg-primary-dark focus:ring-primary shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-95",
        secondary: "bg-secondary text-white hover:bg-secondary-dark focus:ring-secondary shadow-lg shadow-secondary/25 hover:shadow-secondary/40 active:scale-95",
        outline: "border-2 border-gray-200 bg-transparent hover:bg-gray-50 text-gray-700 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-800 active:scale-95",
        ghost: "bg-transparent hover:bg-gray-100 text-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white active:scale-95",
    };

    return (
        <button
            className={cn(baseStyles, variants[variant], className)}
            disabled={isLoading || disabled}
            {...props}
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
        </button>
    );
};
