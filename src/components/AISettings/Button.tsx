import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export default function Button(props: ButtonProps) {
  const { isDark } = useTheme();

  return (
    <button
      {...props}
      className={cn(
        "px-6 py-3 rounded-lg font-medium transition-all relative overflow-hidden group",
        isDark
          ? "bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 backdrop-blur-xl text-white hover:opacity-90 border border-white/10"
          : "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-90",
        props.className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/20 to-pink-500/0 group-hover:opacity-100 opacity-0 transition-opacity duration-300" />
      <span className="relative">{props.children}</span>
    </button>
  );
}