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
        <button
            onClick={toggleLanguage}
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all outline-none border shadow-xs h-8 rounded-md px-3 backdrop-blur-md",
                isDark
                    ? "bg-white/5 border-white/10 text-white/90 hover:text-white hover:bg-white/10"
                    : "bg-black/5 border-black/10 text-black/90 hover:text-black hover:bg-black/10",
                "gap-1"
            )}
            style={{
                fontFamily: 'Urbanist, sans-serif',
            }}
        >
            <span className={cn(language === 'en' ? "opacity-100 font-bold" : "opacity-50")}>en</span>
            <span className="opacity-30">|</span>
            <span className={cn(language === 'de' ? "opacity-100 font-bold" : "opacity-50")}>de</span>
        </button>
    );
}
