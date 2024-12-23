import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme';
import { cn } from '../../../utils/cn';

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  isExpanded: boolean;
  onClick: () => void;
}

export default function SidebarItem({
  icon: Icon,
  label,
  isActive,
  isExpanded,
  onClick
}: SidebarItemProps) {
  const { isDark } = useTheme();

  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "w-full flex items-center p-3 rounded-xl transition-colors duration-300 group relative",
        isDark
          ? "hover:bg-white/5 text-white/80 hover:text-white"
          : "hover:bg-black/5 text-black/80 hover:text-black",
        isActive && (isDark ? "bg-white/10" : "bg-black/10")
      )}
      initial={false}
      animate={{
        paddingRight: isExpanded ? "1.5rem" : "0.75rem",
      }}
      transition={{
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }}
    >
      <div className="flex items-center space-x-3 w-full">
        <motion.div
          initial={false}
          animate={{
            scale: isExpanded ? 1 : 0.9,
          }}
          transition={{
            duration: 0.2,
            ease: "easeOut"
          }}
        >
          <Icon className="w-5 h-5 min-w-[20px]" />
        </motion.div>
        <motion.span
          initial={false}
          animate={{
            width: isExpanded ? "auto" : 0,
            opacity: isExpanded ? 1 : 0,
            marginLeft: isExpanded ? "0.75rem" : 0
          }}
          transition={{
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1],
            opacity: {
              duration: 0.15,
              ease: "linear",
              delay: isExpanded ? 0.1 : 0
            }
          }}
          className="whitespace-nowrap overflow-hidden"
        >
          {label}
        </motion.span>
      </div>
    </motion.button>
  );
}