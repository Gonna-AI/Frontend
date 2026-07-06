import { ReactNode } from 'react';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import type { ClientAccount } from '../../types/clientPortal';
import ClerkTreeLogo from '../Brand/ClerkTreeLogo';

interface ClientPortalShellProps {
    children: ReactNode;
    account?: ClientAccount | null;
    headerBadge?: string;
    onSignOut?: (() => void | Promise<void>) | null;
    className?: string;
}

export default function ClientPortalShell({
    children,
    account,
    headerBadge = 'Client portal',
    onSignOut = null,
    className,
}: ClientPortalShellProps) {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen overflow-x-hidden bg-[rgb(10,10,10)] font-urbanist text-white selection:bg-[#FF4D00]/30">
            <div className="pointer-events-none fixed inset-0 z-0 bg-[rgb(10,10,10)]">
                <div
                    className="absolute right-[-10%] top-[-12%] h-[90%] w-[78%]"
                    style={{
                        background: 'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 30%, transparent 62%)',
                        filter: 'blur(40px)',
                    }}
                />
                <div
                    className="absolute inset-0"
                    style={{
                        background: 'linear-gradient(215deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.02) 42%, transparent 68%)',
                    }}
                />
                <div
                    className="absolute bottom-[-12rem] left-[-8rem] h-[28rem] w-[28rem] opacity-30 md:h-[40rem] md:w-[40rem]"
                    style={{
                        background: 'radial-gradient(circle, rgba(255,138,91,0.42) 0%, rgba(255,138,91,0.14) 42%, transparent 100%)',
                        filter: 'blur(90px)',
                    }}
                />
                <div
                    className="absolute inset-0 opacity-[0.06]"
                    style={{ backgroundImage: 'url(/noise.webp)', backgroundSize: '35%' }}
                />
                <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/80 via-black/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black" />
            </div>

            <header className="fixed left-1/2 top-4 z-40 w-[95%] max-w-[1400px] -translate-x-1/2 rounded-[50px] border border-white/10 bg-[#1a1a1a]/55 px-5 py-3 shadow-2xl backdrop-blur-xl md:top-6 md:rounded-[70px] md:px-8 md:py-4">
                <div className="flex items-center justify-between gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 md:gap-3"
                        aria-label="Go to ClerkTree home"
                    >
                        <ClerkTreeLogo
                            markClassName="h-8 w-8 text-white md:h-11 md:w-11"
                            labelClassName="text-lg font-semibold tracking-tight text-white/90 md:text-[28px]"
                        />
                    </button>

                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/60 md:px-4">
                            {headerBadge}
                        </div>

                        {account ? (
                            <div className="hidden items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2 sm:flex">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white px-2">
                                    <img src={account.logo_url} alt={`${account.name} logo`} className="h-6 w-auto max-w-full object-contain" />
                                </div>
                                <div className="hidden lg:block">
                                    <p className="text-sm font-semibold leading-none text-white">{account.name}</p>
                                    <p className="mt-1 text-[11px] uppercase tracking-[0.24em] text-white/45">Workspace</p>
                                </div>
                            </div>
                        ) : null}

                        {onSignOut ? (
                            <button
                                type="button"
                                onClick={() => void onSignOut()}
                                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-[#FFEEE8]"
                            >
                                <LogOut className="h-4 w-4" />
                                <span className="hidden sm:inline">Sign out</span>
                            </button>
                        ) : null}
                    </div>
                </div>
            </header>

            <main className={cn('relative z-10 px-4 pb-12 pt-28 sm:px-6 lg:px-8 lg:pt-32', className)}>
                {children}
            </main>
        </div>
    );
}
