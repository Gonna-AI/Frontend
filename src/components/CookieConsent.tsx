import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, ChevronDown, ChevronRight, X, ExternalLink, Check, Info } from 'lucide-react';

declare global {
    interface Window {
        gtag?: (...args: unknown[]) => void;
    }
}

const CONSENT_KEY = 'clerktree_cookie_consent';

interface ConsentState {
    necessary: boolean;
    functional: boolean;
    analytics: boolean;
    marketing: boolean;
    timestamp: string;
}

interface CookieCategory {
    id: keyof Omit<ConsentState, 'timestamp'>;
    title: string;
    description: string;
    locked: boolean;
    defaultOn: boolean;
    cookies: { name: string; provider: string; purpose: string; expiry: string }[];
}

const COOKIE_CATEGORIES: CookieCategory[] = [
    {
        id: 'necessary',
        title: 'Strictly Necessary',
        description:
            'These cookies are essential for the website to function and cannot be switched off. They are usually set in response to actions you take such as logging in, setting your privacy preferences, or filling in forms. Without these cookies, the site cannot function properly.',
        locked: true,
        defaultOn: true,
        cookies: [
            { name: 'sb-access-token', provider: 'Supabase', purpose: 'Authentication session token', expiry: 'Session' },
            { name: 'sb-refresh-token', provider: 'Supabase', purpose: 'Refresh authentication token', expiry: '7 days' },
            { name: 'clerktree_cookie_consent', provider: 'ClerkTree', purpose: 'Stores your cookie consent preferences', expiry: 'Persistent' },
            { name: 'sidebar_state', provider: 'ClerkTree', purpose: 'Remembers sidebar open/close state', expiry: '7 days' },
        ],
    },
    {
        id: 'functional',
        title: 'Functional',
        description:
            'These cookies enable enhanced functionality and personalization, such as remembering your language preference, region, and display settings. If you do not allow these cookies, some or all of these features may not function properly.',
        locked: false,
        defaultOn: true,
        cookies: [
            { name: 'language_pref', provider: 'ClerkTree', purpose: 'Stores your chosen language (EN/DE)', expiry: 'Persistent' },
            { name: 'theme_pref', provider: 'ClerkTree', purpose: 'Stores your theme preference', expiry: 'Persistent' },
        ],
    },
    {
        id: 'analytics',
        title: 'Analytics & Performance',
        description:
            'These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us understand which pages are the most and least popular and see how visitors move around the site. All information these cookies collect is aggregated and anonymous.',
        locked: false,
        defaultOn: true,
        cookies: [
            { name: '_ga', provider: 'Google Analytics', purpose: 'Distinguishes unique users by assigning a randomly generated number', expiry: '2 years' },
            { name: '_ga_*', provider: 'Google Analytics', purpose: 'Maintains session state across page requests', expiry: '2 years' },
            { name: '_gid', provider: 'Google Analytics', purpose: 'Distinguishes users for analytics purposes', expiry: '24 hours' },
            { name: '_gat', provider: 'Google Analytics', purpose: 'Limits the request rate to Google Analytics', expiry: '1 minute' },
        ],
    },
    {
        id: 'marketing',
        title: 'Marketing & Advertising',
        description:
            'These cookies may be set through our site by our advertising partners. They are used to build a profile of your interests and show you relevant advertisements on other sites. They do not directly store personal information but uniquely identify your browser and device.',
        locked: false,
        defaultOn: false,
        cookies: [
            { name: 'NID', provider: 'Google', purpose: 'Stores visitor preferences and personalizes ads on Google sites', expiry: '6 months' },
            { name: '_gcl_au', provider: 'Google Ads', purpose: 'Stores and tracks conversions from ad clicks', expiry: '90 days' },
            { name: '__cf_bm', provider: 'Cloudflare', purpose: 'Bot management and security filtering', expiry: '30 minutes' },
        ],
    },
];

