import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../../config/api';

interface PrivateRouteProps {
    children: React.ReactNode;
}

export const PrivateRoute = ({ children }: PrivateRouteProps) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [hasChecked, setHasChecked] = useState<boolean>(false);

    useEffect(() => {
        // Check auth in background without blocking render
        const checkAuth = async () => {
            try {
                await api.get('/api/auth/check-session');
                setIsAuthenticated(true);
            } catch (error) {
                console.error('Authentication check failed:', error);
                setIsAuthenticated(false);
            } finally {
                setHasChecked(true);
            }
        };
        
        checkAuth();
    }, []);

    // Render children immediately while checking auth in background
    // If auth fails, redirect will happen after check completes
    if (!hasChecked) {
        // Render children optimistically for fastest load
        return <>{children}</>;
    }

    return isAuthenticated ? <>{children}</> : <Navigate to="/invite" replace />;
}; 