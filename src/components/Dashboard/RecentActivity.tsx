// ActivityDashboard.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { useTheme } from '../../hooks/useTheme';

export default function RecentActivity() {
  const { isDark } = useTheme();

  return (
    <div className={cn(
      "rounded-xl overflow-hidden",
      "border backdrop-blur-xl",
      isDark 
        ? "bg-black/40 border-white/[0.08]" 
        : "bg-white/40 border-black/[0.08]",
    )}>
      <div className="p-6 border-b border-inherit">
        <div className="flex justify-between items-center">
          <h2 className={cn(
            "text-lg font-semibold",
            isDark ? "text-white" : "text-black"
          )}>
            Recent Activities
          </h2>
          {/* ... existing header content ... */}
        </div>
      </div>

      <div className="p-6">
        {/* ... existing content ... */}
      </div>
    </div>
  );
}