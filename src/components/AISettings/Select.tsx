import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../utils/cn';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export default function Select(props: SelectProps) {
  const { isDark } = useTheme();

  return (
    <select
      {...props}
      className={cn(
        "w-full p-3 rounded-lg transition-all backdrop-blur-lg appearance-none",
        isDark
          ? "bg-white/5 border border-white/10 text-white focus:bg-white/10"
          : "bg-black/5 border border-black/10 text-black focus:bg-black/10",
        props.className
      )}
    />
  );
}