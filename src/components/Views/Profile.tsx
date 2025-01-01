import React, { useState } from 'react';
import { User, Mail, Phone, Calendar, Target, BarChart3, Star, FileCheck, UserCog2 } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../utils/cn';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { API_BASE_URL } from '../../config/api';

export default function AgentProfile() {
  const { isDark } = useTheme();
  const [expandedSection, setExpandedSection] = useState(null);

  const { data: claimsData } = useQuery({
    queryKey: ['claims'],
    queryFn: async () => {
      const response = await api.get('/api/priority');
      return response.data;
    },
  });

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await api.get('/api/auth/user');
      return response.data;
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const stats = [
    {
      value: claimsData?.length || '0',
      label: 'Active Claims',
      icon: FileCheck,
      iconColor: 'text-emerald-400'
    },
    {
      value: `${calculateResolutionRate(claimsData)}%`,
      label: 'Resolution Rate',
      icon: Target,
      iconColor: 'text-blue-400'
    },
    {
      value: calculateAverageUrgency(claimsData),
      label: 'High Priority',
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
              )}>Profile</span>
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
                  "w-16 sm:w-20 h-16 sm:h-20 rounded-2xl flex items-center justify-center overflow-hidden",
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
                  )}>{user.name ? user.name : 'No Name'}</h2>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-400" />
                      <span className={cn(
                        "text-sm",
                        isDark ? "text-white/60" : "text-black/60"
                      )}>{user.email ? user.email : 'No Email'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-purple-400" />
                      <span className={cn(
                        "text-sm",
                        isDark ? "text-white/60" : "text-black/60"
                      )}>{user.mobile ? user.mobile : 'No Mobile'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserCog2 className="w-4 h-4 text-purple-400" />
                      <span className={cn(
                        "text-sm",
                        isDark ? "text-white/60" : "text-black/60"
                      )}>{user.agent_id ? user.agent_id : 'No Agent ID'}</span>
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
            </div>

            {/* Claims Records */}
            <div className={cn(
              "space-y-3 p-4 sm:p-6 rounded-xl sm:rounded-2xl",
              isDark 
                ? "bg-black/20 border border-white/10" 
                : "bg-white/10 border border-black/10"
            )}>
              {claimsData?.slice(0, 5).map((claim, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <div className="flex items-center gap-3 sm:w-32">
                    <Calendar className={cn(
                      "w-4 h-4",
                      claim.urgency === 'high' ? "text-red-400" :
                      claim.urgency === 'medium' ? "text-yellow-400" : "text-emerald-400"
                    )} />
                    <span className={cn(
                      "text-sm",
                      isDark ? "text-white" : "text-black"
                    )}>{new Date(claim.last_interaction).toLocaleDateString()}</span>
                  </div>
                  <div className="flex flex-1 items-center justify-between sm:justify-start gap-4">
                    <div className="min-w-[80px]">
                      <div className={cn(
                        "text-xs",
                        isDark ? "text-white/60" : "text-black/60"
                      )}>Ticket ID</div>
                      <div className={cn(
                        "text-sm",
                        isDark ? "text-white" : "text-black"
                      )}>{claim.ticket_id}</div>
                    </div>
                    <div>
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs inline-block text-center w-20",
                        claim.urgency === 'high' ? "bg-red-400/20 text-red-400" :
                        claim.urgency === 'medium' ? "bg-yellow-400/20 text-yellow-400" :
                        "bg-emerald-400/20 text-emerald-400"
                      )}>
                        {claim.urgency.toUpperCase()}
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

function calculateResolutionRate(claims) {
  if (!claims || claims.length === 0) return '0';
  const resolved = claims.filter(claim => claim.category && claim.issue).length;
  return Math.round((resolved / claims.length) * 100);
}

function calculateAverageUrgency(claims) {
  if (!claims || claims.length === 0) return '0';
  const highPriority = claims.filter(claim => claim.urgency === 'high').length;
  return highPriority;
}