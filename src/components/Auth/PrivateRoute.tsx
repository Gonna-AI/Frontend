import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../config/api';

interface PrivateRouteProps {
    children: React.ReactNode;
}

export const PrivateRoute = ({ children }: PrivateRouteProps) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                await api.get('/api/auth/check-session');
                setIsAuthenticated(true);
            } catch (error) {
                console.error('Authentication check failed:', error);
                setIsAuthenticated(false);
            }
        };
        
        checkAuth();
    }, []);

    if (isAuthenticated === null) {
        return <div>Loading...</div>; // Or your loading component
    }

    return isAuthenticated ? <>{children}</> : <Navigate to="/invite" />;
}; 