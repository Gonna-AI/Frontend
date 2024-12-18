import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../utils/cn';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export default function Textarea(props: TextareaProps) {
  const { isDark } = useTheme();

  return (
    <textarea
      {...props}
      className={cn(
        "w-full h-32 p-4 rounded-lg transition-all backdrop-blur-lg resize-none",
        isDark
          ? "bg-white/5 border border-white/10 text-white placeholder-white/40 focus:bg-white/10"
          : "bg-black/5 border border-black/10 text-black placeholder-black/40 focus:bg-black/10",
        props.className
      )}
    />
  );
}