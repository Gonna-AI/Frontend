import React, { useState } from 'react';
import { User, Mail, Phone, Calendar, Clock, Download, Grid, AlignLeft, 
  ArrowUpDown, Filter, Target, CheckCircle, ChevronDown, BarChart3, History, 
  Star, FileCheck } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../utils/cn';

export default function AgentProfile() {
  const { isDark } = useTheme();
  const [expandedSection, setExpandedSection] = useState(null);

  const stats = [
    {
      value: '247',
      label: 'Claims',
      icon: FileCheck,
      iconColor: 'text-emerald-400'
    },
    {
      value: '94%',
      label: 'Resolution',
      icon: Target,
      iconColor: 'text-blue-400'
    },
    {
      value: '4.8',
      label: 'Rating',
      icon: Star,
      iconColor: 'text-purple-400'
    }
  ];

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="p-2 sm:p-4 md:p-6 max-w-[95rem] mx-auto">
      <div className={cn(
        "relative overflow-hidden rounded-xl sm:rounded-3xl min-h-[85vh]",
        isDark 
          ? "bg-black/20 border border-white/10" 
          : "bg-white/10 border border-black/10",
        "p-4 sm:p-6 md:p-8"
      )}>
        <div className="relative z-10">
          {/* Header with Icon Navigation */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                isDark 
                  ? "bg-black/20 border border-white/10" 
                  : "bg-white/10 border border-black/10"
              )}>
                <BarChart3 className="w-5 h-5 text-blue-400" />
              </div>
              <span className={cn(
                "font-semibold",
                isDark ? "text-white" : "text-black"
              )}>Performance</span>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button className={cn(
                "p-2 rounded-xl transition-all flex-1 sm:flex-none",
                isDark 
                  ? "bg-black/20 border border-white/10 hover:bg-black/30" 
                  : "bg-white/10 border border-black/10 hover:bg-white/20",
                "flex items-center justify-center gap-2"
              )}>
                <History size={18} className={isDark ? "text-white/60" : "text-black/60"} />
                <span className={cn(
                  "sm:hidden",
                  isDark ? "text-white/60" : "text-black/60"
                )}>History</span>
              </button>
              <button className={cn(
                "p-2 rounded-xl transition-all flex-1 sm:flex-none",
                isDark 
                  ? "bg-black/20 border border-white/10 hover:bg-black/30" 
                  : "bg-white/10 border border-black/10 hover:bg-white/20",
                "flex items-center justify-center gap-2"
              )}>
                <Download size={18} className={isDark ? "text-white/60" : "text-black/60"} />
                <span className={cn(
                  "sm:hidden",
                  isDark ? "text-white/60" : "text-black/60"
                )}>Export</span>
              </button>
            </div>
          </div>

          {/* Profile Section */}
          <div className="mb-6">
            <div className={cn(
              "p-4 sm:p-6 rounded-2xl",
              isDark 
                ? "bg-black/20 border border-white/10" 
                : "bg-white/10 border border-black/10"
            )}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                <div className={cn(
                  "w-16 sm:w-20 h-16 sm:h-20 rounded-2xl flex items-center justify-center",
                  isDark 
                    ? "bg-black/20 border border-white/10" 
                    : "bg-white/10 border border-black/10"
                )}>
                  <User className="w-8 sm:w-10 h-8 sm:h-10 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h2 className={cn(
                    "text-xl sm:text-2xl font-bold mb-1",
                    isDark ? "text-white" : "text-black"
                  )}>Nisha Sharma</h2>
                  <h3 className={cn(
                    "text-base sm:text-lg mb-2",
                    isDark ? "text-white/60" : "text-black/60"
                  )}>Sr. Claims Agent</h3>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-400" />
                      <span className={cn(
                        "text-sm",
                        isDark ? "text-white/60" : "text-black/60"
                      )}>nisha.s@claimstech.com</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-purple-400" />
                      <span className={cn(
                        "text-sm",
                        isDark ? "text-white/60" : "text-black/60"
                      )}>+91 98765 43210</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={cn(
                  "p-4 sm:p-6 rounded-xl sm:rounded-2xl",
                  isDark 
                    ? "bg-black/20 border border-white/10" 
                    : "bg-white/10 border border-black/10"
                )}
              >
                <div className="flex items-center gap-3 mb-2">
                  <stat.icon className={cn("w-5 h-5", stat.iconColor)} />
                  <span className={cn(
                    "text-sm",
                    isDark ? "text-white/60" : "text-black/60"
                  )}>{stat.label}</span>
                </div>
                <div className={cn(
                  "text-xl sm:text-2xl font-bold",
                  isDark ? "text-white" : "text-black"
                )}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          {/* Claims Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                <span className={cn(
                  "font-semibold",
                  isDark ? "text-white" : "text-black"
                )}>Recent Claims</span>
              </div>
              <div className="flex gap-2">
                <button className={cn(
                  "p-2 rounded-xl transition-all",
                  isDark 
                    ? "bg-black/20 border border-white/10 hover:bg-black/30" 
                    : "bg-white/10 border border-black/10 hover:bg-white/20"
                )}>
                  <Filter size={18} className={isDark ? "text-white/60" : "text-black/60"} />
                </button>
                <button className={cn(
                  "p-2 rounded-xl transition-all",
                  isDark 
                    ? "bg-black/20 border border-white/10 hover:bg-black/30" 
                    : "bg-white/10 border border-black/10 hover:bg-white/20"
                )}>
                  <ArrowUpDown size={18} className={isDark ? "text-white/60" : "text-black/60"} />
                </button>
              </div>
            </div>

            {/* Claims Records */}
            <div className={cn(
              "space-y-3 p-4 sm:p-6 rounded-xl sm:rounded-2xl",
              isDark 
                ? "bg-black/20 border border-white/10" 
                : "bg-white/10 border border-black/10"
            )}>
              {[
                { date: 'Dec 23', claimId: 'CLM-089', status: 'Resolved', priority: 'High' },
                { date: 'Dec 22', claimId: 'CLM-088', status: 'In Progress', priority: 'Medium' },
                { date: 'Dec 22', claimId: 'CLM-087', status: 'Pending', priority: 'Low' }
              ].map((record, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <div className="flex items-center gap-3 sm:w-32">
                    <Calendar className={cn(
                      "w-4 h-4",
                      record.status === 'Resolved' ? "text-emerald-400" :
                      record.status === 'In Progress' ? "text-yellow-400" : "text-red-400"
                    )} />
                    <span className={cn(
                      "text-sm",
                      isDark ? "text-white" : "text-black"
                    )}>{record.date}</span>
                  </div>
                  <div className="flex flex-1 items-center justify-between sm:justify-start gap-4">
                    <div className="min-w-[80px]">
                      <div className={cn(
                        "text-xs",
                        isDark ? "text-white/60" : "text-black/60"
                      )}>Claim ID</div>
                      <div className={cn(
                        "text-sm",
                        isDark ? "text-white" : "text-black"
                      )}>{record.claimId}</div>
                    </div>
                    <div>
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs inline-block text-center w-20",
                        record.status === 'Resolved' ? "bg-emerald-400/20 text-emerald-400" :
                        record.status === 'In Progress' ? "bg-yellow-400/20 text-yellow-400" :
                        "bg-red-400/20 text-red-400"
                      )}>
                        {record.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}