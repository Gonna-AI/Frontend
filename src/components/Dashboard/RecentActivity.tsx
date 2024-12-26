import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { useTheme } from '../../hooks/useTheme';
import { Bell, Calendar, Clock, AlertTriangle, User, ChevronUp } from 'lucide-react';

const PriorityDashboard = () => {
  const { isDark } = useTheme();
  const [claims] = useState([
    {
      id: 1,
      clientName: "John Doe",
      claimType: "Health Insurance",
      priority: "high",
      callbackTime: "2024-12-27 14:00",
      status: "pending",
      sentiment: "frustrated",
      grievanceType: "Claim Rejection",
      lastInteraction: "2024-12-26 10:30",
      isOnline: true
    },
    {
      id: 2,
      clientName: "Jane Smith",
      claimType: "Auto Insurance",
      priority: "medium",
      callbackTime: "2024-12-27 16:00",
      status: "scheduled",
      sentiment: "neutral",
      grievanceType: "Delay in Processing",
      lastInteraction: "2024-12-26 11:45",
      isOnline: false
    },
    // Adding more items to demonstrate scroll
    ...Array(4).fill(null).map((_, index) => ({
      id: index + 3,
      clientName: `Test Client ${index + 3}`,
      claimType: "Life Insurance",
      priority: ["low", "medium", "high"][index % 3],
      callbackTime: "2024-12-28 10:00",
      status: "pending",
      sentiment: "neutral",
      grievanceType: "Documentation Issue",
      lastInteraction: "2024-12-26 09:00",
      isOnline: Boolean(index % 2)
    }))
  ]);

  const getPriorityColor = (priority) => {
    const colors = {
      high: isDark ? "bg-red-500/20 text-red-400" : "bg-red-100 text-red-800",
      medium: isDark ? "bg-yellow-500/20 text-yellow-400" : "bg-yellow-100 text-yellow-800",
      low: isDark ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-800"
    };
    return colors[priority] || colors.low;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      month: 'short',
      day: 'numeric'
    });
  };

  const scrollToTop = () => {
    const container = document.getElementById('claims-container');
    if (container) {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className={cn(
      "rounded-xl overflow-hidden h-[600px] w-full flex flex-col",
      isDark 
        ? "bg-black/20 border border-white/10" 
        : "bg-white/10 border border-black/10"
    )}>
      {/* Header */}
      <div className={cn(
        "p-6",
        isDark 
          ? "border-b border-white/10" 
          : "border-b border-black/10"
      )}>
        <div className="flex items-center gap-2">
          <Bell className={cn(
            "w-5 h-5 flex-shrink-0",
            isDark ? "text-white/70" : "text-black/70"
          )} />
          <h2 className={cn(
            "text-lg font-semibold",
            isDark ? "text-white" : "text-black"
          )}>
            Priority Claims Dashboard
          </h2>
        </div>
      </div>

      {/* Scrollable Content */}
      <div 
        id="claims-container"
        className="flex-1 overflow-y-auto p-6 space-y-4 relative scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-400"
      >
        {claims.map((claim) => (
          <div key={claim.id} className="relative">
            {claim.isOnline && (
              <motion.div
                className="absolute -right-1 -top-1 flex items-center justify-center z-10"
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
              >
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <div className="absolute w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              </motion.div>
            )}

            <div className={cn(
              "p-4 rounded-lg transition-colors duration-200",
              isDark 
                ? "bg-black/20 border border-white/10 hover:bg-black/30" 
                : "bg-white/10 border border-black/10 hover:bg-white/20"
            )}>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "p-2 rounded-lg flex-shrink-0",
                    isDark 
                      ? "bg-black/20 border border-white/10" 
                      : "bg-white/10 border border-black/10"
                  )}>
                    <User className={cn(
                      "w-4 h-4",
                      isDark ? "text-white/70" : "text-black/70"
                    )} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center flex-wrap gap-2">
                      <h3 className={cn(
                        "font-medium truncate",
                        isDark ? "text-white" : "text-black"
                      )}>
                        {claim.clientName}
                      </h3>
                      <span className={cn(
                        "px-2 py-1 rounded text-xs font-medium flex-shrink-0",
                        getPriorityColor(claim.priority)
                      )}>
                        {claim.priority.toUpperCase()}
                      </span>
                      {claim.sentiment === "frustrated" && (
                        <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className={cn(
                      "text-sm mt-1",
                      isDark ? "text-white/60" : "text-black/60"
                    )}>
                      {claim.claimType} - {claim.grievanceType}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col lg:items-end gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className={cn(
                      "w-4 h-4 flex-shrink-0",
                      isDark ? "text-white/40" : "text-black/40"
                    )} />
                    <span className={cn(
                      isDark ? "text-white/60" : "text-black/60"
                    )}>
                      {formatDate(claim.callbackTime)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className={cn(
                      "w-4 h-4 flex-shrink-0",
                      isDark ? "text-white/40" : "text-black/40"
                    )} />
                    <span className={cn(
                      isDark ? "text-white/60" : "text-black/60"
                    )}>
                      {formatDate(claim.lastInteraction)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button className={cn(
                  "px-3 py-1.5 text-sm rounded-lg transition-colors duration-200",
                  isDark 
                    ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/20" 
                    : "bg-blue-100 text-blue-800 hover:bg-blue-200 border border-blue-200"
                )}>
                  Reschedule
                </button>
                <button className={cn(
                  "px-3 py-1.5 text-sm rounded-lg transition-colors duration-200",
                  isDark 
                    ? "bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/20" 
                    : "bg-green-100 text-green-800 hover:bg-green-200 border border-green-200"
                )}>
                  Mark Complete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={cn(
          "absolute bottom-4 right-4 p-2 rounded-full transition-colors duration-200",
          isDark 
            ? "bg-white/10 hover:bg-white/20 text-white/70" 
            : "bg-black/10 hover:bg-black/20 text-black/70"
        )}
      >
        <ChevronUp className="w-5 h-5" />
      </button>
    </div>
  );
};

export default PriorityDashboard;