/* ─── Checkbox Control ─── */
function Checkbox({
    checked,
    disabled,
    onChange,
    id
}: {
    checked: boolean;
    disabled?: boolean;
    onChange?: () => void;
    id: string;
}) {
    return (
        <div className="relative flex items-center">
            <input
                type="checkbox"
                id={id}
                checked={checked}
                disabled={disabled}
                onChange={onChange}
                className="peer sr-only"
            />
            <label
                htmlFor={id}
                className={`
          flex h-5 w-5 items-center justify-center rounded border transition-colors cursor-pointer
          ${disabled ? 'cursor-not-allowed opacity-50' : ''}
          ${checked
                        ? 'bg-white border-white text-black'
                        : 'bg-transparent border-neutral-600 hover:border-neutral-400'
                    }
        `}
            >
                {checked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
            </label>
        </div>
    );
}

/* ─── Accordion Category ─── */
function CategoryAccordion({
    cat,
    checked,
    expanded,
    onToggle,
    onExpand,
}: {
    cat: CookieCategory;
    checked: boolean;
    expanded: boolean;
    onToggle: () => void;
    onExpand: () => void;
}) {
    return (
        <div className="border border-neutral-800/60 rounded-xl overflow-hidden bg-neutral-900/20 transition-colors duration-200 hover:border-neutral-700/60">
            {/* Header Row */}
            <div className="flex items-center gap-3 px-4 py-3 sm:px-5 sm:py-4 select-none">
                {/* Expand arrow */}
                <button
                    type="button"
                    onClick={onExpand}
                    className="p-1 -ml-1 text-neutral-500 hover:text-neutral-300 transition-colors flex-shrink-0"
                    aria-label={expanded ? 'Collapse' : 'Expand'}
                >
                    {expanded ? (
                        <ChevronDown className="w-5 h-5" />
                    ) : (
                        <ChevronRight className="w-5 h-5" />
                    )}
                </button>

                {/* Title + count */}
                <div
                    onClick={onExpand}
                    className="flex-1 text-left flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-w-0 cursor-pointer"
                >
                    <span className="text-sm font-medium text-white">{cat.title}</span>
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] text-neutral-500 font-mono hidden sm:inline-block">
                            {cat.cookies.length} cookie{cat.cookies.length !== 1 ? 's' : ''}
                        </span>
                        {cat.locked && (
                            <span className="text-[10px] text-neutral-400 bg-neutral-800 border border-neutral-700 px-1.5 py-0.5 roundedElement font-medium tracking-wide uppercase">
                                Required
                            </span>
                        )}
                    </div>
                </div>

                {/* Checkbox */}
                <Checkbox
                    id={`cookie-cat-${cat.id}`}
                    checked={checked}
                    disabled={cat.locked}
                    onChange={cat.locked ? undefined : onToggle}
                />
            </div>

            {/* Expanded content */}
            <div
                className={`grid transition-all duration-300 ease-in-out ${expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
            >
                <div className="overflow-hidden">
                    <div className="px-4 pb-4 pt-0 sm:px-5 sm:pb-5 space-y-4">
                        {/* Description */}
                        <p className="text-xs text-neutral-400 leading-relaxed pl-1 sm:pl-8 border-l-2 border-neutral-800 ml-1.5 sm:ml-0">
                            {cat.description}
                        </p>

                        {/* Cookie table */}
                        <div className="sm:ml-8 rounded-lg border border-neutral-800/40 overflow-hidden overflow-x-auto">
                            <table className="w-full text-xs min-w-[500px]">
                                <thead>
                                    <tr className="bg-neutral-900/80 border-b border-neutral-800">
                                        <th className="text-left px-3 py-2 text-neutral-500 font-medium w-1/4">Name</th>
                                        <th className="text-left px-3 py-2 text-neutral-500 font-medium w-1/4">Provider</th>
                                        <th className="text-left px-3 py-2 text-neutral-500 font-medium w-1/3">Purpose</th>
                                        <th className="text-left px-3 py-2 text-neutral-500 font-medium w-1/6">Expiry</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-800/50">
                                    {cat.cookies.map((c) => (
                                        <tr key={c.name} className="hover:bg-white/[0.02]">
                                            <td className="px-3 py-2 font-mono text-neutral-300 break-words">{c.name}</td>
                                            <td className="px-3 py-2 text-neutral-400">{c.provider}</td>
                                            <td className="px-3 py-2 text-neutral-400">{c.purpose}</td>
                                            <td className="px-3 py-2 text-neutral-500">{c.expiry}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─── Main Component ─── */
export default function CookieConsent() {
    const [visible, setVisible] = useState(false);
    const [animateIn, setAnimateIn] = useState(false);
    const [view, setView] = useState<'banner' | 'preferences'>('banner');
    const [expandedCat, setExpandedCat] = useState<string | null>(null);

    // Consent state per category
    const [consent, setConsent] = useState<Record<string, boolean>>(() => {
        const defaults: Record<string, boolean> = {};
        COOKIE_CATEGORIES.forEach((c) => {
            defaults[c.id] = c.defaultOn;
        });
        return defaults;
    });

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
        // Logic to re-apply consent if needed could go here
    }, []);

const [gtagLoaded, setGtagLoaded] = useState(false);

    const loadGtag = () => {
        if (gtagLoaded) return;

        const script = document.createElement('script');
        script.src = 'https://www.googletagmanager.com/gtag/js?id=G-PXQGKPVN8H';
        script.async = true;
        document.head.appendChild(script);

        script.onload = () => {
            window.dataLayer = window.dataLayer || [];
            function gtag() { dataLayer.push(arguments); }
            gtag('js', new Date());
            gtag('config', 'G-PXQGKPVN8H');
            setGtagLoaded(true);
        };
    };
    
    const dismiss = useCallback(() => {
        setAnimateIn(false);
        setTimeout(() => setVisible(false), 400);
    }, []);

    const persistConsent = useCallback(
        (state: Record<string, boolean>) => {
            const full: ConsentState = {
                necessary: true,
                functional: state.functional ?? true,
                analytics: state.analytics ?? false,
                marketing: state.marketing ?? false,
                timestamp: new Date().toISOString(),
            };

            try {
                localStorage.setItem(CONSENT_KEY, JSON.stringify(full));

                if (full.analytics) {
                    loadGtag();
                }

                // Update Google Analytics consent
                if (typeof window !== 'undefined' && window.gtag) {
                    window.gtag('consent', 'update', {
                        analytics_storage: full.analytics ? 'granted' : 'denied',
                        ad_storage: full.marketing ? 'granted' : 'denied',
                        ad_user_data: full.marketing ? 'granted' : 'denied',
                        ad_personalization: full.marketing ? 'granted' : 'denied',
                        functionality_storage: full.functional ? 'granted' : 'denied',
                    });
                    console.log('Consent updated:', full);
                }
            } catch (e) {
                console.error('Failed to save consent:', e);
            }

            dismiss();
        },
        [dismiss, gtagLoaded]
    );

    const acceptAll = useCallback(() => {
        const all: Record<string, boolean> = {};
        COOKIE_CATEGORIES.forEach((c) => {
            all[c.id] = true;
        });
        persistConsent(all);
    }, [persistConsent]);

    const rejectAll = useCallback(() => {
        const minimal: Record<string, boolean> = {};
        COOKIE_CATEGORIES.forEach((c) => {
            minimal[c.id] = c.locked;
        });
        persistConsent(minimal);
    }, [persistConsent]);

    const savePreferences = useCallback(() => {
        persistConsent(consent);
    }, [consent, persistConsent]);

    if (!visible) return null;

    return (
        <div
            className={`fixed inset-0 z-[9999] flex items-end sm:items-center justify-center isolate pointer-events-none`}
        >
            {/* ─── BANNER BACKDROP (transparent) ─── */}
            {view === 'banner' && (
                <div className={`absolute inset-0 transition-opacity duration-500 ${animateIn ? 'opacity-100' : 'opacity-0'}`} />
            )}

            {/* ─── PREFERENCES BACKDROP (Solid) ─── */}
            {view === 'preferences' && (
                <div
                    className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-500 pointer-events-auto ${animateIn ? 'opacity-100' : 'opacity-0'
                        }`}
                    onClick={() => setView('banner')}
                />
            )}

            {/* ─── BANNER VIEW ─── */}
            {view === 'banner' && (
                <div
                    className={`
            pointer-events-auto w-full absolute bottom-0 left-0 right-0 
            transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] transform
            ${animateIn ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
          `}
                >
                    {/* Top Fade */}
                    <div className="h-12 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

                    <div className="bg-[rgb(10,10,10)] border-t border-neutral-800/80 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 sm:py-5">
                            <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8">
                                {/* Text Content */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2 text-white font-medium">
                                        <Cookie className="w-4 h-4" />
                                        <span>Cookie Preferences</span>
                                    </div>
                                    <p className="text-neutral-400 text-sm leading-relaxed max-w-3xl">
                                        We use cookies to ensure you get the best experience on our website.
                                        By clicking "Accept All", you consent to our use of cookies.
                                        Manage settings to choose which cookies to allow. {' '}
                                        <Link to="/privacy-policy" className="text-white hover:underline underline-offset-2">
                                            Privacy Policy
                                        </Link>
                                    </p>
                                </div>

                                {/* Banner Actions */}
                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-shrink-0">
                                    <button
                                        onClick={() => setView('preferences')}
                                        className="order-2 sm:order-1 px-4 py-2.5 rounded-lg border border-neutral-700 hover:border-neutral-500 text-neutral-300 hover:text-white text-sm font-medium transition-colors"
                                    >
                                        Preferences
                                    </button>
                                    <button
                                        onClick={rejectAll}
                                        className="order-3 sm:order-2 px-4 py-2.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white text-sm font-medium transition-colors"
                                    >
                                        Reject All
                                    </button>
                                    <button
                                        onClick={acceptAll}
                                        className="order-1 sm:order-3 px-6 py-2.5 rounded-lg bg-white hover:bg-neutral-200 text-black text-sm font-medium transition-colors shadow-lg shadow-white/5"
                                    >
                                        Accept All
                                    </button>
                                </div>
                            </div>
                        </div>
                        {/* Safe Area for Mobile Home Indicator */}
                        <div className="h-[env(safe-area-inset-bottom)] bg-[rgb(10,10,10)]" />
                    </div>
                </div>
            )}

            {/* ─── PREFERENCES MODAL VIEW ─── */}
            {view === 'preferences' && (
                <div
                    className={`
            pointer-events-auto relative w-full max-w-2xl mx-auto 
            flex flex-col bg-[rgb(12,12,12)] border border-neutral-800/80 shadow-2xl shadow-black
            rounded-t-2xl sm:rounded-2xl overflow-hidden
            max-h-[90vh] sm:max-h-[85vh] h-[90vh] sm:h-auto
            transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] transform
            ${animateIn ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-8 scale-95 opacity-0'}
          `}
                >
                    {/* Modal Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-[rgb(12,12,12)] z-10 shrink-0">
                        <div>
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Cookie className="w-5 h-5" />
                                Cookie Preferences
                            </h2>
                        </div>
                        <button
                            onClick={() => setView('banner')}
                            className="p-2 -mr-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-full transition-colors"
                            aria-label="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Modal Body (Scrollable) */}
                    <div className="flex-1 overflow-y-auto px-5 py-2 custom-scrollbar overscroll-contain">
                        <div className="py-4 space-y-6">
                            <div className="bg-neutral-900/30 p-4 rounded-xl border border-neutral-800/50">
                                <p className="text-sm text-neutral-400 leading-relaxed">
                                    Customise your preferences for cookies and similar technologies.
                                    We respect your privacy and give you control over which cookies you accept.
                                    Some are essential for the site to work, while others help us improve your experience.
                                </p>
                                <div className="mt-3 flex gap-4 text-xs">
                                    <Link to="/privacy-policy" className="flex items-center gap-1 text-white hover:text-neutral-300 transition-colors">
                                        Privacy Policy <ExternalLink className="w-3 h-3" />
                                    </Link>
                                    <Link to="/cookie-policy" className="flex items-center gap-1 text-white hover:text-neutral-300 transition-colors">
                                        Cookie Policy <ExternalLink className="w-3 h-3" />
                                    </Link>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {COOKIE_CATEGORIES.map((cat) => (
                                    <CategoryAccordion
                                        key={cat.id}
                                        cat={cat}
                                        checked={cat.locked ? true : (consent[cat.id] ?? cat.defaultOn)}
                                        expanded={expandedCat === cat.id}
                                        onToggle={() =>
                                            setConsent((prev) => ({ ...prev, [cat.id]: !prev[cat.id] }))
                                        }
                                        onExpand={() =>
                                            setExpandedCat((prev) => (prev === cat.id ? null : cat.id))
                                        }
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Modal Footer (Fixed) */}
                    <div className="p-4 sm:px-6 sm:py-5 border-t border-neutral-800 bg-[rgb(12,12,12)] shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))]">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={rejectAll}
                                className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-neutral-700 hover:border-neutral-500 text-neutral-400 hover:text-white font-medium transition-colors text-sm"
                            >
                                Reject All
                            </button>
                            <div className="flex-1 hidden sm:block" />
                            <button
                                onClick={savePreferences}
                                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-medium transition-colors text-sm"
                            >
                                Save Preferences
                            </button>
                            <button
                                onClick={acceptAll}
                                className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-white hover:bg-neutral-200 text-black font-medium transition-colors shadow-lg shadow-white/10 text-sm"
                            >
                                Accept All
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
