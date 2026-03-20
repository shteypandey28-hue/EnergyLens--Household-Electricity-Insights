import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import type { CredentialResponse } from '@react-oauth/google';
import { Loader2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface GoogleAuthButtonProps {
    onSuccess: (credential: string) => Promise<void>;
    label?: string;
}

/**
 * Reusable Google sign-in button.
 */
export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
    onSuccess,
}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const handleSuccess = async (credentialResponse: CredentialResponse) => {
        if (!credentialResponse.credential) {
            setError('Google did not return a credential. Please try again.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await onSuccess(credentialResponse.credential);
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Google sign-in failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleError = () => {
        setError('Google sign-in was cancelled or failed. Please try again.');
    };

    return (
        <div className="w-full">
            <div className="flex justify-center">
                <GoogleLogin
                    onSuccess={handleSuccess}
                    onError={handleError}
                    useOneTap={false}
                    theme={isDark ? 'filled_black' : 'outline'}
                    size="large"
                    text="continue_with"
                    shape="rectangular"
                    logo_alignment="left"
                    width="360"
                />
            </div>
            {loading && (
                <div className={`mt-4 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in with Google…
                </div>
            )}
            {error && (
                <p className="mt-2 text-xs text-red-500 text-center">{error}</p>
            )}
        </div>
    );
};
