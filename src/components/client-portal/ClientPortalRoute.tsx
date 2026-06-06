import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useClientPortal } from '../../contexts/ClientPortalContext';
import ClientPortalShell from './ClientPortalShell';

export function ClientPortalRoute({ children }: { children: ReactNode }) {
    const { session, profile, account, loading } = useClientPortal();

    if (loading) {
        return (
            <ClientPortalShell account={account ?? null} headerBadge="Client workspace">
                <div className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-3xl items-center justify-center">
                    <div className="w-full rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center shadow-[0_30px_100px_rgba(0,0,0,0.35)]">
                        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-white/12 border-t-[#FF8A5B]" />
                        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-[#FF8A5B]">Client portal</p>
                        <p className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">Loading your workspace</p>
                    </div>
                </div>
            </ClientPortalShell>
        );
    }

    if (!session || !profile) {
        return <Navigate to="/client/login" replace />;
    }

    return <>{children}</>;
}
