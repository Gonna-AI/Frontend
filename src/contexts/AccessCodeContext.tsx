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
                const { data, error: fetchError } = await supabase
                    .from('user_access')
                    .select('id, is_active, expires_at')
                    .eq('user_id', user.id)
                    .eq('is_active', true)
                    .maybeSingle();

                if (fetchError) {
                    console.error('Error checking access:', fetchError);
                    setHasAccess(false);
                } else if (data) {
                    // Check if access hasn't expired
                    const isExpired = data.expires_at && new Date(data.expires_at) < new Date();
                    setHasAccess(!isExpired);
                } else {
                    setHasAccess(false);
                }
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
            const { data, error: rpcError } = await supabase.rpc('validate_access_code', {
                p_code: code.trim().toUpperCase(),
            });

            if (rpcError) {
                setError('Failed to validate code. Please try again.');
                return false;
            }

            if (data?.success) {
                setHasAccess(true);
                setError(null);
                return true;
            } else {
                setError(data?.error || 'Invalid or expired access code');
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
