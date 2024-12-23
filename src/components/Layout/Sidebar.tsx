'use client'

import React from 'react';
import { cn } from '../../utils/cn';
import { useTheme } from '../../hooks/useTheme';
import { 
  MessageSquare, 
  Settings, 
  UserCircle2,
  Home,
  LogOut
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { isDark } = useTheme();
  const pathname = usePathname();

  const menuItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: MessageSquare, label: 'Chat', href: '/chat' },
    { icon: UserCircle2, label: 'Profile', href: '/profile' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];

  return (
    <>
      {/* Backdrop (mobile only) */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-200"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 bottom-0 left-0 z-50",
        "w-72 md:w-20 xl:w-72",
        "transition-transform duration-200 ease-out",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        isDark 
          ? "bg-black/80 border-r border-white/10" 
          : "bg-white/80 border-r border-black/10",
        "backdrop-blur-xl"
      )}>
        {/* Content Container */}
        <div className="flex flex-col h-full p-4">
          {/* Logo (mobile and xl) */}
          <div className={cn(
            "flex items-center h-16 mb-8",
            "xl:px-4"
          )}>
            <span className={cn(
              "text-2xl font-bold",
              "md:hidden xl:block",
              isDark ? "text-white" : "text-black"
            )}>
              gonna.ai
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1">
            <ul className="space-y-2">
              {menuItems.map(({ icon: Icon, label, href }) => (
                <li key={href}>
                  <Link 
                    href={href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center",
                      "px-4 py-3 rounded-xl",
                      "transition-colors duration-200",
                      "md:justify-center xl:justify-start",
                      pathname === href
                        ? isDark
                          ? "bg-white/10 text-white"
                          : "bg-black/10 text-black"
                        : isDark
                          ? "text-white/60 hover:bg-white/5 hover:text-white"
                          : "text-black/60 hover:bg-black/5 hover:text-black",
                    )}
                  >
                    <Icon className="w-6 h-6" />
                    <span className={cn(
                      "ml-3",
                      "md:hidden xl:block"
                    )}>
                      {label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Logout Button */}
          <button className={cn(
            "flex items-center",
            "px-4 py-3 rounded-xl",
            "transition-colors duration-200",
            "md:justify-center xl:justify-start",
            isDark
              ? "text-white/60 hover:bg-white/5 hover:text-white"
              : "text-black/60 hover:bg-black/5 hover:text-black"
          )}>
            <LogOut className="w-6 h-6" />
            <span className={cn(
              "ml-3",
              "md:hidden xl:block"
            )}>
              Logout
            </span>
          </button>
        </div>
      </aside>
    </>
  );
} 