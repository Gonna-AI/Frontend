import React from 'react';
import { User, AlertCircle, Calendar, Clock, ChevronRight } from 'lucide-react';
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
  isExpanded: boolean;
  onExpand: () => void;
}

export default function ActivityCard({ client, isExpanded, onExpand }: ActivityCardProps) {
  const { isDark } = useTheme();

  return (
    <motion.div
      layout="position"
      initial={false}
      animate={{
        scale: 1,
        transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] }
      }}
      className={cn(
        "rounded-xl backdrop-blur-lg border relative overflow-hidden",
        isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10",
        isExpanded ? "md:col-span-3" : "col-span-1"
      )}
    >
      {/* Expand Button */}
      <motion.button
        animate={{ rotate: isExpanded ? 90 : 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        onClick={onExpand}
        className={cn(
          "absolute top-4 left-4 p-2 rounded-lg z-10 transition-colors",
          isDark ? "hover:bg-white/10" : "hover:bg-black/10"
        )}
      >
        <ChevronRight className={cn(
          "w-5 h-5",
          isDark ? "text-white/60" : "text-black/60"
        )} />
      </motion.button>

      <motion.div 
        layout="position"
        className="p-6"
      >
        {/* Header Section */}
        <motion.div layout="position" className="flex justify-between items-start mb-4 pl-8">
          <PriorityBadge priority={client.priority} />
          <span className={cn(
            "text-sm",
            isDark ? "text-white/40" : "text-black/40"
          )}>
            {client.timestamp}
          </span>
        </motion.div>

        {/* Content Grid */}
        <motion.div
          layout="position"
          className={cn(
            "grid gap-4",
            isExpanded ? "md:grid-cols-2" : "grid-cols-1"
          )}
        >
          {/* Basic Info Section */}
          <motion.div layout="position" className="space-y-4">
            <div className="flex items-center space-x-3">
              <User className={isDark ? "text-white/60" : "text-black/60"} />
              <h3 className={cn(
                "text-lg font-semibold",
                isDark ? "text-white" : "text-black"
              )}>
                {client.name}
              </h3>
            </div>

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
          </motion.div>

          {/* Expanded Content */}
          <AnimatePresence mode="wait">
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                className="space-y-4"
              >
                {client.callDuration && <AudioPlayer duration={client.callDuration} />}
                {client.meetingSummary && client.conversation && (
                  <MeetingNotes
                    summary={client.meetingSummary}
                    conversation={client.conversation}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Booking Status */}
        {client.bookingInProgress && (
          <motion.div layout="position" className="mt-4 flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <span className={cn(
              "text-sm",
              isDark ? "text-white/60" : "text-black/60"
            )}>
              Booking in progress
            </span>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}