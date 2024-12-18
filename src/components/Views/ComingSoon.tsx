import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../utils/cn';

interface ComingSoonProps {
  feature: string;
}

export default function ComingSoon({ feature }: ComingSoonProps) {
  const { isDark } = useTheme();
  
  return (
    <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
      <div className={cn(
        "text-center p-8 rounded-xl",
        isDark ? "text-white" : "text-black"
      )}>
        <h2 className="text-2xl font-bold mb-4">{feature}</h2>
        <p className="text-lg opacity-70">Coming soon...</p>
      </div>
    </div>
  );
}