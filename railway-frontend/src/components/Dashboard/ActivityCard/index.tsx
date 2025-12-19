import React, { useState } from 'react';
import { User, AlertCircle, Calendar, Clock, Expand, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../utils/cn';
import { useTheme } from '../../../hooks/useTheme';
import PriorityBadge from './PriorityBadge';
import AudioPlayer from './AudioPlayer';
import MeetingNotes from './MeetingNotes';

interface ActivityCardProps {
  client: {
    name: string;
    priority: 'high' | 'medium' | 'low';
    timestamp: string;
    appointmentType: string | null;
    bookingInProgress: boolean;
    preferredDay: string | null;
    preferredTime: string | null;
    callDuration?: string;
    meetingSummary?: string;
    conversation?: string[];
  };
}

export default function ActivityCard({ client }: ActivityCardProps) {
  const { isDark } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {/* Card */}
      <motion.div
        className={cn(
          "rounded-xl backdrop-blur-xl border relative p-6",
          isDark 
            ? "bg-black/40 border-white/[0.08] hover:bg-black/50" 
            : "bg-white/40 border-black/[0.08] hover:bg-white/50",
          "transition-all duration-200"
        )}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Card Content */}
        <div className="space-y-4">
          {/* Header */}
          <div className="flex justify-between items-start">
            <PriorityBadge priority={client.priority} />
            <span className={cn(
              "text-sm",
              isDark ? "text-white/40" : "text-black/40"
            )}>
              {client.timestamp}
            </span>
          </div>

          {/* Client Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <User className={isDark ? "text-white/60" : "text-black/60"} />
              <h3 className={cn(
                "text-lg font-semibold",
                isDark ? "text-white" : "text-black"
              )}>
                {client.name}
              </h3>
            </div>

            {/* Appointment Type */}
            {client.appointmentType && (
              <div className={cn(
                "p-3 rounded-lg",
                isDark ? "bg-white/5" : "bg-black/5"
              )}>
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-blue-400" />
                  <span className={isDark ? "text-white/60" : "text-black/60"}>
                    {client.appointmentType}
                  </span>
                </div>
              </div>
            )}

            {/* Time Slot */}
            {(client.preferredDay || client.preferredTime) && (
              <div className="space-y-2">
                {client.preferredDay && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    <span className={isDark ? "text-white/60" : "text-black/60"}>
                      {client.preferredDay}
                    </span>
                  </div>
                )}
                {client.preferredTime && (
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    <span className={isDark ? "text-white/60" : "text-black/60"}>
                      {client.preferredTime}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Booking Status */}
          {client.bookingInProgress && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <span className={cn(
                "text-sm",
                isDark ? "text-white/60" : "text-black/60"
              )}>
                Booking in progress
              </span>
            </div>
          )}
        </div>

        {/* Expand Button */}
        <button
          onClick={() => setIsExpanded(true)}
          className={cn(
            "absolute bottom-4 right-4 p-2 rounded-lg transition-colors",
            isDark 
              ? "hover:bg-white/10" 
              : "hover:bg-black/10"
          )}
        >
          <Expand className={cn(
            "w-5 h-5",
            isDark ? "text-white/60" : "text-black/60"
          )} />
        </button>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {isExpanded && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsExpanded(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={cn(
                "fixed inset-4 z-50 m-auto max-w-2xl max-h-[90vh] overflow-y-auto",
                "rounded-xl p-6 backdrop-blur-xl border shadow-lg",
                isDark 
                  ? "bg-black/80 border-white/[0.08]" 
                  : "bg-white/80 border-black/[0.08]"
              )}
            >
              {/* Modal Content */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className={isDark ? "text-white/60" : "text-black/60"} />
                    <h2 className="text-2xl font-semibold">{client.name}</h2>
                  </div>

                  {client.appointmentType && (
                    <div className={cn(
                      "p-4 rounded-lg",
                      isDark ? "bg-white/5" : "bg-black/5"
                    )}>
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-5 h-5 text-blue-400" />
                        <span className="text-lg">{client.appointmentType}</span>
                      </div>
                    </div>
                  )}

                  {(client.preferredDay || client.preferredTime) && (
                    <div className="space-y-3">
                      {client.preferredDay && (
                        <div className="flex items-center space-x-3">
                          <Calendar className="w-5 h-5 text-purple-400" />
                          <span className="text-lg">{client.preferredDay}</span>
                        </div>
                      )}
                      {client.preferredTime && (
                        <div className="flex items-center space-x-3">
                          <Clock className="w-5 h-5 text-emerald-400" />
                          <span className="text-lg">{client.preferredTime}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {client.callDuration && <AudioPlayer duration={client.callDuration} />}

                {client.meetingSummary && client.conversation && (
                  <MeetingNotes
                    summary={client.meetingSummary}
                    conversation={client.conversation}
                  />
                )}

                {client.bookingInProgress && (
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
                    <span className="text-lg">Booking in progress</span>
                  </div>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={() => setIsExpanded(false)}
                className={cn(
                  "absolute top-4 right-4 p-2 rounded-lg transition-colors",
                  isDark 
                    ? "hover:bg-white/10 text-white/60" 
                    : "hover:bg-black/10 text-black/60"
                )}
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}