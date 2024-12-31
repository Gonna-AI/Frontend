import React, { useEffect, useState } from 'react';
import AnalyticsCards from './AnalyticsCards';
import Chart from './Chart';
import RecentActivity from './RecentActivity';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../utils/cn';
import { analytics, AnalyticsData } from '../../services/analytics';
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="p-4 text-red-500">
      <h2>Something went wrong:</h2>
      <pre>{error.message}</pre>
    </div>
  );
}

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
        throw new Error('Failed to load dashboard data. Please try again later.');
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
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className={cn(
        "fixed inset-0",
        "p-4 md:p-6 space-y-4 md:space-y-6",
        isDark ? "text-white" : "text-black"
      )}>
        <div>
          {analyticsData && (
            <AnalyticsCards
              totalClients={analyticsData.total_clients}
              totalConversations={analyticsData.total_conversations}
              kbItems={analyticsData.kb_count}
              dailyConversations={parseInt(analyticsData.daily_conversations)}
            />
          )}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 h-[400px]">
            {analyticsData && (
              <Chart monthlyData={analyticsData.monthly_conversations} />
            )}
          </div>
          <div className="h-[400px]">
            <RecentActivity className="h-full" />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}