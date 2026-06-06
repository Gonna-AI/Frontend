import { ReactNode } from 'react';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import type { ClientAccount } from '../../types/clientPortal';

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
                        <svg viewBox="0 0 464 468" className="h-8 w-8 md:h-11 md:w-11">
                            <path fill="white" d="M275.9 63.5c37.7 5.3 76.6 24.1 103.7 50.2 30 28.8 41.8 57.6 35.8 87.1-6.1 30.1-33.6 52.9-70.6 58.3-6 0.9-18.3 1-44.9 0.6l-36.6-0.7-0.5 17.8c-0.3 9.7-0.4 17.8-0.4 17.9 0.1 0.1 19.1 0.3 42.2 0.4 23.2 0 42.7 0.5 43.5 1 1.2 0.7 1.1 2.2-0.8 9.4-6 23-20.5 42.1-41.8 55-7.3 4.3-26.7 11.9-36 14.1-9 2-34 2-44.5 0-41.3-7.9-74.2-38-82.9-75.7-8.1-35.7 2.2-71.5 27.5-94.7 16.1-14.9 35.5-22.4 63.7-24.7l7.7-0.7v-34.1l-11.7 0.7c-22.2 1.3-37 5.3-56.4 15.2-28.7 14.6-49.7 39.3-59.9 70.2-9.6 29.3-9.3 62.6 0.8 91.4 3.3 9.2 12.2 25.6 18.3 33.8 11.3 14.9 30.6 30.8 48.7 39.9 19.9 10 49.2 15.9 73.2 14.7 26.5-1.3 52.5-9.6 74.2-23.9 26.9-17.6 47.2-47.9 53.3-79.7 1-5.2 2.3-10.1 2.8-10.8 0.8-0.9 6.9-1.2 27.1-1l26.1 0.3 0.3 3.8c1.2 14.6-10.9 52.1-23.9 74-17.8 30-43.2 54-75.9 71.5-20.9 11.2-38.3 16.5-67.2 20.7-27.6 3.9-47.9 3.1-75.8-3.1-36.9-8.3-67.8-25.6-97.1-54.6-23.6-23.2-44.8-61.9-51.7-93.8-5.1-23.7-5.5-28.1-4.9-48.8 1.7-63.2 23.4-111.8 67.7-152 28-25.4 60.4-41.3 99-48.8 18.5-3.6 46.1-4 67.9-0.9zm16.4 92.6c-6.3 2.4-12.8 8.5-15.4 14.5-2.6 6.1-2.6 18.3 0 23.9 5 11 20.2 17.7 32.3 14.1 11.9-3.4 19.8-14.3 19.8-27.1-0.1-19.9-18.2-32.5-36.7-25.4z" />
                        </svg>
                        <span className="text-lg font-semibold tracking-tight text-white/90 md:text-[28px]">ClerkTree</span>
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
