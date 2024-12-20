import React, { useState } from 'react';
import { User, AlertCircle, Calendar, Clock, Expand, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../utils/cn';
import { useTheme } from '../../../hooks/useTheme';
import PriorityBadge from './PriorityBadge';
import AudioPlayer from './AudioPlayer';
import MeetingNotes from './MeetingNotes';
import { BorderBeam } from '../../../components/magicui/border-beam';

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
  const [isHovered, setIsHovered] = useState(false);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  return (
    <>
      <motion.div
        className={cn(
          "rounded-xl backdrop-blur-lg border relative p-6 overflow-hidden transition-colors duration-200",
          isDark ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-black/5 border-black/10 hover:bg-black/10"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Border Beam */}
        <div className="absolute inset-0 overflow-hidden">
          <div className={cn(
            "absolute left-0 top-0 w-[200%] h-[200%] transition-opacity duration-300",
            isHovered ? "opacity-100" : "opacity-0"
          )}>
            <div className="absolute left-0 top-0 w-full h-px">
              <BorderBeam size={100} duration={3} delay={0} />
            </div>
            <div className="absolute right-0 top-0 w-px h-full">
              <BorderBeam size={100} duration={3} delay={0} />
            </div>
            <div className="absolute left-0 bottom-0 w-full h-px">
              <BorderBeam size={100} duration={3} delay={0} />
            </div>
            <div className="absolute left-0 top-0 w-px h-full">
              <BorderBeam size={100} duration={3} delay={0} />
            </div>
          </div>
        </div>

        {/* Header Section */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-2">
            <PriorityBadge priority={client.priority} />
          </div>
          <span className={cn("text-sm", isDark ? "text-white/40" : "text-black/40")}>
            {client.timestamp}
          </span>
        </div>

        {/* Client Info Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <User className={isDark ? "text-white/60" : "text-black/60"} />
            <h3 className={cn("text-lg font-semibold", isDark ? "text-white" : "text-black")}>
              {client.name}
            </h3>
          </div>

          {client.appointmentType && (
            <div className={cn("p-3 rounded-lg", isDark ? "bg-white/5" : "bg-black/5")}>
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
          <div className="mt-4 flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <span className={cn("text-sm", isDark ? "text-white/60" : "text-black/60")}>
              Booking in progress
            </span>
          </div>
        )}

        {/* Expand Button */}
        <button
          onClick={toggleExpand}
          className={cn(
            "absolute bottom-4 right-4 p-2 rounded-lg transition-colors",
            isDark ? "hover:bg-white/10" : "hover:bg-black/10"
          )}
        >
          <Expand className={cn("w-5 h-5", isDark ? "text-white/60" : "text-black/60")} />
        </button>
      </motion.div>

      {/* Expanded Modal */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={cn(
                "w-11/12 max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl p-6 relative backdrop-blur-xl border shadow-lg",
                isDark 
                  ? "bg-black/80 text-white border-white/10" 
                  : "bg-white/80 text-black border-black/10"
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <PriorityBadge priority={client.priority} />
                  <span className={cn("text-sm", isDark ? "text-white/60" : "text-black/60")}>
                    {client.timestamp}
                  </span>
                </div>
                <button
                  onClick={toggleExpand}
                  className={cn(
                    "p-2 rounded-full transition-colors",
                    isDark ? "hover:bg-white/10" : "hover:bg-black/10"
                  )}
                >
                  <X className={cn("w-5 h-5", isDark ? "text-white/60" : "text-black/60")} />
                </button>
              </div>

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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}