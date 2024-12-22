import React from 'react';
import { User, Mail, Phone, MapPin, Building, Calendar } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../utils/cn';

export default function Profile() {
  const { isDark } = useTheme();

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-white/10 backdrop-blur-xl p-6 md:p-8">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[25rem] h-[25rem] bg-gradient-to-bl from-blue-500/20 via-purple-500/5 to-transparent blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[25rem] h-[25rem] bg-gradient-to-tr from-purple-500/10 to-transparent blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <h1 className={cn(
            "text-2xl font-bold mb-8",
            isDark ? "text-white" : "text-black"
          )}>Profile Settings</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profile Picture Section */}
            <div className="col-span-full flex items-center space-x-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
                <User className="w-8 h-8 text-blue-400" />
              </div>
              <button className={cn(
                "px-4 py-2 rounded-lg transition-all",
                isDark
                  ? "bg-white/10 hover:bg-white/20 text-white"
                  : "bg-black/10 hover:bg-black/20 text-black"
              )}>
                Change Photo
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className={cn(
                  "block text-sm font-medium mb-2",
                  isDark ? "text-white/60" : "text-black/60"
                )}>Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
                  <input
                    type="text"
                    className={cn(
                      "w-full pl-10 pr-4 py-2 rounded-lg transition-all",
                      isDark
                        ? "bg-white/5 border border-white/10 text-white placeholder-white/40"
                        : "bg-black/5 border border-black/10 text-black placeholder-black/40"
                    )}
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label className={cn(
                  "block text-sm font-medium mb-2",
                  isDark ? "text-white/60" : "text-black/60"
                )}>Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                  <input
                    type="email"
                    className={cn(
                      "w-full pl-10 pr-4 py-2 rounded-lg transition-all",
                      isDark
                        ? "bg-white/5 border border-white/10 text-white placeholder-white/40"
                        : "bg-black/5 border border-black/10 text-black placeholder-black/40"
                    )}
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <label className={cn(
                  "block text-sm font-medium mb-2",
                  isDark ? "text-white/60" : "text-black/60"
                )}>Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
                  <input
                    type="tel"
                    className={cn(
                      "w-full pl-10 pr-4 py-2 rounded-lg transition-all",
                      isDark
                        ? "bg-white/5 border border-white/10 text-white placeholder-white/40"
                        : "bg-black/5 border border-black/10 text-black placeholder-black/40"
                    )}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className={cn(
                  "block text-sm font-medium mb-2",
                  isDark ? "text-white/60" : "text-black/60"
                )}>Company</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
                  <input
                    type="text"
                    className={cn(
                      "w-full pl-10 pr-4 py-2 rounded-lg transition-all",
                      isDark
                        ? "bg-white/5 border border-white/10 text-white placeholder-white/40"
                        : "bg-black/5 border border-black/10 text-black placeholder-black/40"
                    )}
                    placeholder="Company Name"
                  />
                </div>
              </div>

              <div>
                <label className={cn(
                  "block text-sm font-medium mb-2",
                  isDark ? "text-white/60" : "text-black/60"
                )}>Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                  <input
                    type="text"
                    className={cn(
                      "w-full pl-10 pr-4 py-2 rounded-lg transition-all",
                      isDark
                        ? "bg-white/5 border border-white/10 text-white placeholder-white/40"
                        : "bg-black/5 border border-black/10 text-black placeholder-black/40"
                    )}
                    placeholder="City, Country"
                  />
                </div>
              </div>

              <div>
                <label className={cn(
                  "block text-sm font-medium mb-2",
                  isDark ? "text-white/60" : "text-black/60"
                )}>Joined Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
                  <input
                    type="date"
                    className={cn(
                      "w-full pl-10 pr-4 py-2 rounded-lg transition-all",
                      isDark
                        ? "bg-white/5 border border-white/10 text-white placeholder-white/40"
                        : "bg-black/5 border border-black/10 text-black placeholder-black/40"
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <button className={cn(
              "px-6 py-2 rounded-lg transition-all",
              "bg-gradient-to-r from-blue-500 to-purple-500",
              "text-white font-medium",
              "hover:opacity-90"
            )}>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}