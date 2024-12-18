import React from 'react';
import AnalyticsCards from './AnalyticsCards';
import Chart from './Chart';
import RecentActivity from './RecentActivity';

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      <AnalyticsCards />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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