import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { ChevronDown, ChevronRight, X, ExternalLink } from 'lucide-react';

declare global {
    interface Window {
        dataLayer: any[];
        gtag?: (...args: any[]) => void;
    }
}

const CONSENT_KEY = 'clerktree_cookie_consent';

interface ConsentState {
    necessary: boolean;
    functional: boolean;
    analytics: boolean;
    marketing: boolean;
    unclassified: boolean;
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
        title: 'cookies.cat.necessary.title',
        description: 'cookies.cat.necessary.desc',
        locked: true,
        defaultOn: true,
        cookies: [
            { name: 'sb-access-token', provider: 'Supabase', purpose: 'Authentication session token', expiry: 'Session' },
            { name: 'sb-refresh-token', provider: 'Supabase', purpose: 'Refresh authentication token', expiry: '7 days' },
            { name: 'clerktree_cookie_consent', provider: 'ClerkTree', purpose: 'Stores your cookie consent preferences', expiry: 'Persistent' },
            { name: 'sidebar_state', provider: 'ClerkTree', purpose: 'Remembers sidebar open/close state', expiry: '7 days' },
            { name: 'clerktree_user_id', provider: 'ClerkTree', purpose: 'Stores active session user ID for demo functionality', expiry: 'Persistent' },
            { name: 'ticketVerification', provider: 'ClerkTree', purpose: 'Stores verification state for secure document access', expiry: 'Session' },
            { name: 'ticketCode', provider: 'ClerkTree', purpose: 'Stores active ticket ID for secure document access', expiry: 'Session' },
            { name: 'chunk_retry_*', provider: 'ClerkTree', purpose: 'Prevents infinite reload loops during application updates', expiry: 'Session' },
        ],
    },
    {
        id: 'functional',
        title: 'cookies.cat.functional.title',
        description: 'cookies.cat.functional.desc',
        locked: false,
        defaultOn: true,
        cookies: [
            { name: 'app-language', provider: 'ClerkTree', purpose: 'Stores your chosen language (EN/DE)', expiry: 'Persistent' },
            { name: 'theme', provider: 'ClerkTree', purpose: 'Stores your application theme preference', expiry: 'Persistent' },
            { name: 'clientChatTheme', provider: 'ClerkTree', purpose: 'Stores theme preference for the client chat window', expiry: 'Persistent' },
            { name: 'clerktree-banner-dismissed', provider: 'ClerkTree', purpose: 'Tracks if the announcement banner was dismissed', expiry: 'Persistent' },
            { name: 'clerktree_seen_welcome', provider: 'ClerkTree', purpose: 'Tracks if the onboarding welcome flow has been completed', expiry: 'Persistent' },
            { name: 'clerktree_knowledge_base', provider: 'ClerkTree', purpose: 'Stores custom AI configuration for the session', expiry: 'Persistent' },
            { name: 'clerktree_groq_settings_*', provider: 'ClerkTree', purpose: 'Stores personalized Groq AI model parameters', expiry: 'Persistent' },
            { name: 'platform_access_banner_dismissed', provider: 'ClerkTree', purpose: 'Tracks if the platform access banner was dismissed', expiry: 'Session' },
        ],
    },
    {
        id: 'analytics',
        title: 'cookies.cat.analytics.title',
        description: 'cookies.cat.analytics.desc',
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
        title: 'cookies.cat.marketing.title',
        description: 'cookies.cat.marketing.desc',
        locked: false,
        defaultOn: false,
        cookies: [
            { name: 'NID', provider: 'Google', purpose: 'Stores visitor preferences and personalizes ads on Google sites', expiry: '6 months' },
            { name: '_gcl_au', provider: 'Google Ads', purpose: 'Stores and tracks conversions from ad clicks', expiry: '90 days' },
            { name: '__cf_bm', provider: 'Cloudflare', purpose: 'Bot management and security filtering', expiry: '30 minutes' },
        ],
    },
    {
        id: 'unclassified',
        title: 'cookies.cat.unclassified.title',
        description: 'cookies.cat.unclassified.desc',
        locked: false,
        defaultOn: false,
        cookies: [
            { name: 'Unknown / pending', provider: 'Various', purpose: 'Pending classification', expiry: 'Unknown' },
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
          flex h-5 w-5 items-center justify-center rounded-full border border-black transition-colors cursor-pointer
          ${disabled ? 'cursor-not-allowed opacity-50' : ''}
          ${checked
                        ? 'bg-black text-black'
                        : 'bg-transparent hover:bg-black/5'
                    }
        `}
            >
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
    t,
}: {
    cat: CookieCategory;
    checked: boolean;
    expanded: boolean;
    onToggle: () => void;
    onExpand: () => void;
    t: (key: string) => string;
}) {
    return (
        <div className="overflow-hidden rounded-[22px] border border-black/20 bg-white/28 transition-colors duration-200 hover:bg-white/38">
            {/* Header Row */}
            <div className="flex items-center gap-3 px-4 py-3 sm:px-5 sm:py-4 select-none">
                {/* Expand arrow */}
                <button
                    type="button"
                    onClick={onExpand}
                    className="p-1 -ml-1 text-black/65 hover:text-black transition-colors flex-shrink-0"
                    aria-label={expanded ? t('common.collapse') || 'Collapse' : t('common.expand') || 'Expand'}
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
                    <span className="text-[15px] font-semibold text-black">{t(cat.title)}</span>
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] text-black/50 font-mono hidden sm:inline-block">
                            {cat.cookies.length} {cat.cookies.length === 1 ? t('cookies.count').replace('{count}', '') : t('cookies.count_plural').replace('{count}', '')}
                        </span>
                        {cat.locked && (
                            <span className="text-[10px] text-black bg-white/65 border border-black/10 px-2 py-0.5 rounded-full font-semibold tracking-wide uppercase">
                                {t('cookies.required')}
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
                        <p className="text-xs text-black/68 leading-relaxed pl-1 sm:pl-8 border-l-2 border-black/18 ml-1.5 sm:ml-0">
                            {t(cat.description)}
                        </p>

                        {/* Cookie table */}
                        <div className="sm:ml-8 rounded-[16px] border border-black/16 bg-white/32 overflow-hidden overflow-x-auto">
                            <table className="w-full text-xs min-w-[500px]">
                                <thead>
                                    <tr className="bg-white/42 border-b border-black/12">
                                        <th className="text-left px-3 py-2 text-black/52 font-semibold w-1/4">{t('cookies.tableName')}</th>
                                        <th className="text-left px-3 py-2 text-black/52 font-semibold w-1/4">{t('cookies.tableProvider')}</th>
                                        <th className="text-left px-3 py-2 text-black/52 font-semibold w-1/3">{t('cookies.tablePurpose')}</th>
                                        <th className="text-left px-3 py-2 text-black/52 font-semibold w-1/6">{t('cookies.tableExpiry')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-black/10">
                                    {cat.cookies.map((c) => (
                                        <tr key={c.name} className="hover:bg-white/24">
                                            <td className="px-3 py-2 font-mono text-black break-words">{c.name}</td>
                                            <td className="px-3 py-2 text-black/68">{c.provider}</td>
                                            <td className="px-3 py-2 text-black/68">{c.purpose}</td>
                                            <td className="px-3 py-2 text-black/56">{c.expiry}</td>
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
    const { t } = useLanguage();
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
            function gtag(..._args: any[]) { window.dataLayer.push(arguments); }
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
                unclassified: state.unclassified ?? false,
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

    const bannerChoices = [
        { id: 'necessary', label: 'Essential', locked: true },
        { id: 'analytics', label: 'Analytics' },
        { id: 'marketing', label: 'Marketing' },
        { id: 'unclassified', label: 'External Media' },
    ] as const;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center isolate pointer-events-none"
        >
            {/* ─── PREFERENCES BACKDROP ─── */}
            {view === 'preferences' && (
                <div
                    className={`absolute inset-0 bg-black/70 transition-opacity duration-500 pointer-events-auto ${animateIn ? 'opacity-100' : 'opacity-0'
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
                    <div className="bg-[#ff4d00] px-5 py-7 text-black shadow-[0_-24px_70px_rgba(0,0,0,0.28)] sm:px-10 sm:py-9">
                        <div className="mx-auto grid max-w-[1440px] gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,460px)] lg:items-end">
                            <div>
                                <h2 className="text-[28px] font-medium leading-none tracking-[-0.03em] sm:text-[34px]">
                                    This website uses cookies
                                </h2>
                                <div className="mt-7 max-w-[860px] space-y-5 text-[13px] leading-[1.25] text-black/82 sm:text-sm">
                                    <p>
                                        We use cookies to provide the best experience on our website. This includes cookies for website
                                        functionality, to manage our commercial objectives and optimization. You can decide which cookie
                                        categories you would like to permit.
                                    </p>
                                    <p>
                                        Please note that depending on your settings, the full functionality of our website may no longer be
                                        available. For more detailed information about our cookies, and to change your preferences at a
                                        later stage, see our{' '}
                                        <Link to="/privacy-policy" className="font-semibold underline underline-offset-2">
                                            privacy policy
                                        </Link>.
                                    </p>
                                </div>

                                <div className="mt-6 grid max-w-[620px] grid-cols-1 gap-x-16 gap-y-3 text-[20px] leading-none sm:grid-cols-2">
                                    {bannerChoices.map((choice) => {
                                        const checked = choice.locked ? true : (consent[choice.id] ?? false);
                                        return (
                                            <button
                                                key={choice.id}
                                                type="button"
                                                onClick={() => {
                                                    if (choice.locked) return;
                                                    setConsent((prev) => ({ ...prev, [choice.id]: !prev[choice.id] }));
                                                }}
                                                className="group inline-flex w-fit items-center gap-3 text-left transition-opacity hover:opacity-72"
                                                aria-pressed={checked}
                                            >
                                                <span
                                                    className={`h-5 w-5 rounded-full border border-black ${checked ? 'bg-black' : 'bg-transparent'}`}
                                                    aria-hidden="true"
                                                />
                                                <span>{choice.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-[13px]">
                                    <Link to="/privacy-policy" className="underline underline-offset-2">
                                        Privacy Policy
                                    </Link>
                                    <Link to="/cookie-policy" className="underline underline-offset-2">
                                        Imprint
                                    </Link>
                                    <button type="button" onClick={() => setView('preferences')} className="underline underline-offset-2">
                                        {t('cookies.preferences')}
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4 lg:pb-10">
                                <button
                                    onClick={acceptAll}
                                    className="min-h-[54px] rounded-full bg-black px-8 text-lg font-semibold text-white transition-transform hover:-translate-y-0.5"
                                >
                                    {t('cookies.acceptAll')}
                                </button>
                                <button
                                    onClick={savePreferences}
                                    className="min-h-[54px] rounded-full bg-white px-8 text-lg font-medium text-black transition-transform hover:-translate-y-0.5"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={rejectAll}
                                    className="text-sm font-medium text-black/62 underline underline-offset-4 transition-colors hover:text-black"
                                >
                                    {t('cookies.rejectAll')}
                                </button>
                            </div>
                        </div>
                        <div className="h-[env(safe-area-inset-bottom)]" />
                    </div>
                </div>
            )}

            {/* ─── PREFERENCES MODAL VIEW ─── */}
            {view === 'preferences' && (
                <div
                    className={`
            pointer-events-auto relative mx-auto flex w-full max-w-5xl flex-col overflow-hidden bg-[#ff4d00] text-black shadow-2xl shadow-black/55
            rounded-t-[28px] sm:rounded-[32px]
            max-h-[92vh] h-[92vh] sm:h-auto sm:max-h-[86vh]
            transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] transform
            ${animateIn ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-8 scale-95 opacity-0'}
          `}
                >
                    {/* Modal Header */}
                    <div className="flex shrink-0 items-start justify-between gap-6 border-b border-black/16 px-5 py-5 sm:px-8 sm:py-7">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-black/54">Cookie Settings</p>
                            <h2 className="mt-4 text-[34px] font-medium leading-none tracking-[-0.045em] sm:text-[52px]">
                                This website uses cookies
                            </h2>
                        </div>
                        <button
                            onClick={() => setView('banner')}
                            className="rounded-full bg-black p-3 text-white transition-transform hover:-translate-y-0.5"
                            aria-label="Close"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Modal Body (Scrollable) */}
                    <div className="flex-1 overflow-y-auto px-5 py-5 custom-scrollbar overscroll-contain sm:px-8 sm:py-6">
                        <div className="space-y-6">
                            <div className="rounded-[24px] bg-white/30 p-5 text-sm leading-relaxed text-black/78 sm:p-6">
                                <p>
                                    {t('cookies.customiseDesc')}
                                </p>
                                <div className="mt-4 flex flex-wrap gap-5 text-sm font-medium">
                                    <Link to="/privacy-policy" className="flex items-center gap-1 underline underline-offset-2">
                                        {t('cookies.privacyPolicy')} <ExternalLink className="w-3 h-3" />
                                    </Link>
                                    <Link to="/cookie-policy" className="flex items-center gap-1 underline underline-offset-2">
                                        {t('cookies.cookiePolicy')} <ExternalLink className="w-3 h-3" />
                                    </Link>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {COOKIE_CATEGORIES.map((cat) => (
                                    <CategoryAccordion
                                        key={cat.id}
                                        cat={cat}
                                        t={t}
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
                    <div className="shrink-0 border-t border-black/16 px-5 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-8">
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <button
                                onClick={rejectAll}
                                className="min-h-[50px] rounded-full border border-black/35 px-6 text-sm font-semibold text-black transition-colors hover:bg-black hover:text-white sm:w-auto"
                            >
                                {t('cookies.rejectAll')}
                            </button>
                            <div className="hidden flex-1 sm:block" />
                            <button
                                onClick={savePreferences}
                                className="min-h-[50px] rounded-full bg-white px-8 text-sm font-semibold text-black transition-transform hover:-translate-y-0.5 sm:w-auto"
                            >
                                {t('cookies.savePreferences')}
                            </button>
                            <button
                                onClick={acceptAll}
                                className="min-h-[50px] rounded-full bg-black px-8 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 sm:w-auto"
                            >
                                {t('cookies.acceptAll')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
