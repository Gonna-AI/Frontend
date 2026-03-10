import React, { useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { sanitizeTrustedHtml } from '../../utils/sanitizeHtml';
import cookiePolicyHtml from '../../terms&conditions/cookiepolicy.html?raw';
import SharedHeader from '../Layout/SharedHeader';
import { cn } from '../../lib/utils';

const CookiePolicy = () => {
    const sanitizedCookiePolicyHtml = useMemo(() => sanitizeTrustedHtml(cookiePolicyHtml), []);

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#0A0A0A] text-white">
            <SharedHeader />

            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute left-[-12rem] top-[18rem] h-[28rem] w-[28rem] rounded-full bg-[#FF8A5B]/8 blur-[140px]" />
                <div className="absolute right-[-10rem] top-[10rem] h-[24rem] w-[24rem] rounded-full bg-white/6 blur-[120px]" />
                <div className="absolute bottom-[-8rem] left-1/2 h-[24rem] w-[40rem] -translate-x-1/2 rounded-full bg-[#FF8A5B]/6 blur-[120px]" />
                <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'url(/noise.webp)', backgroundSize: '35%' }} />
            </div>

            <main className="relative z-10 px-4 pb-16 pt-28 sm:px-6 sm:pt-32 lg:px-8">
                <div className="mx-auto max-w-5xl space-y-8">
                    <div className="space-y-4">
                        <button
                            onClick={() => window.history.back()}
                            className={cn(
                                "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60 transition-all hover:border-white/20 hover:text-white"
                            )}
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </button>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#FF8A5B] sm:text-sm">Legal</p>
                            <h1 className="mt-4 text-balance text-[2.2rem] font-semibold tracking-[-0.05em] text-white sm:text-4xl md:text-5xl">
                                Cookie Policy
                            </h1>
                            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/60 sm:text-base sm:leading-8">
                                Understand how cookies and similar technologies are used to power, improve, and secure ClerkTree.
                            </p>
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[linear-gradient(145deg,#141414_0%,#0C0C0C_100%)] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.45)] sm:rounded-[2rem] sm:p-10">
                        <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_top,rgba(255,138,91,0.12),transparent)]" />
                        <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'url(/noise.webp)', backgroundSize: '30%' }} />
                        <style>{`
                          .legal-content { color: rgba(255,255,255,0.72); font-size: 0.95rem; line-height: 1.8; }
                          .legal-content h1, .legal-content h2, .legal-content h3, .legal-content h4 { color: #ffffff !important; font-weight: 600; }
                          .legal-content h1 { font-size: 1.9rem; margin-top: 1.6rem; margin-bottom: 0.8rem; }
                          .legal-content h2 { font-size: 1.5rem; margin-top: 1.4rem; margin-bottom: 0.6rem; }
                          .legal-content h3 { font-size: 1.2rem; margin-top: 1.2rem; margin-bottom: 0.5rem; }
                          .legal-content p, .legal-content span, .legal-content li { color: rgba(255,255,255,0.68) !important; }
                          .legal-content a { color: #FFB286 !important; text-decoration: underline; text-underline-offset: 4px; }
                          .legal-content strong { color: #ffffff !important; }
                          .legal-content ul, .legal-content ol { padding-left: 1.25rem; margin-top: 0.6rem; margin-bottom: 0.8rem; }
                          .legal-content li { margin-bottom: 0.4rem; }
                          .legal-content hr { border-color: rgba(255,255,255,0.12); margin: 1.5rem 0; }
                          .legal-content table { width: 100%; border-collapse: collapse; margin: 1.2rem 0; }
                          .legal-content th, .legal-content td { border: 1px solid rgba(255,255,255,0.12); padding: 0.6rem 0.75rem; vertical-align: top; }
                          .legal-content th { color: #ffffff !important; background: rgba(255,255,255,0.05); text-align: left; }
                        `}</style>
                        <div
                            className="legal-content relative z-10 max-w-none"
                            dangerouslySetInnerHTML={{ __html: sanitizedCookiePolicyHtml }}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CookiePolicy;
