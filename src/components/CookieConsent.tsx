import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, ChevronDown, ChevronRight, X, ExternalLink } from 'lucide-react';

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

/* ─── Toggle Switch ─── */
function Toggle({
    checked,
    disabled,
    onChange,
}: {
    checked: boolean;
    disabled?: boolean;
    onChange?: () => void;
}) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={onChange}
            className={`
        relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent
        transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30
        ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}
        ${checked ? 'bg-white' : 'bg-neutral-800'}
      `}
        >
            <span
                className={`
          pointer-events-none inline-block h-5 w-5 rounded-full shadow-lg
          transform transition-transform duration-200 ease-in-out
          ${checked ? 'translate-x-5 bg-black' : 'translate-x-0 bg-neutral-600'}
        `}
            />
        </button>
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
        <div className="border border-neutral-800/60 rounded-xl overflow-hidden transition-colors duration-200 hover:border-neutral-700/60">
            {/* Header Row */}
            <div className="flex items-center gap-3 px-5 py-4">
                {/* Expand arrow */}
                <button
                    type="button"
                    onClick={onExpand}
                    className="text-neutral-500 hover:text-neutral-300 transition-colors flex-shrink-0"
                    aria-label={expanded ? 'Collapse' : 'Expand'}
                >
                    {expanded ? (
                        <ChevronDown className="w-4 h-4" />
                    ) : (
                        <ChevronRight className="w-4 h-4" />
                    )}
                </button>

                {/* Title + count */}
                <button
                    type="button"
                    onClick={onExpand}
                    className="flex-1 text-left flex items-center gap-3 min-w-0"
                >
                    <span className="text-sm font-medium text-white">{cat.title}</span>
                    <span className="text-[11px] text-neutral-600 font-mono">
                        {cat.cookies.length} cookie{cat.cookies.length !== 1 ? 's' : ''}
                    </span>
                    {cat.locked && (
                        <span className="text-[10px] text-neutral-500 bg-neutral-900 px-2 py-0.5 rounded-full font-medium tracking-wide uppercase">
                            Required
                        </span>
                    )}
                </button>

                {/* Toggle */}
                <Toggle checked={checked} disabled={cat.locked} onChange={cat.locked ? undefined : onToggle} />
            </div>

            {/* Expanded content */}
            {expanded && (
                <div className="px-5 pb-5 pt-0 space-y-4">
                    {/* Description */}
                    <p className="text-xs text-neutral-500 leading-relaxed pl-7">
                        {cat.description}
                    </p>

                    {/* Cookie table */}
                    <div className="ml-7 rounded-lg border border-neutral-800/40 overflow-hidden">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="bg-neutral-900/80">
                                    <th className="text-left px-3 py-2 text-neutral-600 font-medium">Cookie</th>
                                    <th className="text-left px-3 py-2 text-neutral-600 font-medium hidden sm:table-cell">Provider</th>
                                    <th className="text-left px-3 py-2 text-neutral-600 font-medium">Purpose</th>
                                    <th className="text-left px-3 py-2 text-neutral-600 font-medium hidden sm:table-cell">Expiry</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cat.cookies.map((c, i) => (
                                    <tr
                                        key={c.name}
                                        className={`${i > 0 ? 'border-t border-neutral-800/30' : ''}`}
                                    >
                                        <td className="px-3 py-2 font-mono text-neutral-400">{c.name}</td>
                                        <td className="px-3 py-2 text-neutral-500 hidden sm:table-cell">{c.provider}</td>
                                        <td className="px-3 py-2 text-neutral-500">{c.purpose}</td>
                                        <td className="px-3 py-2 text-neutral-600 hidden sm:table-cell">{c.expiry}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
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
    }, []);

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
            localStorage.setItem(CONSENT_KEY, JSON.stringify(full));

            // Update Google Analytics consent
            if (window.gtag) {
                window.gtag('consent', 'update', {
                    analytics_storage: full.analytics ? 'granted' : 'denied',
                    ad_storage: full.marketing ? 'granted' : 'denied',
                    ad_user_data: full.marketing ? 'granted' : 'denied',
                    ad_personalization: full.marketing ? 'granted' : 'denied',
                    functionality_storage: full.functional ? 'granted' : 'denied',
                });
            }

            dismiss();
        },
        [dismiss]
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
            className={`fixed inset-0 z-[9999] flex items-end justify-center transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${animateIn ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
        >
            {/* Backdrop (only in preferences view) */}
            {view === 'preferences' && (
                <div
                    className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${animateIn ? 'opacity-100' : 'opacity-0'
                        }`}
                    onClick={() => setView('banner')}
                />
            )}

            {/* ─── BANNER VIEW ─── */}
            {view === 'banner' && (
                <div
                    className={`w-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${animateIn ? 'translate-y-0' : 'translate-y-full'
                        }`}
                >
                    <div className="bg-[rgb(10,10,10)] border-t border-neutral-800/50">
                        <div className="max-w-7xl mx-auto px-6 py-5">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                {/* Icon + Text */}
                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                    <Cookie className="w-5 h-5 text-neutral-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-neutral-400 text-sm leading-relaxed">
                                        We use cookies and similar technologies to enhance your experience, analyze
                                        traffic, and personalize content. You can choose which cookies to accept.{' '}
                                        <Link
                                            to="/privacy-policy"
                                            className="text-white/60 hover:text-white underline underline-offset-2 decoration-neutral-700 transition-colors inline-flex items-center gap-1"
                                        >
                                            Privacy Policy
                                            <ExternalLink className="w-3 h-3" />
                                        </Link>
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 flex-shrink-0 pl-8 sm:pl-0">
                                    <button
                                        onClick={rejectAll}
                                        className="px-4 py-2.5 text-sm text-neutral-500 hover:text-neutral-300 transition-colors whitespace-nowrap"
                                    >
                                        Reject all
                                    </button>
                                    <button
                                        onClick={() => setView('preferences')}
                                        className="px-4 py-2.5 text-sm text-neutral-300 hover:text-white border border-neutral-800 hover:border-neutral-600 rounded-lg transition-all duration-200 whitespace-nowrap"
                                    >
                                        Preferences
                                    </button>
                                    <button
                                        onClick={acceptAll}
                                        className="px-5 py-2.5 text-sm font-medium text-black bg-white hover:bg-neutral-200 rounded-lg transition-colors duration-200 whitespace-nowrap"
                                    >
                                        Accept all
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── PREFERENCES VIEW ─── */}
            {view === 'preferences' && (
                <div
                    className={`relative w-full max-w-2xl mx-4 mb-4 sm:mb-8 max-h-[85vh] flex flex-col rounded-2xl overflow-hidden
            bg-[rgb(12,12,12)] border border-neutral-800/60 shadow-2xl shadow-black/70
            transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
            ${animateIn ? 'translate-y-0 scale-100' : 'translate-y-8 scale-95'}
          `}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800/50 flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <Cookie className="w-5 h-5 text-neutral-400" />
                            <div>
                                <h2 className="text-base font-semibold text-white">Cookie Preferences</h2>
                                <p className="text-xs text-neutral-600 mt-0.5">
                                    Manage how we use cookies on this site
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setView('banner')}
                            className="p-2 rounded-lg text-neutral-600 hover:text-neutral-300 hover:bg-neutral-800/50 transition-all"
                            aria-label="Close preferences"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Description */}
                    <div className="px-6 py-4 border-b border-neutral-800/30 flex-shrink-0">
                        <p className="text-sm text-neutral-500 leading-relaxed">
                            When you visit our website, we may store or retrieve information on your browser,
                            mostly in the form of cookies. This information might be about you, your preferences,
                            or your device and is mostly used to make the site work as you expect it to. The
                            information does not usually directly identify you, but it can give you a more
                            personalized web experience.
                        </p>
                        <div className="flex items-center gap-3 mt-3">
                            <Link
                                to="/cookie-policy"
                                className="text-xs text-neutral-500 hover:text-white underline underline-offset-2 decoration-neutral-700 transition-colors inline-flex items-center gap-1"
                            >
                                Cookie Policy <ExternalLink className="w-3 h-3" />
                            </Link>
                            <Link
                                to="/privacy-policy"
                                className="text-xs text-neutral-500 hover:text-white underline underline-offset-2 decoration-neutral-700 transition-colors inline-flex items-center gap-1"
                            >
                                Privacy Policy <ExternalLink className="w-3 h-3" />
                            </Link>
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 custom-scrollbar">
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

                    {/* Footer Actions */}
                    <div className="px-6 py-4 border-t border-neutral-800/50 flex items-center gap-3 flex-shrink-0 bg-[rgb(10,10,10)]">
                        <button
                            onClick={rejectAll}
                            className="flex-1 px-4 py-2.5 text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
                        >
                            Reject all
                        </button>
                        <button
                            onClick={savePreferences}
                            className="flex-1 px-4 py-2.5 text-sm text-neutral-300 hover:text-white border border-neutral-800 hover:border-neutral-600 rounded-lg transition-all duration-200"
                        >
                            Save preferences
                        </button>
                        <button
                            onClick={acceptAll}
                            className="flex-1 px-5 py-2.5 text-sm font-medium text-black bg-white hover:bg-neutral-200 rounded-lg transition-colors duration-200"
                        >
                            Accept all
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
