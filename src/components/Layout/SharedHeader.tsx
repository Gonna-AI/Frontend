import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '../../contexts/LanguageContext';
import ClerkTreeLogo from '../Brand/ClerkTreeLogo';

interface SharedHeaderProps {
    bannerVisible?: boolean;
    onMobileMenuToggle?: () => void;
    isMobileMenuOpenExternal?: boolean;
    rightActions?: React.ReactNode;
}

export default function SharedHeader({ bannerVisible = false, onMobileMenuToggle, isMobileMenuOpenExternal, rightActions }: SharedHeaderProps) {
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Use external state if provided, otherwise fallback to local state
    const isOpen = isMobileMenuOpenExternal !== undefined ? isMobileMenuOpenExternal : isMobileMenuOpen;
    const toggleMenu = () => {
        if (onMobileMenuToggle) {
            onMobileMenuToggle();
        } else {
            setIsMobileMenuOpen(!isMobileMenuOpen);
        }
    };

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
                            <ClerkTreeLogo
                                markClassName="w-8 h-8 md:w-12 md:h-12 text-white"
                                labelClassName="text-lg md:text-[28px] font-semibold text-white/90 group-hover:text-white transition-colors leading-none tracking-tight"
                            />
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
                        {rightActions}

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
                            onClick={toggleMenu}
                            className="md:hidden p-2 text-white/80 hover:text-white transition-colors ml-1"
                            aria-label="Toggle menu"
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isOpen && !onMobileMenuToggle && (
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
