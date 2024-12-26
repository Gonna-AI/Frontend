import React, { useEffect, useState } from 'react';
import AnalyticsCards from './AnalyticsCards';
import Chart from './Chart';
import RecentActivity from './RecentActivity';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../utils/cn';
import { analytics, AnalyticsData } from '../../services/analytics';

export default function Dashboard() {
  const { isDark } = useTheme();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await analytics.getAnalytics();
        setAnalyticsData(data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className={cn(
      "p-4 md:p-6 space-y-4 md:space-y-6",
      isDark ? "text-white" : "text-black"
    )}>
      <div>
        {analyticsData && (
          <AnalyticsCards
            totalClients={analyticsData.total_clients}
            totalConversations={analyticsData.total_conversations}
            kbItems={analyticsData.kb_items}
            dailyConversations={analyticsData.daily_conversations}
          />
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          {analyticsData && (
            <Chart monthlyData={analyticsData.monthly_conversations} />
          )}
        </div>
        <div>
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}