import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function InvitePage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { session, loading } = useAuth();
    const [showManual, setShowManual] = useState(false);

    // Check for invite token or specific logic
    const token = searchParams.get('token');
    const type = searchParams.get('type');

    useEffect(() => {
        console.log('InvitePage effect running', { loading, session: !!session, token, type });

        if (loading) return;

        // If user is already logged in, redirect to dashboard
        if (session) {
            console.log('User logged in, redirecting to dashboard');
            navigate('/dashboard', { replace: true });
            return;
        }

        // Simulating invite token handling
        if (token && type === 'invite') {
            console.log('Invite token found, redirecting to login/signup');
            navigate('/login?view=signup&message=You have been invited to join the team!', { replace: true });
        } else {
            console.log('No token, redirecting to login');
            navigate('/login', { replace: true });
        }
    }, [session, loading, navigate, token, type]);

    useEffect(() => {
        // Show manual redirect option after 3 seconds
        const timer = setTimeout(() => setShowManual(true), 3000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#09090B]">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-6"
            >
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-gray-500 dark:text-gray-400">Processing invitation...</p>
                </div>

                {showManual && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <button
                            onClick={() => navigate('/login', { replace: true })}
                            className="text-sm text-primary hover:underline"
                        >
                            Taking too long? Click here to continue
                        </button>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
