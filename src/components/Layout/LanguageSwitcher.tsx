import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../utils/cn';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher({ isExpanded = false, forceDark = false }: { isExpanded?: boolean; forceDark?: boolean }) {
    const { isDark: themeIsDark } = useTheme();
    const isDark = forceDark || themeIsDark;

    // Use the context hook
    const { language, setLanguage, t } = useLanguage();

    const toggleLanguage = () => {
        const newLang = language === 'en' ? 'de' : 'en';
        setLanguage(newLang);
    };

    if (!isExpanded) {
        return (
            <button
                onClick={toggleLanguage}
                className={cn(
                    "w-full flex items-center justify-center p-2 rounded-lg transition-colors",
                    isDark
                        ? "text-white/70 hover:bg-white/5 hover:text-white"
                        : "text-black/70 hover:bg-black/5 hover:text-black"
                )}
                title={language === 'en' ? "Switch to German" : "Switch to English"}
            >
                <div className="relative">
                    <Globe className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 text-[10px] font-bold uppercase">
                        {language}
                    </span>
                </div>
            </button>
        );
    }

    return (
        <div className={cn(
            "w-full flex items-center justify-between p-3 rounded-lg transition-colors",
            isDark ? "bg-white/5" : "bg-black/5"
        )}>
            <div className="flex items-center gap-3">
                <Globe className={cn(
                    "w-5 h-5",
                    isDark ? "text-white/70" : "text-black/70"
                )} />
                <span className={cn(
                    "text-sm font-medium",
                    isDark ? "text-white/90" : "text-black/90"
                )}>
                    {t('nav.language')}
                </span>
            </div>

            <div className="flex bg-black/10 dark:bg-white/10 p-1 rouned-lg rounded-md">
                <button
                    onClick={() => setLanguage('en')}
                    className={cn(
                        "px-2 py-1 text-xs font-medium rounded transition-all",
                        language === 'en'
                            ? isDark
                                ? "bg-white text-black shadow-sm"
                                : "bg-white text-black shadow-sm"
                            : isDark
                                ? "text-white/60 hover:text-white"
                                : "text-black/60 hover:text-black"
                    )}
                >
                    EN
                </button>
                <button
                    onClick={() => setLanguage('de')}
                    className={cn(
                        "px-2 py-1 text-xs font-medium rounded transition-all",
                        language === 'de'
                            ? isDark
                                ? "bg-white text-black shadow-sm"
                                : "bg-white text-black shadow-sm"
                            : isDark
                                ? "text-white/60 hover:text-white"
                                : "text-black/60 hover:text-black"
                    )}
                >
                    DE
                </button>
            </div>
        </div>
    );
}
