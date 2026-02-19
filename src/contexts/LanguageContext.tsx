import React, { createContext, useContext, useEffect, useState } from 'react';
import { en } from '../i18n/en';

type Language = 'en' | 'de';

type LanguageContextType = {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>('en');
    const [translations, setTranslations] = useState<Record<string, any>>({ en });

    useEffect(() => {
        // Check URL params first
        const params = new URLSearchParams(window.location.search);
        const urlLang = params.get('lang') as Language;

        const loadLanguage = async (lang: Language) => {
            if (lang === 'de' && !translations.de) {
                try {
                    const module = await import('../i18n/de');
                    setTranslations(prev => ({ ...prev, de: module.de }));
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
                setTranslations(prev => ({ ...prev, de: module.de }));
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
