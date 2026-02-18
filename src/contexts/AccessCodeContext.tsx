import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from './AuthContext';

interface AccessCodeContextType {
    hasAccess: boolean;
    isLoading: boolean;
    error: string | null;
    validateCode: (code: string) => Promise<boolean>;
    clearError: () => void;
}

const AccessCodeContext = createContext<AccessCodeContextType | undefined>(undefined);

export function AccessCodeProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [hasAccess, setHasAccess] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Check if user already has access on mount
    useEffect(() => {
        if (!user) {
            setHasAccess(false);
            setIsLoading(false);
            return;
        }

        const checkAccess = async () => {
            setIsLoading(true);
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    setHasAccess(false);
                    return;
                }

                const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/api-access`, {
                    headers: {
                        'Authorization': `Bearer ${session.access_token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to check access');
                }

                const data = await response.json();
                setHasAccess(!!data.hasAccess);
            } catch (err) {
                console.error('Access check failed:', err);
                setHasAccess(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAccess();
    }, [user]);

    const validateCode = useCallback(async (code: string): Promise<boolean> => {
        setError(null);

        if (!code.trim()) {
            setError('Please enter an access code');
            return false;
        }

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated');

            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/api-access/validate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ code: code.trim().toUpperCase() })
            });

            const data = await response.json();

            if (!response.ok || data.error) {
                setError(data.error || 'Failed to validate code');
                return false;
            }

            if (data.success) {
                setHasAccess(true);
                setError(null);
                return true;
            } else {
                setError('Invalid or expired access code');
                return false;
            }
        } catch (err) {
            setError('Network error. Please check your connection.');
            return false;
        }
    }, []);

    const clearError = useCallback(() => setError(null), []);

    return (
        <AccessCodeContext.Provider value={{ hasAccess, isLoading, error, validateCode, clearError }}>
            {children}
        </AccessCodeContext.Provider>
    );
}

export function useAccessCode() {
    const context = useContext(AccessCodeContext);
    if (context === undefined) {
        throw new Error('useAccessCode must be used within an AccessCodeProvider');
    }
    return context;
}
