import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '../../contexts/LanguageContext';

interface SharedHeaderProps {
    bannerVisible?: boolean;
}

export default function SharedHeader({ bannerVisible = false }: SharedHeaderProps) {
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const { t } = useLanguage();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleAboutClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsMobileMenuOpen(false);
        navigate('/about');
    };

    const handleSolutionsClick = () => {
        setIsMobileMenuOpen(false);
        navigate('/solutions');
    };

    return (
        <>
            {/* Floating Pill Header */}
            <header
                className={`fixed z-50 left-1/2 w-[95%] max-w-[1400px] transition-all duration-300 transform -translate-x-1/2 rounded-[50px] md:rounded-[70px] px-5 md:px-10 py-3 md:py-5 shadow-2xl backdrop-blur-xl bg-[#1a1a1a]/50 hover:bg-[#1a1a1a]/70 border border-white/10 ${isScrolled ? 'top-4 md:top-6' : 'top-4 md:top-6'}`}
                style={{ top: bannerVisible ? 'calc(44px + 1rem)' : '1rem' }}
            >
                <div className="w-full flex items-center justify-between relative">

                    {/* Left: Logo */}
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2 md:gap-3 group"
                            aria-label="Go to home"
                        >
                            <svg viewBox="0 0 464 468" className="w-8 h-8 md:w-12 md:h-12">
                                <path fill="white" d="M275.9 63.5c37.7 5.3 76.6 24.1 103.7 50.2 30 28.8 41.8 57.6 35.8 87.1-6.1 30.1-33.6 52.9-70.6 58.3-6 0.9-18.3 1-44.9 0.6l-36.6-0.7-0.5 17.8c-0.3 9.7-0.4 17.8-0.4 17.9 0.1 0.1 19.1 0.3 42.2 0.4 23.2 0 42.7 0.5 43.5 1 1.2 0.7 1.1 2.2-0.8 9.4-6 23-20.5 42.1-41.8 55-7.3 4.3-26.7 11.9-36 14.1-9 2-34 2-44.5 0-41.3-7.9-74.2-38-82.9-75.7-8.1-35.7 2.2-71.5 27.5-94.7 16.1-14.9 35.5-22.4 63.7-24.7l7.7-0.7v-34.1l-11.7 0.7c-22.2 1.3-37 5.3-56.4 15.2-28.7 14.6-49.7 39.3-59.9 70.2-9.6 29.3-9.3 62.6 0.8 91.4 3.3 9.2 12.2 25.6 18.3 33.8 11.3 14.9 30.6 30.8 48.7 39.9 19.9 10 49.2 15.9 73.2 14.7 26.5-1.3 52.5-9.6 74.2-23.9 26.9-17.6 47.2-47.9 53.3-79.7 1-5.2 2.3-10.1 2.8-10.8 0.8-0.9 6.9-1.2 27.1-1l26.1 0.3 0.3 3.8c1.2 14.6-10.9 52.1-23.9 74-17.8 30-43.2 54-75.9 71.5-20.9 11.2-38.3 16.5-67.2 20.7-27.6 3.9-47.9 3.1-75.8-3.1-36.9-8.3-67.8-25.6-97.1-54.6-23.6-23.2-44.8-61.9-51.7-93.8-5.1-23.7-5.5-28.1-4.9-48.8 1.7-63.2 23.4-111.8 67.7-152 28-25.4 60.4-41.3 99-48.8 18.5-3.6 46.1-4 67.9-0.9zm16.4 92.6c-6.3 2.4-12.8 8.5-15.4 14.5-2.6 6.1-2.6 18.3 0 23.9 5 11 20.2 17.7 32.3 14.1 11.9-3.4 19.8-14.3 19.8-27.1-0.1-19.9-18.2-32.5-36.7-25.4z" />
                            </svg>
                            <span className="text-lg md:text-[28px] font-semibold text-white/90 group-hover:text-white transition-colors leading-none tracking-tight">
                                ClerkTree
                            </span>
                        </button>
                    </div>

                    {/* Center: Navigation Links - Hidden on Mobile */}
                    <nav className="hidden md:flex items-center justify-center gap-12 absolute left-1/2 transform -translate-x-1/2">
                        <button
                            type="button"
                            onClick={() => navigate('/blog')}
                            className="font-medium bg-transparent border-none outline-none transition-colors tracking-wide"
                            style={{ fontSize: '18px', fontFamily: 'Urbanist, sans-serif', color: 'oklch(0.9 0 0 / 0.7)' }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'oklch(0.9 0 0 / 0.7)'}
                        >
                            {t('nav.blog')}
                        </button>
                        <button
                            type="button"
                            onClick={handleAboutClick}
                            className="font-medium bg-transparent border-none outline-none transition-colors tracking-wide"
                            style={{ fontSize: '18px', fontFamily: 'Urbanist, sans-serif', color: 'oklch(0.9 0 0 / 0.7)' }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'oklch(0.9 0 0 / 0.7)'}
                        >
                            {t('nav.about')}
                        </button>
                        <button
                            onClick={() => navigate('/docs')}
                            className="font-medium bg-transparent border-none outline-none transition-colors tracking-wide"
                            style={{ fontSize: '18px', fontFamily: 'Urbanist, sans-serif', color: 'oklch(0.9 0 0 / 0.7)' }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'oklch(0.9 0 0 / 0.7)'}
                        >
                            {t('nav.docs')}
                        </button>
                    </nav>

                    {/* Right: Actions */}
                    <div className="flex items-center justify-end gap-3 md:gap-5 shrink-0">
                        {/* Language Switcher */}
                        <div className="hidden md:block w-[75px] scale-100 origin-right">
                            <LanguageSwitcher isExpanded={true} forceDark={true} />
                        </div>

                        {/* CTA Book/Login Button */}
                        <button
                            onClick={() => navigate('/login')}
                            className="hidden md:flex items-center justify-center whitespace-nowrap text-[18px] font-medium transition-all h-[54px] rounded-[30px] px-10 gap-2 group"
                            style={{ fontFamily: 'Urbanist, sans-serif', background: 'rgba(255, 255, 255, 1)', color: 'rgb(10, 10, 10)' }}
                        >
                            {t('nav.login')}
                            <svg width="14" height="14" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                                <path d="M1 11L11 1M11 1H3.5M11 1V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>

                        {/* Mobile Hamburger Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 text-white/80 hover:text-white transition-colors ml-1"
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />

                        {/* Glassy Popup Menu */}
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="fixed left-[2.5%] right-[2.5%] w-[95%] z-50 md:hidden mx-auto"
                            style={{ top: bannerVisible ? 'calc(44px + 90px)' : '90px' }}
                        >
                            <div className="backdrop-blur-xl bg-[#1a1a1a]/50 border border-white/10 rounded-[30px] shadow-2xl overflow-hidden p-2">
                                <nav className="flex flex-col p-2">
                                    <button
                                        onClick={handleAboutClick}
                                        className="flex items-center justify-between px-4 py-3.5 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition-all group"
                                    >
                                        <span className="text-base font-medium font-urbanist">{t('nav.about')}</span>
                                        <span className="text-white/20 group-hover:text-white/60 transition-colors">→</span>
                                    </button>
                                    <div className="h-px bg-white/5 mx-2" />
                                    <button
                                        onClick={handleSolutionsClick}
                                        className="flex items-center justify-between px-4 py-3.5 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition-all group"
                                    >
                                        <span className="text-base font-medium font-urbanist">{t('nav.solutions')}</span>
                                        <span className="text-white/20 group-hover:text-white/60 transition-colors">→</span>
                                    </button>
                                    <div className="h-px bg-white/5 mx-2" />
                                    <button
                                        onClick={() => { setIsMobileMenuOpen(false); navigate('/blog'); }}
                                        className="flex items-center justify-between px-4 py-3.5 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition-all group"
                                    >
                                        <span className="text-base font-medium font-urbanist">{t('nav.blog')}</span>
                                        <span className="text-white/20 group-hover:text-white/60 transition-colors">→</span>
                                    </button>
                                    <div className="h-px bg-white/5 mx-2" />
                                    <button
                                        onClick={() => { setIsMobileMenuOpen(false); navigate('/docs'); }}
                                        className="flex items-center justify-between px-4 py-3.5 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition-all group"
                                    >
                                        <span className="text-base font-medium font-urbanist">{t('nav.docs')}</span>
                                        <span className="text-white/20 group-hover:text-white/60 transition-colors">→</span>
                                    </button>
                                    <div className="h-px bg-white/5 mx-2 my-1" />
                                    <div className="p-2">
                                        <LanguageSwitcher isExpanded={true} forceDark={true} />
                                    </div>
                                    <div className="h-px bg-white/5 mx-2" />
                                    <button
                                        onClick={() => { setIsMobileMenuOpen(false); navigate('/login'); }}
                                        className="flex items-center justify-center mx-2 my-2 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                                        style={{ fontFamily: 'Urbanist, sans-serif', background: 'rgba(255, 255, 255, 0.95)', color: 'rgb(10, 10, 10)' }}
                                    >
                                        {t('nav.login')}
                                    </button>
                                </nav>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
