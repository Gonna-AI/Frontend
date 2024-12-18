import React from 'react';
import { cn } from '../../utils/cn';
import { useTheme } from '../../hooks/useTheme';

const activities = [
  {
    user: 'John Doe',
    action: 'Started a new AI conversation',
    time: '2 minutes ago'
  },
  {
    user: 'Alice Smith',
    action: 'Updated knowledge base',
    time: '15 minutes ago'
  },
  {
    user: 'Bob Johnson',
    action: 'Modified AI settings',
    time: '1 hour ago'
  },
  {
    user: 'Emma Wilson',
    action: 'Generated monthly report',
    time: '2 hours ago'
  },
  {
    user: 'Mike Brown',
    action: 'Updated AI model',
    time: '3 hours ago'
  },
  {
    user: 'Sarah Lee',
    action: 'Created new template',
    time: '4 hours ago'
  }
];

export default function RecentActivity() {
  const { isDark } = useTheme();

  return (
    <div className={cn(
      "p-6 rounded-xl h-[400px] relative z-10",
      isDark
        ? "bg-gradient-to-br from-white/5 via-white/10 to-white/5 backdrop-blur-lg border border-white/10"
        : "bg-gradient-to-br from-black/5 via-black/10 to-black/5 backdrop-blur-lg border border-black/10"
    )}>
      <h3 className={cn(
        "text-lg font-semibold mb-4",
        isDark ? "text-white" : "text-black"
      )}>Recent Activity</h3>
      <div className="space-y-4 h-[320px] overflow-y-auto pr-2 custom-scrollbar">
        {activities.map((activity, index) => (
          <div 
            key={index}
            className={cn(
              "p-3 rounded-lg transition-all",
              isDark
                ? "bg-white/5 hover:bg-white/10"
                : "bg-black/5 hover:bg-black/10"
            )}
          >
            <p className={isDark ? "text-white font-medium" : "text-black font-medium"}>
              {activity.user}
            </p>
            <p className={isDark ? "text-white/60 text-sm" : "text-black/60 text-sm"}>
              {activity.action}
            </p>
            <p className={isDark ? "text-white/40 text-xs mt-1" : "text-black/40 text-xs mt-1"}>
              {activity.time}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}