import React from 'react';
import { X } from 'lucide-react';
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
    name: "Alice Smith",
    priority: "medium",
    timestamp: "15 minutes ago",
    appointmentType: "Insurance Claim",
    bookingInProgress: false,
    preferredDay: "Wednesday",
    preferredTime: "2:00 PM",
    callDuration: "12:45",
    meetingSummary: "Reviewed insurance claim details. Client had questions about coverage limits. Provided detailed explanation of policy terms.",
    conversation: [
      "AI: Good afternoon! I see you're calling about your insurance claim. How can I help?",
      "Client: I'm confused about my coverage limits.",
      "AI: I'll be happy to explain. According to your policy...",
      "Client: That makes more sense now. Could you send me this in writing?",
      "AI: Absolutely! I'll email you a detailed breakdown right away."
    ]
  },
  {
    name: "Bob Johnson",
    priority: "low",
    timestamp: "1 hour ago",
    appointmentType: null,
    bookingInProgress: false,
    preferredDay: null,
    preferredTime: null,
    callDuration: "08:15",
    meetingSummary: "General inquiry about policy updates. Provided overview of recent changes and sent documentation via email.",
    conversation: [
      "AI: Hello! How may I assist you today?",
      "Client: I heard there were some policy updates. Can you tell me about them?",
      "AI: Of course! The main changes include...",
      "Client: Great, thanks for explaining.",
      "AI: You're welcome! I'll send you the full documentation by email."
    ]
  }
];

interface RecentActivityDetailProps {
  onClose: () => void;
}

export default function RecentActivityDetail({ onClose }: RecentActivityDetailProps) {
  const { isDark } = useTheme();

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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockClients.map((client, index) => (
              <ActivityCard key={index} client={client} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}