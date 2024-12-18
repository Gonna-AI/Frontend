import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../utils/cn';

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
}

export default function FormField({ label, children }: FormFieldProps) {
  const { isDark } = useTheme();

  return (
    <div>
      <label className={cn(
        "block text-sm font-medium mb-2",
        isDark ? "text-white/80" : "text-black/80"
      )}>
        {label}
      </label>
      {children}
    </div>
  );
}