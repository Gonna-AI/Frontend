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
  {
    name: "Sarah Johnson",
    priority: "medium",
    timestamp: "15 minutes ago",
    appointmentType: "Insurance Policy Review",
    bookingInProgress: false,
    preferredDay: "Wednesday",
    preferredTime: "2:30 PM",
    callDuration: "12:45",
    meetingSummary: "Reviewed current policy coverage and discussed potential upgrades. Client interested in adding dental coverage. Follow-up scheduled for next week.",
    conversation: [
      "AI: Welcome Sarah! I see you're interested in reviewing your insurance policy.",
      "Client: Yes, I'd like to know more about dental coverage options.",
      "AI: I'll be happy to help. Your current plan is the Silver Package. Would you like to compare it with plans that include dental?",
      "Client: That would be great. What are my options?",
      "AI: Let me show you our Gold and Platinum packages which include comprehensive dental coverage..."
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
    meetingSummary: "Emergency room visit claim review. Client needs immediate assistance with pre-authorization. Escalated to urgent processing.",
    conversation: [
      "AI: Hello Michael, I see this is regarding an urgent care claim. How can I assist you?",
      "Client: I need help with a pre-authorization for an ER visit.",
      "AI: I understand this is time-sensitive. I'm looking at your case now. When did the ER visit occur?",
      "Client: Last night around 9 PM.",
      "AI: Thank you. I'm expediting this case right now. Let me walk you through the process..."
    ]
  },
  {
    name: "Emily Rodriguez",
    priority: "low",
    timestamp: "1 hour ago",
    appointmentType: "General Inquiry",
    bookingInProgress: false,
    preferredDay: null,
    preferredTime: null,
    callDuration: "08:15",
    meetingSummary: "General questions about coverage limits and deductibles. Provided detailed explanation of current policy terms.",
    conversation: [
      "AI: Hi Emily! How can I help you today?",
      "Client: I have some questions about my coverage limits.",
      "AI: I'd be happy to explain those. Which specific areas would you like to know more about?",
      "Client: Mainly about deductibles and out-of-pocket maximums.",
      "AI: Let me break down those numbers for you..."
    ]
  },
  {
    name: "David Kim",
    priority: "medium",
    timestamp: "2 hours ago",
    appointmentType: "Policy Update",
    bookingInProgress: false,
    preferredDay: "Thursday",
    preferredTime: "3:45 PM",
    callDuration: "10:50",
    meetingSummary: "Discussed policy updates and new coverage options. Client requested information about family plan expansion.",
    conversation: [
      "AI: Good morning David! I understand you're interested in updating your policy.",
      "Client: Yes, I need to add my new baby to our family plan.",
      "AI: Congratulations! I'll help you with that right away. When was your baby born?",
      "Client: Two weeks ago, on the 15th.",
      "AI: Perfect, let me guide you through the process of adding your new family member..."
    ]
  }
];

interface RecentActivityDetailProps {
  onClose: () => void;
}

export default function RecentActivityDetail({ onClose }: RecentActivityDetailProps) {
  const { isDark } = useTheme();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "fixed inset-0 z-50",
        isDark ? "bg-black/90" : "bg-white/90",
        "backdrop-blur-xl"
      )}
    >
      {/* Header - Fixed at the top */}
      <div className={cn(
        "sticky top-0 z-10 px-4 py-3 md:px-6 md:py-4",
        isDark ? "bg-black/90" : "bg-white/90",
        "backdrop-blur-xl border-b",
        isDark ? "border-white/10" : "border-black/10"
      )}>
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <h2 className={cn(
              "text-xl md:text-2xl font-bold",
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
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="h-[calc(100%-4rem)] overflow-y-auto overscroll-contain">
        <div className="px-4 py-3 md:px-6 md:py-4">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
            >
              <AnimatePresence mode="popLayout">
                {mockClients.map((client, index) => (
                  <div key={index} className="w-full">
                    <ActivityCard
                      client={client}
                      isExpanded={expandedId === index}
                      onExpand={() => setExpandedId(expandedId === index ? null : index)}
                    />
                  </div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}