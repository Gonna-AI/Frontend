import React from 'react';
import { cn } from '../../utils/cn';

interface LogoProps {
  isDark: boolean;
}

export default function Logo({ isDark }: LogoProps) {
  return (
    <div className="flex items-center justify-center">
      <h1 className={cn(
        "text-3xl font-bold tracking-tight",
        isDark
          ? "bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-600 text-transparent bg-clip-text"
          : "bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-700 text-transparent bg-clip-text"
      )}>
        ClerkTree
      </h1>
    </div>
  );
}