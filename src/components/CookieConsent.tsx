import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie } from 'lucide-react';

declare global {
    interface Window {
        gtag?: (...args: unknown[]) => void;
    }
}

const CONSENT_KEY = 'clerktree_cookie_consent';

interface ConsentState {
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
    timestamp: string;
}

export default function CookieConsent() {
    const [visible, setVisible] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [analytics, setAnalytics] = useState(true);
    const [marketing, setMarketing] = useState(true);
    const [animateIn, setAnimateIn] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(CONSENT_KEY);
        if (!stored) {
            const timer = setTimeout(() => {
                setVisible(true);
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => setAnimateIn(true));
                });
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const saveConsent = (consent: ConsentState) => {
        localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));

        if (consent.analytics && window.gtag) {
            window.gtag('consent', 'update', { analytics_storage: 'granted' });
        }
        if (consent.marketing && window.gtag) {
            window.gtag('consent', 'update', {
                ad_storage: 'granted',
                ad_user_data: 'granted',
                ad_personalization: 'granted',
            });
        }

        setAnimateIn(false);
        setTimeout(() => setVisible(false), 400);
    };

    const acceptAll = () => {
        saveConsent({
            necessary: true,
            analytics: true,
            marketing: true,
            timestamp: new Date().toISOString(),
        });
    };

    const acceptSelected = () => {
        saveConsent({
            necessary: true,
            analytics,
            marketing,
            timestamp: new Date().toISOString(),
        });
    };

    const rejectAll = () => {
        saveConsent({
            necessary: true,
            analytics: false,
            marketing: false,
            timestamp: new Date().toISOString(),
        });

        if (window.gtag) {
            window.gtag('consent', 'update', {
                analytics_storage: 'denied',
                ad_storage: 'denied',
                ad_user_data: 'denied',
                ad_personalization: 'denied',
            });
        }
    };

    if (!visible) return null;

    return (
        <div
            className={`fixed bottom-0 left-0 right-0 z-[9999] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${animateIn ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
                }`}
        >
            {/* Subtle gradient fade above the banner */}
            <div className="h-16 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

            <div className="bg-[rgb(10,10,10)] border-t border-neutral-800/50">
                <div className="max-w-7xl mx-auto px-6 py-5">
                    {/* Main row */}
                    <div className="flex flex-col md:flex-row md:items-center gap-5">
                        {/* Text */}
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                            <Cookie className="w-5 h-5 text-neutral-500 mt-0.5 flex-shrink-0" />
                            <p className="text-neutral-400 text-sm leading-relaxed">
                                We use cookies to improve your experience and analyze traffic.{' '}
                                <Link
                                    to="/cookie-policy"
                                    className="text-white/70 hover:text-white underline underline-offset-2 decoration-neutral-700 hover:decoration-neutral-500 transition-colors"
                                >
                                    Cookie Policy
                                </Link>
                                {' · '}
                                <Link
                                    to="/privacy-policy"
                                    className="text-white/70 hover:text-white underline underline-offset-2 decoration-neutral-700 hover:decoration-neutral-500 transition-colors"
                                >
                                    Privacy Policy
                                </Link>
                                {!showDetails && (
                                    <>
                                        {' · '}
                                        <button
                                            onClick={() => setShowDetails(true)}
                                            className="text-white/70 hover:text-white underline underline-offset-2 decoration-neutral-700 hover:decoration-neutral-500 transition-colors"
                                        >
                                            Customize
                                        </button>
                                    </>
                                )}
                            </p>
                        </div>

                        {/* Buttons */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                                onClick={rejectAll}
                                className="px-4 py-2 text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
                            >
                                Reject
                            </button>
                            {showDetails && (
                                <button
                                    onClick={acceptSelected}
                                    className="px-4 py-2 text-sm text-neutral-400 hover:text-white border border-neutral-800 hover:border-neutral-700 rounded-lg transition-all duration-200"
                                >
                                    Save
                                </button>
                            )}
                            <button
                                onClick={acceptAll}
                                className="px-5 py-2 text-sm font-medium text-black bg-white hover:bg-neutral-200 rounded-lg transition-colors duration-200"
                            >
                                Accept
                            </button>
                        </div>
                    </div>

                    {/* Expandable preferences */}
                    {showDetails && (
                        <div className="mt-5 pt-5 border-t border-neutral-800/50 grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {/* Necessary */}
                            <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-lg bg-neutral-900/50">
                                <div>
                                    <p className="text-sm text-white/90 font-medium">Essential</p>
                                    <p className="text-xs text-neutral-600 mt-0.5">Always active</p>
                                </div>
                                <div className="w-9 h-5 bg-neutral-700 rounded-full relative">
                                    <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full" />
                                </div>
                            </div>

                            {/* Analytics */}
                            <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-lg bg-neutral-900/50">
                                <div>
                                    <p className="text-sm text-white/90 font-medium">Analytics</p>
                                    <p className="text-xs text-neutral-600 mt-0.5">Traffic & performance</p>
                                </div>
                                <button
                                    onClick={() => setAnalytics(!analytics)}
                                    className={`w-9 h-5 rounded-full relative transition-colors duration-200 ${analytics ? 'bg-white' : 'bg-neutral-800'
                                        }`}
                                >
                                    <div
                                        className={`absolute top-0.5 w-4 h-4 rounded-full transition-all duration-200 ${analytics ? 'right-0.5 bg-black' : 'left-0.5 bg-neutral-600'
                                            }`}
                                    />
                                </button>
                            </div>

                            {/* Marketing */}
                            <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-lg bg-neutral-900/50">
                                <div>
                                    <p className="text-sm text-white/90 font-medium">Marketing</p>
                                    <p className="text-xs text-neutral-600 mt-0.5">Ads & campaigns</p>
                                </div>
                                <button
                                    onClick={() => setMarketing(!marketing)}
                                    className={`w-9 h-5 rounded-full relative transition-colors duration-200 ${marketing ? 'bg-white' : 'bg-neutral-800'
                                        }`}
                                >
                                    <div
                                        className={`absolute top-0.5 w-4 h-4 rounded-full transition-all duration-200 ${marketing ? 'right-0.5 bg-black' : 'left-0.5 bg-neutral-600'
                                            }`}
                                    />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
