import React from "react";
import { cn } from "../../utils/cn";

interface RainbowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function RainbowButton({
  children,
  className,
  ...props
}: RainbowButtonProps) {
  return (
    <button
      className={cn(
        // Base styles
        "group relative inline-flex h-12 animate-rainbow cursor-pointer items-center justify-center",
        "rounded-full px-8 py-2",
        "text-base font-medium",
        "bg-white text-black",
        "transition-all duration-200",
        "disabled:pointer-events-none disabled:opacity-50",

        // Border gradient
        "border-2 border-transparent",
        "bg-gradient-to-r from-[#4F46E5] via-[#9333EA] to-[#4F46E5] bg-[length:200%]",
        "[background-clip:padding-box,border-box] [background-origin:border-box]",
        "[background-image:linear-gradient(white,white),linear-gradient(to_right,#4F46E5,#9333EA,#4F46E5)]",

        // Hover effects
        "hover:scale-105",
        "hover:shadow-lg hover:shadow-purple-500/20",

        // Focus styles
        "focus:outline-none focus:ring-2 focus:ring-purple-500/50",

        // Glow effect
        "before:absolute before:inset-0",
        "before:h-full before:w-full",
        "before:animate-rainbow",
        "before:rounded-full",
        "before:bg-gradient-to-r",
        "before:from-[#4F46E5] before:via-[#9333EA] before:to-[#4F46E5]",
        "before:blur-xl before:opacity-20 before:-z-10",

        // Dark mode adjustments
        "dark:bg-[linear-gradient(black,black),linear-gradient(to_right,#6366F1,#A855F7,#6366F1)]",
        "dark:text-white",

        className
      )}
      {...props}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
} 