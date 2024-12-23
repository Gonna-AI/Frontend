'use client'

import React from 'react';
import { cn } from '../../utils/cn';
import { useTheme } from '../../hooks/useTheme';
import { 
  MessageSquare, 
  Settings, 
  UserCircle2,
  Home,
  CreditCard,
  Brain,
  Moon,
  Sun,
  LogOut
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const { isDark, toggleTheme } = useTheme();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Force close sidebar if coming from landing page
  React.useEffect(() => {
    if (searchParams.get('from') === 'landing') {
      onClose();
    }
  }, [searchParams, onClose]);

  // Predefine menu items to reduce render time
  const menuItems = [
    { icon: Home, label: 'Dashboard', href: '/' },
    { icon: Brain, label: 'AI Settings', href: '/ai-settings' },
    { icon: UserCircle2, label: 'Profile', href: '/profile' },
    { icon: CreditCard, label: 'Billing', href: '/billing' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];

  // Predefine common classes
  const linkClasses = cn(
    "flex items-center",
    "px-3 py-2 rounded-lg",
    "md:justify-center xl:justify-start"
  );

  const textClasses = cn(
    "ml-3 text-sm font-medium",
    "md:hidden xl:block"
  );

  return (
    <>
      {/* Backdrop with reduced opacity */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      {/* Optimized Sidebar */}
      <aside className={cn(
        "fixed z-50",
        "md:top-0 bottom-0 md:bottom-auto left-0",
        "h-[85vh] md:h-full",
        "w-64 md:w-20 xl:w-72",
        "md:transition-transform md:duration-200",
        isOpen 
          ? "translate-y-0 md:translate-y-0 translate-x-0" 
          : "translate-y-full md:translate-y-0 -translate-x-full md:translate-x-0",
        isDark 
          ? "bg-black/80 border-t md:border-t-0 md:border-r border-white/10" 
          : "bg-white/80 border-t md:border-t-0 md:border-r border-black/10",
        "backdrop-blur-sm", // Reduced blur
        "rounded-t-xl md:rounded-none"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center h-16 px-4 md:mt-0 xl:px-4">
            <span className={cn(
              "text-xl font-bold",
              "md:hidden xl:block",
              isDark ? "text-white" : "text-black"
            )}>
              gonna.ai
            </span>
          </div>

          {/* Navigation with optimized rendering */}
          <nav className="flex-1 px-2 py-4">
            <ul className="space-y-1">
              {menuItems.map(({ icon: Icon, label, href }) => (
                <li key={href}>
                  <Link 
                    href={href}
                    onClick={onClose}
                    className={cn(
                      linkClasses,
                      pathname === href
                        ? isDark
                          ? "bg-white/10 text-white"
                          : "bg-black/10 text-black"
                        : isDark
                          ? "text-white/60 hover:bg-white/5 hover:text-white"
                          : "text-black/60 hover:bg-black/5 hover:text-black"
                    )}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className={textClasses}>
                      {label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Theme Toggle with optimized rendering */}
          <div className="px-2">
            <button
              onClick={toggleTheme}
              className={cn(
                "w-full",
                linkClasses,
                isDark
                  ? "text-white/60 hover:bg-white/5 hover:text-white"
                  : "text-black/60 hover:bg-black/5 hover:text-black"
              )}
            >
              {isDark ? <Moon className="w-5 h-5 shrink-0" /> : <Sun className="w-5 h-5 shrink-0" />}
              <span className={textClasses}>
                {isDark ? 'Dark Mode' : 'Light Mode'}
              </span>
            </button>
          </div>

          {/* Logout Button with optimized rendering */}
          <div className="px-2 pb-4">
            <button className={cn(
              "w-full",
              linkClasses,
              isDark
                ? "text-white/60 hover:bg-white/5 hover:text-white"
                : "text-black/60 hover:bg-black/5 hover:text-black"
            )}>
              <LogOut className="w-5 h-5 shrink-0" />
              <span className={textClasses}>
                Sign Out
              </span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
} 