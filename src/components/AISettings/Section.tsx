import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../utils/cn';
import { LucideIcon } from 'lucide-react';

interface SectionProps {
  title: string;
  children: React.ReactNode;
  icon?: LucideIcon;
  iconColor?: string;
}

export default function Section({ title, children, icon: Icon, iconColor }: SectionProps) {
  const { isDark } = useTheme();

  return (
    <section className={cn(
      "rounded-xl p-6",
      isDark 
        ? "bg-black/40 border-white/10" 
        : "bg-white/60 border-black/5",
      "border backdrop-blur-sm"
    )}>
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          {Icon && <Icon className={cn("w-5 h-5", iconColor)} />}
          <h2 className={cn(
            "text-lg font-semibold",
            isDark ? "text-white" : "text-black"
          )}>
            {title}
          </h2>
        </div>
        {children}
      </div>
    </section>
  );
}