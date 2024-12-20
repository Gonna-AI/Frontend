import React from 'react';
import AnalyticsCards from './AnalyticsCards';
import Chart from './Chart';
import RecentActivity from './RecentActivity';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../utils/cn';

export default function Dashboard() {
  const { isDark } = useTheme();

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className={cn(
        "text-white",
        isDark ? "text-white" : "text-black"
      )}>
        <AnalyticsCards />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Chart />
        </div>
        <div>
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}