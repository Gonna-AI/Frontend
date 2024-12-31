import React, { useState, useEffect } from 'react';
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
  AlertCircle,
  Copy
} from 'lucide-react';
import { ticketApi } from '../../config/api';

interface Client {
  client_name: string;
  urgency: string;
  tags: string | null;
  last_interaction: string;
  follow_up_date: string;
  ticket_id: string;
  category: string;
  issue: string;
}

interface ClientDetails {
  phone: string;
  email: string;
  ticket_id: string;
  client_id: number;
}

const PriorityDashboard = () => {
  const { isDark } = useTheme();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientDetails, setClientDetails] = useState<ClientDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [showContactMenu, setShowContactMenu] = useState(false);
  const [contactMenuPosition, setContactMenuPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const fetchPriorityClients = async () => {
      try {
        const response = await ticketApi.getPriority();
        setClients(response.data);
      } catch (error) {
        console.error('Failed to fetch priority clients:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPriorityClients();
  }, []);

  const fetchSummary = async (clientId: number) => {
    setLoadingSummary(true);
    try {
      const response = await ticketApi.getSummary(clientId);
      setSummary(response.data.summary);
    } catch (error) {
      console.error('Failed to fetch conversation summary:', error);
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleClaimClick = async (client: Client) => {
    setSelectedClient(client);
    setSummary(null);
    try {
      const response = await ticketApi.getDetails(client.ticket_id);
      setClientDetails(response.data);
      fetchSummary(response.data.client_id);
    } catch (error) {
      console.error('Failed to fetch client details:', error);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      month: 'short',
      day: 'numeric'
    });
  };

  const parseTags = (tagsString: string | null): string[] => {
    if (!tagsString) return [];
    const tags = tagsString.split(',').map(tag => tag.trim());
    return tags.slice(0, 3); // Return maximum 3 tags
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: isDark ? "bg-red-500/20 text-red-400" : "bg-red-100 text-red-800",
      medium: isDark ? "bg-yellow-500/20 text-yellow-400" : "bg-yellow-100 text-yellow-800",
      low: isDark ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-800"
    };
    return colors[priority] || colors.low;
  };

  const scrollToTop = () => {
    const container = document.getElementById('claims-container');
    if (container) {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleContactClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setContactMenuPosition({
      x: rect.left,
      y: rect.top - 100
    });
    setShowContactMenu(true);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setShowContactMenu(false);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy:', err);
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showContactMenu) {
        setShowContactMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showContactMenu]);

  return (
    <div className={cn(
      "rounded-xl h-full w-full flex flex-col overflow-hidden",
      isDark 
        ? "bg-black/20 border border-white/10" 
        : "bg-white/10 border border-black/10"
    )}>
      {/* Header */}
      <div className={cn(
        "p-4 sticky top-0 z-10",
        isDark 
          ? "border-b border-white/10 bg-black/20 backdrop-blur-sm" 
          : "border-b border-black/10 bg-white/20 backdrop-blur-sm"
      )}>
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4" />
          <h2 className={cn(
            "text-base font-semibold",
            isDark ? "text-white" : "text-black"
          )}>
            Priority Claims Dashboard
          </h2>
        </div>
      </div>

      {/* Claims List */}
      <div 
        id="claims-container"
        className="flex-1 p-4 space-y-3 relative overflow-y-auto"
      >
        {clients.map((client) => (
          <div key={client.ticket_id} onClick={() => handleClaimClick(client)}>
            <motion.div 
              whileHover={{ scale: 1.01 }}
              className={cn(
                "p-3 rounded-lg transition-colors duration-200 cursor-pointer",
                isDark 
                  ? "bg-black/20 border border-white/10 hover:bg-black/30" 
                  : "bg-white/10 border border-black/10 hover:bg-white/20"
              )}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="flex items-start gap-2">
                  <div className={cn(
                    "p-1.5 rounded-lg flex-shrink-0",
                    isDark 
                      ? "bg-black/20 border border-white/10" 
                      : "bg-white/10 border border-black/10"
                  )}>
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center flex-wrap gap-2">
                      <h3 className={cn(
                        "font-medium truncate",
                        isDark ? "text-white" : "text-black"
                      )}>
                        {client.client_name || '<no name>'}
                      </h3>
                      {client.urgency && (
                        <span className={cn(
                          "px-2 py-1 rounded text-xs font-medium flex-shrink-0",
                          getPriorityColor(client.urgency.toLowerCase())
                        )}>
                          {client.urgency.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {parseTags(client.tags).map((tag, index) => (
                        <span
                          key={index}
                          className={cn(
                            "px-2 py-0.5 rounded-full text-xs font-medium",
                            isDark 
                              ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" 
                              : "bg-blue-50 text-blue-600 border border-blue-200"
                          )}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col lg:items-end gap-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <Calendar className={cn(
                      "w-4 h-4 flex-shrink-0",
                      isDark ? "text-white/40" : "text-black/40"
                    )} />
                    <span className={cn(
                      isDark ? "text-white/60" : "text-black/60"
                    )}>
                      {formatDate(client.follow_up_date)}
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
                      {formatDate(client.last_interaction)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex justify-end gap-2">
              <button className={cn(
                  "px-2.5 py-1 text-xs rounded-lg transition-colors duration-200",
                  isDark 
                    ? "bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/20" 
                    : "bg-green-100 text-green-800 hover:bg-green-200 border border-green-200"
                )}>
                  See details
                </button>
                <button 
                  onClick={() => window.location.href = `/documents?ticketId=${client.ticket_id}`}
                  className={cn(
                    "px-2.5 py-1 text-xs rounded-lg transition-colors duration-200",
                    isDark 
                      ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/20" 
                      : "bg-blue-100 text-blue-800 hover:bg-blue-200 border border-blue-200"
                  )}>
                  Check Documents
                </button>
              </div>
            </motion.div>
          </div>
        ))}
      </div>

      {/* Detailed View Modal */}
      <AnimatePresence>
        {selectedClient && clientDetails && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto"
            onClick={() => setSelectedClient(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", duration: 0.3 }}
              className={cn(
                "w-full max-w-2xl mx-auto my-4 p-4 rounded-xl shadow-xl backdrop-blur-sm",
                isDark 
                  ? "bg-black/90 border border-white/10" 
                  : "bg-white/95 border border-black/10"
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
                      {selectedClient.client_name}
                    </h3>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-white/60" : "text-black/60"
                    )}>
                      {selectedClient.category}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedClient(null)}
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
                  value={clientDetails.phone || '-'}
                />
                <DetailItem
                  icon={Mail}
                  label="Email"
                  value={clientDetails.email || '-'}
                />
                <DetailItem
                  icon={FileText}
                  label="Ticket Number"
                  value={clientDetails.ticket_id}
                />
                <DetailItem
                  icon={Badge}
                  label="Grievance Type"
                  value={selectedClient.category || '-'}
                />
                <DetailItem
                  icon={FileText}
                  label="Issue"
                  value={selectedClient.issue || '-'}
                />
                {selectedClient.urgency && (
                  <DetailItem
                    icon={AlertCircle}
                    label="Priority Status"
                    value={selectedClient.urgency.toUpperCase()}
                  />
                )}
              </div>

              {/* Description Section with Summary */}
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
                <div className={cn(
                  "text-sm whitespace-pre-wrap",
                  isDark ? "text-white/70" : "text-black/70"
                )}>
                  {loadingSummary ? (
                    <div className="flex items-center justify-center py-4">
                      <div className={cn(
                        "animate-spin rounded-full h-6 w-6 border-2",
                        isDark 
                          ? "border-white/20 border-t-white/70" 
                          : "border-black/20 border-t-black/70"
                      )} />
                    </div>
                  ) : (
                    <div dangerouslySetInnerHTML={{ 
                      __html: summary
                        ?.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        ?.replace(/\*(?!\*)/g, '•')
                        ?.replace(/\n/g, '<br/>') || 
                        'No conversation summary available.' 
                    }} />
                  )}
                </div>
              </div>

              {/* Notes Section */}
              <div className={cn(
                "p-4 rounded-lg mb-3",
                isDark ? "bg-black/20" : "bg-gray-100"
              )}>
            
                <p className={cn(
                  "text-sm",
                  isDark ? "text-white/70" : "text-black/70"
                )}>
                  {/* Add notes section content here */}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-3 flex flex-col sm:flex-row gap-3 justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleContactClick}
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
               
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={cn(
          "absolute bottom-3 right-3 p-1.5 rounded-full transition-colors duration-200",
          isDark 
            ? "bg-white/10 hover:bg-white/20 text-white/70" 
            : "bg-black/10 hover:bg-black/20 text-black/70"
        )}
      >
        <ChevronUp className="w-4 h-4" />
      </button>

      {/* Add this contact menu popup right before the final closing div */}
      <AnimatePresence>
        {showContactMenu && clientDetails && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setShowContactMenu(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", duration: 0.3 }}
              style={{
                position: 'fixed',
                left: `${contactMenuPosition.x}px`,
                top: `${contactMenuPosition.y}px`,
              }}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "z-50 w-48 rounded-lg shadow-lg p-1",
                isDark 
                  ? "bg-black/90 border border-white/10" 
                  : "bg-white/95 border border-black/10"
              )}
            >
              <div className="flex flex-col">
                <button
                  onClick={() => copyToClipboard(clientDetails.phone)}
                  className={cn(
                    "w-full px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors",
                    isDark 
                      ? "hover:bg-white/10" 
                      : "hover:bg-black/5"
                  )}
                >
                  <PhoneCall className="w-4 h-4" />
                  <span className="flex-1 text-left">Copy Phone</span>
                  <Copy className="w-3 h-3 opacity-50" />
                </button>
                <button
                  onClick={() => copyToClipboard(clientDetails.email)}
                  className={cn(
                    "w-full px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors",
                    isDark 
                      ? "hover:bg-white/10" 
                      : "hover:bg-black/5"
                  )}
                >
                  <Mail className="w-4 h-4" />
                  <span className="flex-1 text-left">Copy Email</span>
                  <Copy className="w-3 h-3 opacity-50" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PriorityDashboard;