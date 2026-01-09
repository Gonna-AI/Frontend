import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Lock } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { cn } from '../../utils/cn';

export default function TopBanner() {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if dismissed in this session
        const isDismissed = sessionStorage.getItem('platform_access_banner_dismissed');
        if (!isDismissed) {
            setIsVisible(true);
        }
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        sessionStorage.setItem('platform_access_banner_dismissed', 'true');
    };

    if (!isVisible) return null;

    return (
        <div className={cn(
            "relative z-[100] border-b border-orange-500/20 px-4 py-3 flex-shrink-0",
            "dark:bg-[#191000] bg-orange-50"
        )}>
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                    <Lock className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    <div className="flex items-center gap-2 text-sm overflow-hidden">
                        <span className="font-medium dark:text-white text-orange-950 whitespace-nowrap">{t('banner.platformNotFound')}</span>
                        <span className="dark:text-white/40 text-orange-900/40 hidden sm:inline">•</span>
                        <span className="dark:text-white/60 text-orange-900/60 truncate">{t('banner.apiOnlyAccess')}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                    <button
                        onClick={() => navigate('/contact')}
                        className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-medium rounded-lg transition-colors"
                    >
                        {t('banner.requestAccess')}
                    </button>
                    <button
                        onClick={handleDismiss}
                        className="p-1 dark:hover:bg-white/10 hover:bg-black/5 rounded-md transition-colors dark:text-white/40 text-black/40 dark:hover:text-white hover:text-black"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
