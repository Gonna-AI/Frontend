import React, { useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import { useTheme } from '../../hooks/useTheme';
import ActivityCard from './ActivityCard';

const mockClients = [
  {
    name: "John Doe",
    priority: "high",
    timestamp: "2 minutes ago",
    appointmentType: "Medical Claim Review",
    bookingInProgress: true,
    preferredDay: "Monday",
    preferredTime: "10:00 AM",
    callDuration: "15:30",
    meetingSummary: "Discussed medical claim for recent hospital visit. Client requested expedited processing due to urgent nature. Agreed to schedule follow-up next week.",
    conversation: [
      "AI: Hello! I notice this is a high-priority medical claim. How can I assist you today?",
      "Client: I need help with processing my recent hospital claim. It's quite urgent.",
      "AI: I understand the urgency. I can see your claim from St. Mary's Hospital. Would you like me to expedite this?",
      "Client: Yes, please. When can I expect to hear back?",
      "AI: I'll mark this as high priority. You should receive an update within 24-48 hours. Would you like to schedule a follow-up call?"
    ]
  },
  // ... other mock clients
];

interface RecentActivityDetailProps {
  onClose: () => void;
}

export default function RecentActivityDetail({ onClose }: RecentActivityDetailProps) {
  const { isDark } = useTheme();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <div className={cn(
      "fixed inset-0 z-50",
      isDark ? "bg-black/90" : "bg-white/90",
      "backdrop-blur-xl"
    )}>
      <div className="h-full overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className={cn(
              "text-2xl font-bold",
              isDark ? "text-white" : "text-black"
            )}>
              Recent Client Activities
            </h2>
            <button
              onClick={onClose}
              className={cn(
                "p-2 rounded-lg transition-colors",
                isDark
                  ? "hover:bg-white/10 text-white"
                  : "hover:bg-black/10 text-black"
              )}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {mockClients.map((client, index) => (
                <ActivityCard
                  key={index}
                  client={client}
                  isExpanded={expandedId === index}
                  onExpand={() => setExpandedId(expandedId === index ? null : index)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}