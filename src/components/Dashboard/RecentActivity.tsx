// ActivityDashboard.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import { useTheme } from '../../hooks/useTheme';

// Previous interfaces remain the same
interface Client {
  name: string;
  priority: string;
  timestamp: string;
  appointmentType: string;
  bookingInProgress: boolean;
  preferredDay: string;
  preferredTime: string;
  callDuration: string;
  audioUrl: string;
  meetingSummary: string;
  conversation: string[];
}

interface AudioPlayerProps {
  audioUrl: string;
  onTimeUpdate?: (currentTime: number) => void;
}

interface ActivityCardProps {
  client: Client;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

// Mock data remains the same
const mockClients = [/* ... previous mock data ... */];

// AudioPlayer component remains the same
function AudioPlayer({ audioUrl, onTimeUpdate }: AudioPlayerProps) {
  // ... previous AudioPlayer implementation ...
}

// Updated ActivityCard for more symmetric design
function ActivityCard({ client, isExpanded, onToggleExpand }: ActivityCardProps) {
  const { isDark } = useTheme();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        "p-5 rounded-2xl transition-all",
        "border backdrop-blur-lg",
        isDark 
          ? "bg-white/5 hover:bg-white/[0.07] border-white/10" 
          : "bg-black/5 hover:bg-black/[0.07] border-black/10",
      )}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className={cn(
              "font-medium",
              isDark ? "text-white" : "text-black"
            )}>{client.name}</h3>
            <span className={cn(
              "px-2 py-0.5 text-xs rounded-full",
              client.priority === "high" 
                ? "bg-red-500/10 text-red-500" 
                : "bg-yellow-500/10 text-yellow-500"
            )}>
              {client.priority}
            </span>
          </div>
          <p className={cn(
            "text-sm",
            isDark ? "text-white/60" : "text-black/60"
          )}>{client.appointmentType}</p>
        </div>
        <button
          onClick={onToggleExpand}
          className={cn(
            "p-1.5 rounded-lg transition-colors",
            isDark ? "hover:bg-white/10" : "hover:bg-black/10"
          )}
        >
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Basic Info */}
      <div className={cn(
        "text-sm grid grid-cols-2 gap-2",
        isDark ? "text-white/60" : "text-black/60"
      )}>
        <p>{client.timestamp}</p>
        <p className="text-right">Duration: {client.callDuration}</p>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-4 space-y-4"
          >
            {/* Audio Player */}
            <div className="border-t border-b py-4">
              <AudioPlayer audioUrl={client.audioUrl} />
            </div>

            {/* Meeting Summary */}
            <div>
              <h4 className="font-medium mb-2 text-sm">Meeting Summary</h4>
              <p className={cn(
                "text-sm",
                isDark ? "text-white/80" : "text-black/80"
              )}>{client.meetingSummary}</p>
            </div>
            
            {/* Conversation */}
            <div>
              <h4 className="font-medium mb-2 text-sm">Conversation</h4>
              <div className="space-y-2">
                {client.conversation.map((message, index) => (
                  <p key={index} className={cn(
                    "text-sm",
                    isDark ? "text-white/80" : "text-black/80"
                  )}>
                    {message}
                  </p>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Updated Dashboard Component for symmetric layout
export default function ActivityDashboard() {
  const { isDark } = useTheme();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  const displayedClients = showAll ? mockClients : mockClients.slice(0, 4); // Show 4 for grid layout

  return (
    <motion.div
      layout
      className={cn(
        "rounded-2xl",
        "border backdrop-blur-lg",
        isDark 
          ? "bg-white/5 border-white/10" 
          : "bg-black/5 border-black/10"
      )}
    >
      {/* Header */}
      <div className="p-5 border-b border-inherit">
        <div className="flex justify-between items-center">
          <h2 className={cn(
            "text-lg font-medium",
            isDark ? "text-white" : "text-black"
          )}>
            Recent Activities
          </h2>
          <button
            onClick={() => setShowAll(!showAll)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors text-sm",
              isDark 
                ? "hover:bg-white/10 text-white" 
                : "hover:bg-black/10 text-black"
            )}
          >
            {showAll ? 'Show Less' : 'View All'}
            <ChevronRight className={cn(
              "w-4 h-4 transition-transform",
              showAll ? "rotate-90" : ""
            )} />
          </button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="p-5">
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-max"
        >
          <AnimatePresence mode="popLayout">
            {displayedClients.map((client, index) => (
              <motion.div
                key={index}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <ActivityCard
                  client={client}
                  isExpanded={expandedId === index}
                  onToggleExpand={() => setExpandedId(expandedId === index ? null : index)}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Placeholder when no activities */}
          {displayedClients.length === 0 && (
            <div className={cn(
              "col-span-full p-8 text-center rounded-xl",
              isDark ? "bg-white/5" : "bg-black/5"
            )}>
              <p className={cn(
                "text-lg font-medium",
                isDark ? "text-white/60" : "text-black/60"
              )}>
                No recent activities
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}