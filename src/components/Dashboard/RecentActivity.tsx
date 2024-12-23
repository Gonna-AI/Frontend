import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import { useTheme } from '../../hooks/useTheme';
import RecentActivityDetail from './RecentActivityDetail';

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
  }
];

export default function RecentActivity() {
  const { isDark } = useTheme();
  const [showDetail, setShowDetail] = useState(false);

  return (
    <>
      <div className={cn(
        "p-6 rounded-xl h-[400px] relative z-10",
        isDark
          ? "bg-black/40 border border-white/10 backdrop-blur-md"
          : "bg-white/40 border border-black/10 backdrop-blur-md"
      )}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={cn(
            "text-lg font-semibold",
            isDark ? "text-white/90" : "text-black"
          )}>
            Recent Activity
          </h3>
          <button
            onClick={() => setShowDetail(true)}
            className={cn(
              "px-3 py-1 text-sm rounded-lg transition-colors",
              isDark
                ? "bg-white/10 hover:bg-white/20 text-white/90"
                : "bg-black/5 hover:bg-black/10 text-black"
            )}
          >
            View All
          </button>
        </div>
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
              <p className={isDark ? "text-white/90 font-medium" : "text-black font-medium"}>
                {activity.user}
              </p>
              <p className={isDark ? "text-white/70 text-sm" : "text-black/60 text-sm"}>
                {activity.action}
              </p>
              <p className={isDark ? "text-white/50 text-xs mt-1" : "text-black/40 text-xs mt-1"}>
                {activity.time}
              </p>
            </div>
          ))}
        </div>
      </div>

      {showDetail && <RecentActivityDetail onClose={() => setShowDetail(false)} />}
    </>
  );
}