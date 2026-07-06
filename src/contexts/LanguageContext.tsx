import React, { createContext, useContext, useEffect, useState } from 'react';
import { en } from '../i18n/en';
import { enDashboardShell } from '../i18n/en/dashboard-shell';
import { enDashboardDefault } from '../i18n/en/dashboard-default';
import { enDashboardAnalytics } from '../i18n/en/dashboard-analytics';
import { enDashboardAnalyticsV1 } from '../i18n/en/dashboard-analytics-v1';
import { enDashboardCrm } from '../i18n/en/dashboard-crm';
import { enDashboardFinance } from '../i18n/en/dashboard-finance';
import { enDashboardEcommerce } from '../i18n/en/dashboard-ecommerce';
import { enDashboardAcademy } from '../i18n/en/dashboard-academy';
import { enDashboardLogistics } from '../i18n/en/dashboard-logistics';
import { enDashboardInfrastructure } from '../i18n/en/dashboard-infrastructure';
import { enDashboardProductivity } from '../i18n/en/dashboard-productivity';
import { enDashboardCalendar } from '../i18n/en/dashboard-calendar';
import { enDashboardKanban } from '../i18n/en/dashboard-kanban';
import { enDashboardTasks } from '../i18n/en/dashboard-tasks';
import { enDashboardInvoice } from '../i18n/en/dashboard-invoice';
import { enDashboardUsers } from '../i18n/en/dashboard-users';
import { enDashboardRoles } from '../i18n/en/dashboard-roles';
import { enDashboardMail } from '../i18n/en/dashboard-mail';
import { enDashboardChat } from '../i18n/en/dashboard-chat';
import { enMarketingExtra } from '../i18n/en/marketing-extra';

type Language = 'en' | 'de';

type LanguageContextType = {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Base translations merged with feature-module translations (e.g. dashboard verticals).
// New modules should be spread in here rather than edited into en.ts/de.ts directly.
const mergedEn = {
    ...en,
    ...enDashboardShell,
    ...enDashboardDefault,
    ...enDashboardAnalytics,
    ...enDashboardAnalyticsV1,
    ...enDashboardCrm,
    ...enDashboardFinance,
    ...enDashboardEcommerce,
    ...enDashboardAcademy,
    ...enDashboardLogistics,
    ...enDashboardInfrastructure,
    ...enDashboardProductivity,
    ...enDashboardCalendar,
    ...enDashboardKanban,
    ...enDashboardTasks,
    ...enDashboardInvoice,
    ...enDashboardUsers,
    ...enDashboardRoles,
    ...enDashboardMail,
    ...enDashboardChat,
    ...enMarketingExtra,
};

async function loadMergedDe() {
    const [
        { de },
        { deDashboardShell },
        { deDashboardDefault },
        { deDashboardAnalytics },
        { deDashboardAnalyticsV1 },
        { deDashboardCrm },
        { deDashboardFinance },
        { deDashboardEcommerce },
        { deDashboardAcademy },
        { deDashboardLogistics },
        { deDashboardInfrastructure },
        { deDashboardProductivity },
        { deDashboardCalendar },
        { deDashboardKanban },
        { deDashboardTasks },
        { deDashboardInvoice },
        { deDashboardUsers },
        { deDashboardRoles },
        { deDashboardMail },
        { deDashboardChat },
        { deMarketingExtra },
    ] = await Promise.all([
        import('../i18n/de'),
        import('../i18n/de/dashboard-shell'),
        import('../i18n/de/dashboard-default'),
        import('../i18n/de/dashboard-analytics'),
        import('../i18n/de/dashboard-analytics-v1'),
        import('../i18n/de/dashboard-crm'),
        import('../i18n/de/dashboard-finance'),
        import('../i18n/de/dashboard-ecommerce'),
        import('../i18n/de/dashboard-academy'),
        import('../i18n/de/dashboard-logistics'),
        import('../i18n/de/dashboard-infrastructure'),
        import('../i18n/de/dashboard-productivity'),
        import('../i18n/de/dashboard-calendar'),
        import('../i18n/de/dashboard-kanban'),
        import('../i18n/de/dashboard-tasks'),
        import('../i18n/de/dashboard-invoice'),
        import('../i18n/de/dashboard-users'),
        import('../i18n/de/dashboard-roles'),
        import('../i18n/de/dashboard-mail'),
        import('../i18n/de/dashboard-chat'),
        import('../i18n/de/marketing-extra'),
    ]);

    return {
        ...de,
        ...deDashboardShell,
        ...deDashboardDefault,
        ...deDashboardAnalytics,
        ...deDashboardAnalyticsV1,
        ...deDashboardCrm,
        ...deDashboardFinance,
        ...deDashboardEcommerce,
        ...deDashboardAcademy,
        ...deDashboardLogistics,
        ...deDashboardInfrastructure,
        ...deDashboardProductivity,
        ...deDashboardCalendar,
        ...deDashboardKanban,
        ...deDashboardTasks,
        ...deDashboardInvoice,
        ...deDashboardUsers,
        ...deDashboardRoles,
        ...deDashboardMail,
        ...deDashboardChat,
        ...deMarketingExtra,
    };
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>('en');
    const [translations, setTranslations] = useState<Record<string, Record<string, string>>>({ en: mergedEn });

    useEffect(() => {
        // Check URL params first
        const params = new URLSearchParams(window.location.search);
        const urlLang = params.get('lang') as Language;

        const loadLanguage = async (lang: Language) => {
            if (lang === 'de' && !translations.de) {
                try {
                    const merged = await loadMergedDe();
                    setTranslations(prev => ({ ...prev, de: merged }));
                } catch (error) {
                    console.error('Failed to load German translations', error);
                }
            }
            setLanguageState(lang);
            localStorage.setItem('app-language', lang);
            document.documentElement.lang = lang;
        };

        if (urlLang === 'en' || urlLang === 'de') {
            loadLanguage(urlLang);
        } else {
            // Fallback to local storage
            const savedLang = localStorage.getItem('app-language') as Language;
            if (savedLang === 'en' || savedLang === 'de') {
                loadLanguage(savedLang);
            } else {
                loadLanguage('de'); // Changed default to German
            }
        }
    }, []);

    const setLanguage = async (lang: Language) => {
        if (lang === 'de' && !translations.de) {
            try {
                const merged = await loadMergedDe();
                setTranslations(prev => ({ ...prev, de: merged }));
            } catch (error) {
                console.error('Failed to load German translations', error);
                return;
            }
        }

        setLanguageState(lang);
        localStorage.setItem('app-language', lang);
        document.documentElement.lang = lang;
        window.dispatchEvent(new CustomEvent('language-change', { detail: lang }));
    };

    const t = (key: string): string => {
        const langTrans = translations[language];
        if (!langTrans) return key; // Fallback if somehow language is set but translations not loaded
        return langTrans[key] || translations['en'][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
