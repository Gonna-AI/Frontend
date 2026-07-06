import React, { createContext, useContext, useEffect, useState } from 'react';
import { en } from '../i18n/en';
import { enDashboardShell } from '../i18n/en/dashboard-shell';
import { deDashboardShell } from '../i18n/de/dashboard-shell';
import { enDashboardCrm } from '../i18n/en/dashboard-crm';
import { deDashboardCrm } from '../i18n/de/dashboard-crm';
import { enDashboardFinance } from '../i18n/en/dashboard-finance';
import { deDashboardFinance } from '../i18n/de/dashboard-finance';
import { enDashboardInvoice } from '../i18n/en/dashboard-invoice';
import { deDashboardInvoice } from '../i18n/de/dashboard-invoice';
import { enDashboardUsers } from '../i18n/en/dashboard-users';
import { deDashboardUsers } from '../i18n/de/dashboard-users';
import { enDashboardRoles } from '../i18n/en/dashboard-roles';
import { deDashboardRoles } from '../i18n/de/dashboard-roles';

type Language = 'en' | 'de';

type LanguageContextType = {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Base translations merged with feature-module translations (e.g. dashboard shell).
// New modules should be spread in here rather than edited into en.ts/de.ts directly.
const mergedEn = { ...en, ...enDashboardShell, ...enDashboardCrm, ...enDashboardFinance };

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>('en');
    const [translations, setTranslations] = useState<Record<string, any>>({ en: mergedEn });

    useEffect(() => {
        // Check URL params first
        const params = new URLSearchParams(window.location.search);
        const urlLang = params.get('lang') as Language;

        const loadLanguage = async (lang: Language) => {
            if (lang === 'de' && !translations.de) {
                try {
                    const module = await import('../i18n/de');
                    setTranslations(prev => ({ ...prev, de: { ...module.de, ...deDashboardShell, ...deDashboardCrm, ...deDashboardFinance } }));
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
                const module = await import('../i18n/de');
                setTranslations(prev => ({ ...prev, de: { ...module.de, ...deDashboardShell } }));
            } catch (error) {
                console.error('Failed to load German translations', error);
                return; // Don't switch if loading fails
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
