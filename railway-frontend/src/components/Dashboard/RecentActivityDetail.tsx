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
  }
];

interface RecentActivityDetailProps {
  onClose: () => void;
  isOpen: boolean;
}

export default function RecentActivityDetail({ onClose, isOpen }: RecentActivityDetailProps) {
  const { isDark } = useTheme();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Desktop View */}
          <div className="hidden md:block">
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
              <div className={cn(
                "sticky top-0 z-10 px-6 py-4",
                isDark ? "bg-black/90" : "bg-white/90",
                "backdrop-blur-xl border-b",
                isDark ? "border-white/10" : "border-black/10"
              )}>
                <div className="max-w-7xl mx-auto">
                  <div className="flex justify-between items-center">
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
                </div>
              </div>

              <div className="h-[calc(100%-4rem)] overflow-y-auto">
                <div className="px-6 py-4">
                  <div className="max-w-7xl mx-auto">
                    <motion.div 
                      layout
                      className="grid grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                      <AnimatePresence mode="popLayout">
                        {mockClients.map((client, index) => (
                          <div key={index}>
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
          </div>

          {/* Mobile View */}
          <div className="md:hidden">
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 500 }}
              className={cn(
                "fixed bottom-0 left-0 right-0 z-50",
                "h-[85vh]",
                isDark ? "bg-black" : "bg-white",
                "rounded-t-xl border-t",
                isDark ? "border-white/10" : "border-black/10"
              )}
            >
              {/* Mobile Header */}
              <div className={cn(
                "sticky top-0 z-10 px-4 py-3",
                isDark ? "bg-black" : "bg-white",
                "border-b",
                isDark ? "border-white/10" : "border-black/10"
              )}>
                <div className="flex justify-between items-center">
                  <h2 className={cn(
                    "text-lg font-semibold",
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
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Mobile Content */}
              <div className="h-[calc(100%-3.5rem)] overflow-y-auto overscroll-contain px-4 py-3">
                <motion.div layout className="flex flex-col gap-3">
                  <AnimatePresence mode="popLayout">
                    {mockClients.map((client, index) => (
                      <div key={index}>
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
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

