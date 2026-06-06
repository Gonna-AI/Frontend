import { Navigate } from 'react-router-dom';
import { useClientPortal } from '../../contexts/ClientPortalContext';

export function ClientPortalRoute({ children }: { children: React.ReactNode }) {
    const { session, profile, loading } = useClientPortal();

    if (loading) {
        return (
            <div className="min-h-screen bg-[#eef1ee] px-4 py-10 text-[#22313a]">
                <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl items-center justify-center rounded-[2rem] border border-[#d5ddd8] bg-white shadow-[0_32px_80px_rgba(44,63,73,0.08)]">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full border-2 border-[#2c3f49]/20 border-t-[#4ec4b6] animate-spin" />
                        <div>
                            <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#4ec4b6]">Gluth portal</p>
                            <p className="text-base text-[#4a5d67]">Loading your workspace...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!session || !profile) {
        return <Navigate to="/client/login" replace />;
    }

    return <>{children}</>;
}
