import React, { useState } from 'react';
import { User, AlertCircle, Calendar, Clock } from 'lucide-react';
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
    <motion.div
      layout
      onClick={() => setIsExpanded(!isExpanded)}
      className={cn(
        "rounded-xl backdrop-blur-lg border cursor-pointer overflow-hidden",
        isDark
          ? "bg-white/5 border-white/10"
          : "bg-black/5 border-black/10"
      )}
      initial={{ scale: 1 }}
      whileHover={!isExpanded ? { scale: 1.02 } : {}}
      animate={{
        scale: 1,
        transition: { duration: 0.3 }
      }}
    >
      <motion.div
        layout="position"
        className="p-6"
      >
        {/* Priority Badge */}
        <motion.div layout="position" className="flex justify-between items-start mb-4">
          <PriorityBadge priority={client.priority} />
          <span className={cn(
            "text-sm",
            isDark ? "text-white/40" : "text-black/40"
          )}>
            {client.timestamp}
          </span>
        </motion.div>

        {/* Client Name */}
        <motion.div layout="position" className="flex items-center space-x-3 mb-4">
          <User className={isDark ? "text-white/60" : "text-black/60"} />
          <h3 className={cn(
            "text-lg font-semibold",
            isDark ? "text-white" : "text-black"
          )}>
            {client.name}
          </h3>
        </motion.div>

        {/* Appointment Details */}
        {client.appointmentType && (
          <motion.div
            layout="position"
            className={cn(
              "mb-4 p-3 rounded-lg",
              isDark ? "bg-white/5" : "bg-black/5"
            )}
          >
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="w-4 h-4 text-blue-400" />
              <span className={isDark ? "text-white/60" : "text-black/60"}>
                Appointment Type
              </span>
            </div>
            <span className={cn(
              "text-sm font-medium",
              isDark ? "text-white" : "text-black"
            )}>
              {client.appointmentType}
            </span>
          </motion.div>
        )}

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ 
                opacity: 1, 
                height: "auto",
                transition: {
                  height: {
                    duration: 0.4,
                    ease: [0.04, 0.62, 0.23, 0.98]
                  },
                  opacity: { duration: 0.25, delay: 0.15 }
                }
              }}
              exit={{ 
                opacity: 0, 
                height: 0,
                transition: {
                  height: { duration: 0.3 },
                  opacity: { duration: 0.2 }
                }
              }}
              className="space-y-4 mt-4"
            >
              {client.callDuration && (
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <AudioPlayer duration={client.callDuration} />
                </motion.div>
              )}
              
              {client.meetingSummary && client.conversation && (
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <MeetingNotes
                    summary={client.meetingSummary}
                    conversation={client.conversation}
                  />
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Time Slot */}
        <motion.div layout="position">
          {(client.preferredDay || client.preferredTime) && (
            <div className="space-y-2 mt-4">
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
        </motion.div>

        {/* Booking Status */}
        <motion.div layout="position">
          {client.bookingInProgress && (
            <div className="mt-4 flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <span className={cn(
                "text-sm",
                isDark ? "text-white/60" : "text-black/60"
              )}>
                Booking in progress
              </span>
            </div>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}