import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export default function Input(props: InputProps) {
  const { isDark } = useTheme();

  return (
    <input
      {...props}
      className={cn(
        "w-full p-3 rounded-lg transition-all backdrop-blur-lg",
        isDark
          ? "bg-white/5 border border-white/10 text-white placeholder-white/40 focus:bg-white/10"
          : "bg-black/5 border border-black/10 text-black placeholder-black/40 focus:bg-black/10",
        props.className
      )}
    />
  );
}