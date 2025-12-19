import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../utils/cn';
import SidebarItem from './SidebarItem';

interface ThemeToggleProps {
  isExpanded: boolean;
}

export default function ThemeToggle({ isExpanded }: ThemeToggleProps) {
  const { isDark, toggleTheme } = useTheme();
  
  // Unified icon component
  const Icon = isDark ? Sun : Moon;

  return (
    <SidebarItem
      icon={Icon}
      label={isDark ? 'Light Mode' : 'Dark Mode'}
      isExpanded={isExpanded}
      onClick={toggleTheme}
      isActive={false}
    />
  );
}