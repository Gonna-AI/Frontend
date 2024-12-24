// ActivityDashboard.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import { useTheme } from '../../hooks/useTheme';

// Types
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

// Mock Data
const mockClients: Client[] = [
  {
    name: "John Doe",
    priority: "high",
    timestamp: "2 minutes ago",
    appointmentType: "Medical Claim Review",
    bookingInProgress: true,
    preferredDay: "Monday",
    preferredTime: "10:00 AM",
    callDuration: "15:30",
    audioUrl: "/sample-audio-1.mp3",
    meetingSummary: "Discussed medical claim for recent hospital visit. Client requested expedited processing due to urgent nature.",
    conversation: [
      "AI: Hello! I notice this is a high-priority medical claim. How can I assist you today?",
      "Client: I need help with processing my recent hospital claim. It's quite urgent.",
      "AI: I'll mark this as high priority. You should receive an update within 24-48 hours."
    ]
  },
  {
    name: "Sarah Johnson",
    priority: "medium",
    timestamp: "15 minutes ago",
    appointmentType: "Insurance Policy Review",
    bookingInProgress: false,
    preferredDay: "Wednesday",
    preferredTime: "2:30 PM",
    callDuration: "12:45",
    audioUrl: "/sample-audio-2.mp3",
    meetingSummary: "Reviewed current policy coverage and discussed dental coverage options.",
    conversation: [
      "AI: Welcome Sarah! I see you're interested in reviewing your insurance policy.",
      "Client: Yes, I'd like to know more about dental coverage options.",
      "AI: Let me show you our available dental coverage plans."
    ]
  },
  {
    name: "Michael Chen",
    priority: "high",
    timestamp: "45 minutes ago",
    appointmentType: "Urgent Care Claim",
    bookingInProgress: true,
    preferredDay: "Friday",
    preferredTime: "11:15 AM",
    callDuration: "18:20",
    audioUrl: "/sample-audio-3.mp3",
    meetingSummary: "Emergency room visit claim review. Escalated to urgent processing.",
    conversation: [
      "AI: Hello Michael, I see this is regarding an urgent care claim.",
      "Client: Yes, I need help with a pre-authorization for an ER visit.",
      "AI: I'm expediting this case right now."
    ]
  },
  // Add more mock clients...
];

// Audio Player Component
function AudioPlayer({ audioUrl, onTimeUpdate }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { isDark } = useTheme();

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener('loadedmetadata', () => {
        setDuration(audioRef.current?.duration || 0);
      });

      audioRef.current.addEventListener('timeupdate', () => {
        setCurrentTime(audioRef.current?.currentTime || 0);
        onTimeUpdate?.(audioRef.current?.currentTime || 0);
      });

      // Cleanup listeners
      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('loadedmetadata', () => {});
          audioRef.current.removeEventListener('timeupdate', () => {});
        }
      };
    }
  }, [onTimeUpdate]);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, currentTime - 10);
    }
  };

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(duration, currentTime + 10);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  return (
    <div className="space-y-2">
      <audio ref={audioRef} src={audioUrl} />
      
      {/* Progress bar */}
      <div className="relative w-full h-1 bg-gray-200 rounded-full">
        <input
          type="range"
          min={0}
          max={duration}
          value={currentTime}
          onChange={handleSeek}
          className="absolute w-full h-full opacity-0 cursor-pointer"
        />
        <div 
          className="h-full bg-blue-500 rounded-full"
          style={{ width: `${(currentTime / duration) * 100}%` }}
        />
      </div>
      
      {/* Time display */}
      <div className="flex justify-between text-sm">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={skipBackward}
          className={cn(
            "p-2 rounded-full transition-colors",
            isDark ? "hover:bg-white/10" : "hover:bg-black/10"
          )}
        >
          <SkipBack className="w-5 h-5" />
        </button>

        <button
          onClick={togglePlayPause}
          className={cn(
            "p-3 rounded-full transition-colors",
            isDark ? "bg-white/10 hover:bg-white/20" : "bg-black/10 hover:bg-black/20"
          )}
        >
          {isPlaying ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6" />
          )}
        </button>

        <button
          onClick={skipForward}
          className={cn(
            "p-2 rounded-full transition-colors",
            isDark ? "hover:bg-white/10" : "hover:bg-black/10"
          )}
        >
          <SkipForward className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// Activity Card Component
function ActivityCard({ client, isExpanded, onToggleExpand }: ActivityCardProps) {
  const { isDark } = useTheme();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        "p-4 rounded-xl transition-all",
        isDark ? "bg-white/5" : "bg-black/5",
        "border",
        isDark ? "border-white/10" : "border-black/10"
      )}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className={cn(
              "font-semibold",
              isDark ? "text-white" : "text-black"
            )}>{client.name}</h3>
            <p className={cn(
              "text-sm",
              isDark ? "text-white/60" : "text-black/60"
            )}>{client.appointmentType}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              "px-2 py-1 text-xs rounded-full",
              client.priority === "high" 
                ? "bg-red-500/10 text-red-500" 
                : "bg-yellow-500/10 text-yellow-500"
            )}>
              {client.priority}
            </span>
            <button
              onClick={onToggleExpand}
              className={cn(
                "p-1 rounded-lg transition-colors",
                isDark ? "hover:bg-white/10" : "hover:bg-black/10"
              )}
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Basic Info */}
        <div className={cn(
          "text-sm",
          isDark ? "text-white/60" : "text-black/60"
        )}>
          <p>{client.timestamp}</p>
          <p>Duration: {client.callDuration}</p>
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* Audio Player */}
              <div className="border-t border-b py-4">
                <AudioPlayer audioUrl={client.audioUrl} />
              </div>

              {/* Meeting Summary */}
              <div>
                <h4 className="font-medium mb-2">Meeting Summary</h4>
                <p className="text-sm">{client.meetingSummary}</p>
              </div>
              
              {/* Conversation */}
              <div>
                <h4 className="font-medium mb-2">Conversation</h4>
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
      </div>
    </motion.div>
  );
}

// Main Dashboard Component
export default function ActivityDashboard() {
  const { isDark } = useTheme();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  const displayedClients = showAll ? mockClients : mockClients.slice(0, 3);

  return (
    <motion.div
      layout
      className={cn(
        "rounded-xl p-6",
        isDark ? "bg-white/5" : "bg-black/5",
        "border",
        isDark ? "border-white/10" : "border-black/10"
      )}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className={cn(
          "text-xl font-semibold",
          isDark ? "text-white" : "text-black"
        )}>
          Recent Activities
        </h2>
        <button
          onClick={() => setShowAll(!showAll)}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors",
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

      <motion.div 
        layout
        className="space-y-4"
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
            "p-8 text-center rounded-xl",
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
    </motion.div>
  );
}