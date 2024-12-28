import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import { useTheme } from '../../hooks/useTheme';
import { 
  Bell, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  User, 
  ChevronUp,
  X,
  PhoneCall,
  MessageCircle,
  Mail,
  Badge,
  FileText,
  AlertCircle
} from 'lucide-react';

const PriorityDashboard = () => {
  const { isDark } = useTheme();
  const [claims] = useState([
    {
      id: 1,
      ticketNumber: "TKT-2024-001",
      clientName: "John Doe",
      claimType: "Health Insurance",
      priority: "high",
      callbackTime: "2024-12-27 14:00",
      status: "pending",
      sentiment: "frustrated",
      grievanceType: "Claim Rejection",
      lastInteraction: "2024-12-26 10:30",
      isOnline: true,
      email: "john.doe@example.com",
      phone: "+1 (555) 123-4567",
      policyNumber: "POL-2024-001",
      description: "Client reported issues with claim rejection for recent medical procedure.",
      notes: "Multiple follow-up attempts made. Client expressed significant frustration with process."
    },
    {
      id: 2,
      ticketNumber: "TKT-2024-002",
      clientName: "Jane Smith",
      claimType: "Auto Insurance",
      priority: "medium",
      callbackTime: "2024-12-27 16:00",
      status: "scheduled",
      sentiment: "neutral",
      grievanceType: "Delay in Processing",
      lastInteraction: "2024-12-26 11:45",
      isOnline: false,
      email: "jane.smith@example.com",
      phone: "+1 (555) 987-6543",
      policyNumber: "POL-2024-002",
      description: "Pending resolution for vehicle damage claim from accident on Dec 15.",
      notes: "Documentation received, awaiting adjuster review."
    },
    // Adding more items to demonstrate scroll
    ...Array(4).fill(null).map((_, index) => ({
      id: index + 3,
      ticketNumber: `TKT-2024-${String(index + 3).padStart(3, '0')}`,
      clientName: `Test Client ${index + 3}`,
      claimType: "Life Insurance",
      priority: ["low", "medium", "high"][index % 3],
      callbackTime: "2024-12-28 10:00",
      status: "pending",
      sentiment: "neutral",
      grievanceType: "Documentation Issue",
      lastInteraction: "2024-12-26 09:00",
      isOnline: Boolean(index % 2),
      email: `client${index + 3}@example.com`,
      phone: `+1 (555) ${String(index + 1).padStart(3, '0')}-${String(index + 1000).slice(1)}`,
      policyNumber: `POL-2024-00${index + 3}`,
      description: "Standard documentation review pending.",
      notes: "Awaiting client response on required documents."
    }))
  ]);

  const [selectedClaim, setSelectedClaim] = useState(null);

  const handleClaimClick = (claim) => {
    setSelectedClaim(claim);
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: isDark ? "bg-red-500/20 text-red-400" : "bg-red-100 text-red-800",
      medium: isDark ? "bg-yellow-500/20 text-yellow-400" : "bg-yellow-100 text-yellow-800",
      low: isDark ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-800"
    };
    return colors[priority] || colors.low;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      month: 'short',
      day: 'numeric'
    });
  };

  const scrollToTop = () => {
    const container = document.getElementById('claims-container');
    if (container) {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Detail section components
  const DetailItem = ({ icon: Icon, label, value }) => {
    const getValueStyle = () => {
      // For phone numbers
      if (/^\+1 \(\d{3}\) \d{3}-\d{3}$/.test(value)) {
        return isDark 
          ? "bg-purple-500/20 text-purple-400 border-purple-500/20" 
          : "bg-purple-100 text-purple-800 border-purple-200";
      }
      // For email addresses
      if (value.includes('@')) {
        return isDark 
          ? "bg-blue-500/20 text-blue-400 border-blue-500/20" 
          : "bg-blue-100 text-blue-800 border-blue-200";
      }
      // For policy numbers
      if (value.startsWith('POL-')) {
        return isDark 
          ? "bg-amber-500/20 text-amber-400 border-amber-500/20" 
          : "bg-amber-100 text-amber-800 border-amber-200";
      }
      // For ticket numbers
      if (value.startsWith('TKT-')) {
        return isDark 
          ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/20" 
          : "bg-cyan-100 text-cyan-800 border-cyan-200";
      }
      // For priority status
      if (['HIGH', 'MEDIUM', 'LOW'].includes(value)) {
        const priorityColors = {
          HIGH: isDark ? "bg-red-500/20 text-red-400 border-red-500/20" : "bg-red-100 text-red-800 border-red-200",
          MEDIUM: isDark ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/20" : "bg-yellow-100 text-yellow-800 border-yellow-200",
          LOW: isDark ? "bg-green-500/20 text-green-400 border-green-500/20" : "bg-green-100 text-green-800 border-green-200"
        };
        return priorityColors[value];
      }
      // For grievance type
      if (label === "Grievance Type") {
        return isDark 
          ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/20" 
          : "bg-indigo-100 text-indigo-800 border-indigo-200";
      }
      // Default style
      return isDark ? "text-white" : "text-black";
    };

    const isSpecialValue = /^\+1 \(\d{3}\) \d{3}-\d{3}$/.test(value) || 
                          value.includes('@') || 
                          value.startsWith('POL-') || 
                          value.startsWith('TKT-') || 
                          ['HIGH', 'MEDIUM', 'LOW'].includes(value) ||
                          label === "Grievance Type";

    return (
      <div className={cn(
        "flex items-center gap-3 p-3 rounded-lg transition-all duration-200",
        isDark 
          ? "bg-black/20 border border-white/10 hover:bg-black/30" 
          : "bg-white/10 border border-black/10 hover:bg-white/20"
      )}>
        <div className={cn(
          "p-2 rounded-lg",
          isDark ? "bg-black/30" : "bg-white/20"
        )}>
          <Icon className={cn(
            "w-4 h-4",
            isDark ? "text-white/70" : "text-black/70"
          )} />
        </div>
        <div className="flex flex-col gap-1.5">
          <p className={cn(
            "text-xs",
            isDark ? "text-white/50" : "text-black/50"
          )}>
            {label}
          </p>
          {isSpecialValue ? (
            <div className={cn(
              "px-2.5 py-1 rounded-md text-sm font-medium border transition-colors duration-200 inline-block",
              getValueStyle()
            )}>
              {value}
            </div>
          ) : (
            <p className={cn(
              "font-medium",
              isDark ? "text-white" : "text-black"
            )}>
              {value}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={cn(
      "rounded-xl overflow-hidden h-[600px] w-full flex flex-col",
      isDark 
        ? "bg-black/20 border border-white/10" 
        : "bg-white/10 border border-black/10"
    )}>
      {/* Header */}
      <div className={cn(
        "p-6",
        isDark 
          ? "border-b border-white/10" 
          : "border-b border-black/10"
      )}>
        <div className="flex items-center gap-2">
          <Bell className={cn(
            "w-5 h-5 flex-shrink-0",
            isDark ? "text-white/70" : "text-black/70"
          )} />
          <h2 className={cn(
            "text-lg font-semibold",
            isDark ? "text-white" : "text-black"
          )}>
            Priority Claims Dashboard
          </h2>
        </div>
      </div>

      {/* Claims List */}
      <div 
        id="claims-container"
        className="flex-1 overflow-y-auto p-6 space-y-4 relative scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-400"
      >
        {claims.map((claim) => (
          <div key={claim.id} className="relative" onClick={() => handleClaimClick(claim)}>
            {/* Online Status Indicator */}
            {claim.isOnline && (
              <motion.div
                className="absolute -right-1 -top-1 flex items-center justify-center z-10"
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
              >
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <div className="absolute w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              </motion.div>
            )}

            {/* Claim Card */}
            <motion.div 
              whileHover={{ scale: 1.01 }}
              className={cn(
                "p-4 rounded-lg transition-colors duration-200 cursor-pointer",
                isDark 
                  ? "bg-black/20 border border-white/10 hover:bg-black/30" 
                  : "bg-white/10 border border-black/10 hover:bg-white/20"
              )}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "p-2 rounded-lg flex-shrink-0",
                    isDark 
                      ? "bg-black/20 border border-white/10" 
                      : "bg-white/10 border border-black/10"
                  )}>
                    <User className={cn(
                      "w-4 h-4",
                      isDark ? "text-white/70" : "text-black/70"
                    )} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center flex-wrap gap-2">
                      <h3 className={cn(
                        "font-medium truncate",
                        isDark ? "text-white" : "text-black"
                      )}>
                        {claim.clientName}
                      </h3>
                      <span className={cn(
                        "px-2 py-1 rounded text-xs font-medium flex-shrink-0",
                        getPriorityColor(claim.priority)
                      )}>
                        {claim.priority.toUpperCase()}
                      </span>
                      {claim.sentiment === "frustrated" && (
                        <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className={cn(
                      "text-sm mt-1",
                      isDark ? "text-white/60" : "text-black/60"
                    )}>
                      {claim.claimType} - {claim.grievanceType}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col lg:items-end gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className={cn(
                      "w-4 h-4 flex-shrink-0",
                      isDark ? "text-white/40" : "text-black/40"
                    )} />
                    <span className={cn(
                      isDark ? "text-white/60" : "text-black/60"
                    )}>
                      {formatDate(claim.callbackTime)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className={cn(
                      "w-4 h-4 flex-shrink-0",
                      isDark ? "text-white/40" : "text-black/40"
                    )} />
                    <span className={cn(
                      isDark ? "text-white/60" : "text-black/60"
                    )}>
                      {formatDate(claim.lastInteraction)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button className={cn(
                  "px-3 py-1.5 text-sm rounded-lg transition-colors duration-200",
                  isDark 
                    ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/20" 
                    : "bg-blue-100 text-blue-800 hover:bg-blue-200 border border-blue-200"
                )}>
                  Reschedule
                </button>
                <button className={cn(
                  "px-3 py-1.5 text-sm rounded-lg transition-colors duration-200",
                  isDark 
                    ? "bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/20" 
                    : "bg-green-100 text-green-800 hover:bg-green-200 border border-green-200"
                )}>
                  Mark Complete
                </button>
              </div>
            </motion.div>
          </div>
        ))}
      </div>

      {/* Detailed View Modal */}
      <AnimatePresence>
        {selectedClaim && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedClaim(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", duration: 0.3 }}
              className={cn(
                "w-full max-w-2xl mx-auto my-4 sm:my-8 p-4 sm:p-6 rounded-xl shadow-xl backdrop-blur-sm max-h-[90vh] overflow-y-auto",
                isDark 
                  ? "bg-black/90 border border-white/10" 
                  : "bg-white/95 border border-black/10",
                "overflow-hidden"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    isDark ? "bg-black/20 border border-white/10" : "bg-white/10 border border-black/10"
                  )}>
                    <User className={cn(
                      "w-5 h-5",
                      isDark ? "text-white/70" : "text-black/70"
                    )} />
                  </div>
                  <div>
                    <h3 className={cn(
                      "text-xl font-semibold",
                      isDark ? "text-white" : "text-black"
                    )}>
                      {selectedClaim.clientName}
                    </h3>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-white/60" : "text-black/60"
                    )}>
                      {selectedClaim.claimType}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedClaim(null)}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    isDark 
                      ? "hover:bg-white/10" 
                      : "hover:bg-black/10"
                  )}
                >
                  <X className={cn(
                    "w-5 h-5",
                    isDark ? "text-white/70" : "text-black/70"
                  )} />
                </button>
              </div>

              {/* Content Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <DetailItem
                  icon={PhoneCall}
                  label="Phone Number"
                  value={selectedClaim.phone}
                />
                <DetailItem
                  icon={Mail}
                  label="Email"
                  value={selectedClaim.email}
                />
                <DetailItem
                  icon={Badge}
                  label="Policy Number"
                  value={selectedClaim.policyNumber}
                />
                <DetailItem
                  icon={AlertCircle}
                  label="Priority Status"
                  value={selectedClaim.priority.toUpperCase()}
                />
                <DetailItem
                  icon={FileText}
                  label="Grievance Type"
                  value={selectedClaim.grievanceType}
                />
                <DetailItem
                  icon={FileText}
                  label="Ticket Number"
                  value={selectedClaim.ticketNumber}
                />
              </div>

              {/* Description Section */}
              <div className={cn(
                "p-4 rounded-lg mb-6 transition-all duration-200",
                isDark 
                  ? "bg-black/20 border border-white/10" 
                  : "bg-white/10 border border-black/10"
              )}>
                <h4 className={cn(
                  "font-medium mb-2",
                  isDark ? "text-white" : "text-black"
                )}>
                  Case Description
                </h4>
                <p className={cn(
                  "text-sm",
                  isDark ? "text-white/70" : "text-black/70"
                )}>
                  {selectedClaim.description}
                </p>
              </div>

              {/* Notes Section */}
              <div className={cn(
                "p-4 rounded-lg mb-6",
                isDark ? "bg-black/20" : "bg-gray-100"
              )}>
                <h4 className={cn(
                  "font-medium mb-2",
                  isDark ? "text-white" : "text-black"
                )}>
                  Agent Notes
                </h4>
                <p className={cn(
                  "text-sm",
                  isDark ? "text-white/70" : "text-black/70"
                )}>
                  {selectedClaim.notes}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "px-4 py-2 rounded-lg flex items-center gap-2 transition-colors",
                    isDark 
                      ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/20" 
                      : "bg-blue-100 text-blue-800 hover:bg-blue-200 border border-blue-200"
                  )}
                >
                  <MessageCircle className="w-4 h-4" />
                  Contact Client
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "px-4 py-2 rounded-lg flex items-center gap-2 transition-colors",
                    isDark 
                      ? "bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/20" 
                      : "bg-green-100 text-green-800 hover:bg-green-200 border border-green-200"
                  )}
                >
                  <Calendar className="w-4 h-4" />
                  Schedule Follow-up
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={cn(
          "absolute bottom-4 right-4 p-2 rounded-full transition-colors duration-200",
          isDark 
            ? "bg-white/10 hover:bg-white/20 text-white/70" 
            : "bg-black/10 hover:bg-black/20 text-black/70"
        )}
      >
        <ChevronUp className="w-5 h-5" />
      </button>
    </div>
  );
};

export default PriorityDashboard;