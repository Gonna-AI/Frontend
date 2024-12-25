import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { useTheme } from '../../hooks/useTheme';
import { Clock, User } from 'lucide-react';

// Sample data - you can replace this with your actual data
const appointments = [
  {
    id: 1,
    clientName: "Sarah Johnson",
    date: "2024-03-25T14:30:00",
    regarding: "Annual Strategy Review",
    isOnline: true
  },
  {
    id: 2,
    clientName: "Michael Chen",
    date: "2024-03-25T16:00:00",
    regarding: "Project Milestone Discussion",
    isOnline: true
  }
];

export default function RecentActivity() {
  const { isDark } = useTheme();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className={cn(
      "rounded-xl overflow-hidden",
      isDark 
        ? "bg-black/20 border border-white/10" 
        : "bg-white/10 border border-black/10",
    )}>
      <div className={cn(
        "p-6",
        isDark 
          ? "border-b border-white/10" 
          : "border-b border-black/10"
      )}>
        <div className="flex justify-between items-center">
          <h2 className={cn(
            "text-lg font-semibold",
            isDark ? "text-white" : "text-black"
          )}>
            Recent Activities
          </h2>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {appointments.map((appointment) => (
          <div key={appointment.id} className="relative">
            {/* Online Status Indicator */}
            {appointment.isOnline && (
              <motion.div
                className="absolute -right-1 -top-1 flex items-center justify-center"
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
              >
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <div className="absolute w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              </motion.div>
            )}

            <div className={cn(
              "p-4 rounded-lg",
              isDark 
                ? "bg-black/20 border border-white/10" 
                : "bg-white/10 border border-black/10"
            )}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    isDark 
                      ? "bg-black/20 border border-white/10" 
                      : "bg-white/10 border border-black/10"
                  )}>
                    <User className={cn(
                      "w-4 h-4",
                      isDark ? "text-white/70" : "text-black/70"
                    )} />
                  </div>
                  <div>
                    <h3 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-black"
                    )}>
                      {appointment.clientName}
                    </h3>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-white/60" : "text-black/60"
                    )}>
                      {appointment.regarding}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className={cn(
                    "w-4 h-4",
                    isDark ? "text-white/40" : "text-black/40"
                  )} />
                  <span className={cn(
                    "text-sm",
                    isDark ? "text-white/60" : "text-black/60"
                  )}>
                    {formatDate(appointment.date)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}