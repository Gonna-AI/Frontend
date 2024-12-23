import React from 'react';
import { User, Mail, Phone, Calendar, Clock, Download, Grid, AlignLeft, ArrowUpDown, Filter, Target, CheckCircle } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../utils/cn';

export default function AgentProfile() {
  const { isDark } = useTheme();

  const stats = [
    {
      value: '247',
      label: 'Claims Processed',
      icon: CheckCircle,
      iconColor: 'text-emerald-400'
    },
    {
      value: '94%',
      label: 'Resolution Rate',
      icon: Target,
      iconColor: 'text-blue-400'
    },
    {
      value: '4.8',
      label: 'Customer Rating',
      icon: User,
      iconColor: 'text-purple-400'
    }
  ];

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className={cn(
        "relative overflow-hidden rounded-3xl",
        isDark ? "bg-[#1c1c1c]" : "bg-white",
        "border",
        isDark ? "border-white/10" : "border-black/10",
        "p-6 md:p-8"
      )}>
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[35rem] h-[35rem] bg-gradient-to-bl from-blue-500/10 via-purple-500/5 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[35rem] h-[35rem] bg-gradient-to-tr from-purple-500/10 to-transparent blur-3xl pointer-events-none" />

        <div className="relative z-10">
          {/* Header with Download Button */}
          <div className="flex justify-between items-center mb-8">
            <h1 className={cn(
              "text-2xl font-bold flex items-center gap-3",
              isDark ? "text-white" : "text-black"
            )}>
              <span className="w-1 h-6 bg-emerald-400 rounded-full"/>
              Agent Performance Dashboard
            </h1>
            <button className={cn(
              "px-4 py-2 rounded-xl flex items-center gap-2 transition-all",
              isDark 
                ? "bg-white/5 hover:bg-white/10 text-white" 
                : "bg-black/5 hover:bg-black/10 text-black"
            )}>
              <Download size={18} />
              Export Report
            </button>
          </div>

          {/* Profile Header */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="col-span-1 lg:col-span-3">
              <div className={cn(
                "p-6 rounded-2xl",
                isDark ? "bg-black/40" : "bg-black/5"
              )}>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
                    <User className="w-12 h-12 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className={cn(
                      "text-2xl font-bold mb-2",
                      isDark ? "text-white" : "text-black"
                    )}>Nisha Sharma</h2>
                    <h3 className={cn(
                      "text-lg mb-2",
                      isDark ? "text-white/60" : "text-black/60"
                    )}>Senior Claims Processing Agent</h3>
                    <div className="flex gap-4">
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
                  <button className={cn(
                    "px-4 py-2 rounded-xl transition-all",
                    "bg-gradient-to-r from-blue-400/30 to-purple-400/30 backdrop-blur-sm",
                    "border border-white/20",
                    "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]",
                    "text-white font-medium",
                    "hover:bg-gradient-to-r hover:from-blue-400/40 hover:to-purple-400/40"
                  )}>
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={cn(
                  "p-6 rounded-2xl",
                  isDark ? "bg-black/40" : "bg-black/5"
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <stat.icon className={cn("w-6 h-6", stat.iconColor)} />
                </div>
                <div className={cn(
                  "text-2xl font-bold mb-1",
                  isDark ? "text-white" : "text-black"
                )}>
                  {stat.value}
                </div>
                <div className={cn(
                  "text-sm font-mono",
                  isDark ? "text-white/60" : "text-black/60"
                )}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Claims History */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className={cn(
                "text-xl font-bold flex items-center gap-3",
                isDark ? "text-white" : "text-black"
              )}>
                <span className="w-1 h-6 bg-emerald-400 rounded-full"/>
                Recent Claims
              </h2>
              <div className="flex gap-2">
                <button className={cn(
                  "p-2 rounded-xl transition-all",
                  isDark ? "bg-white/5 hover:bg-white/10" : "bg-black/5 hover:bg-black/10"
                )}>
                  <Grid size={20} className={isDark ? "text-white/60" : "text-black/60"} />
                </button>
                <button className={cn(
                  "p-2 rounded-xl transition-all",
                  isDark ? "bg-white/5 hover:bg-white/10" : "bg-black/5 hover:bg-black/10"
                )}>
                  <AlignLeft size={20} className={isDark ? "text-white/60" : "text-black/60"} />
                </button>
                <button className={cn(
                  "px-3 py-2 rounded-xl flex items-center gap-2 transition-all",
                  isDark ? "bg-white/5 hover:bg-white/10" : "bg-black/5 hover:bg-black/10"
                )}>
                  <ArrowUpDown size={18} className={isDark ? "text-white/60" : "text-black/60"} />
                  <span className={isDark ? "text-white/60" : "text-black/60"}>Sort</span>
                </button>
                <button className={cn(
                  "px-3 py-2 rounded-xl flex items-center gap-2 transition-all",
                  isDark ? "bg-white/5 hover:bg-white/10" : "bg-black/5 hover:bg-black/10"
                )}>
                  <Filter size={18} className={isDark ? "text-white/60" : "text-black/60"} />
                  <span className={isDark ? "text-white/60" : "text-black/60"}>Filter</span>
                </button>
              </div>
            </div>

            {/* Claims Records */}
            <div className={cn(
              "space-y-4 p-6 rounded-2xl",
              isDark ? "bg-black/40" : "bg-black/5"
            )}>
              {[
                { date: 'Dec 23 2024', claimId: 'CLM-2024-089', status: 'Resolved', priority: 'High' },
                { date: 'Dec 22 2024', claimId: 'CLM-2024-088', status: 'In Progress', priority: 'Medium' },
                { date: 'Dec 22 2024', claimId: 'CLM-2024-087', status: 'Pending', priority: 'Low' }
              ].map((record, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Calendar className={cn(
                      "w-5 h-5",
                      record.status === 'Resolved' ? "text-emerald-400" :
                      record.status === 'In Progress' ? "text-yellow-400" : "text-red-400"
                    )} />
                    <span className={isDark ? "text-white" : "text-black"}>{record.date}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <div>
                      <div className={cn(
                        "text-sm",
                        isDark ? "text-white/60" : "text-black/60"
                      )}>Claim ID</div>
                      <div className={isDark ? "text-white" : "text-black"}>{record.claimId}</div>
                    </div>
                    <div>
                      <div className={cn(
                        "text-sm",
                        isDark ? "text-white/60" : "text-black/60"
                      )}>Priority</div>
                      <div className={isDark ? "text-white" : "text-black"}>{record.priority}</div>
                    </div>
                    <div className="min-w-[100px]">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-sm inline-block text-center w-24",
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