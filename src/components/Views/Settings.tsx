import React, { useState } from 'react';
import { Bell, Lock, Settings as SettingsIcon, User, 
  FileText, Users, Database, Boxes, HelpCircle, MessageSquare, Check } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../utils/cn';

export default function Settings() {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('general');
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [expandedIcon, setExpandedIcon] = useState(null);
  const [boxWidth, setBoxWidth] = useState('100%');

  const sidebarItems = [
    { icon: FileText, label: 'General', id: 'general' },
    { icon: Bell, label: 'Notifications', id: 'notifications' },
    { icon: Lock, label: 'Two Factor Auth', id: '2fa' },
    { icon: Database, label: 'API Tokens', id: 'api' },
    { icon: Users, label: 'Team', id: 'team' },
    { icon: Boxes, label: 'Apps', id: 'apps' },
    { icon: HelpCircle, label: 'Help', id: 'help' },
    { icon: MessageSquare, label: 'Support', id: 'support' },
  ];

  const handleIconClick = (id) => {
    setActiveTab(id);
    setExpandedIcon(expandedIcon === id ? null : id);
  };

  return (
    <div className="min-h-screen">
      <div className="p-2 sm:p-4 md:p-6 max-w-[95rem] mx-auto">
        <div className="relative overflow-hidden rounded-xl sm:rounded-3xl border backdrop-blur-xl bg-gradient-to-br from-white/5 via-white/10 to-transparent border-white/20 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] min-h-[85vh]">
          {/* Background Gradients */}
          <div className="absolute top-0 right-0 w-48 sm:w-96 h-48 sm:h-96 bg-gradient-to-bl from-blue-500/20 via-purple-500/5 to-transparent blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 sm:w-96 h-48 sm:h-96 bg-gradient-to-tr from-purple-500/10 to-transparent blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row">
            {/* Icon Bar */}
            <div className="md:w-20 border-r border-white/10 flex md:flex-col justify-start overflow-x-auto md:overflow-x-visible">
              <div className="flex md:flex-col items-center p-3 gap-2">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-6 hidden md:flex">
                  <SettingsIcon className="w-6 h-6 text-blue-400" />
                </div>
                
                {sidebarItems.map((item) => (
                  <div key={item.id} className="relative group">
                    <button
                      onClick={() => handleIconClick(item.id)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl transition-all whitespace-nowrap",
                        activeTab === item.id
                          ? "bg-gradient-to-r from-blue-400/30 to-purple-400/30 backdrop-blur-sm border border-white/20"
                          : "hover:bg-white/5",
                        isDark ? "text-white" : "text-black",
                        expandedIcon === item.id ? "w-auto" : "w-12 md:w-14"
                      )}
                    >
                      <item.icon className="w-6 h-6 flex-shrink-0" />
                      <span className={cn(
                        "transition-all overflow-hidden",
                        expandedIcon === item.id ? "w-auto opacity-100" : "w-0 opacity-0"
                      )}>
                        {item.label}
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-4 sm:p-6 md:p-8">
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <h2 className={cn(
                    "text-lg sm:text-xl font-semibold",
                    isDark ? "text-white" : "text-black"
                  )}>General Settings</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className={cn(
                        "text-base sm:text-lg mb-4",
                        isDark ? "text-white" : "text-black"
                      )}>Your Photo</h3>
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                          <User className="w-8 sm:w-10 h-8 sm:h-10 text-blue-400" />
                        </div>
                        <button className={cn(
                          "px-4 py-2 rounded-xl transition-all w-full sm:w-auto",
                          "bg-gradient-to-r from-blue-400/30 to-purple-400/30 backdrop-blur-sm",
                          "border border-white/20",
                          isDark ? "text-white" : "text-black",
                        )}>
                          Update
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className={cn(
                          "block text-sm font-medium mb-2",
                          isDark ? "text-white/60" : "text-black/60"
                        )}>Name</label>
                        <input
                          type="text"
                          className={cn(
                            "w-full px-4 py-2 rounded-xl transition-all",
                            isDark
                              ? "bg-white/5 border border-white/10 text-white"
                              : "bg-black/5 border border-black/10 text-black"
                          )}
                          placeholder="Enter your name"
                        />
                      </div>
                      <div>
                        <label className={cn(
                          "block text-sm font-medium mb-2",
                          isDark ? "text-white/60" : "text-black/60"
                        )}>Email</label>
                        <input
                          type="email"
                          className={cn(
                            "w-full px-4 py-2 rounded-xl transition-all",
                            isDark
                              ? "bg-white/5 border border-white/10 text-white"
                              : "bg-black/5 border border-black/10 text-black"
                          )}
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === '2fa' && (
                <div className="space-y-6">
                  <h2 className={cn(
                    "text-lg sm:text-xl font-semibold",
                    isDark ? "text-white" : "text-black"
                  )}>Two-Factor Authentication</h2>

                  <div className={cn(
                    "p-4 sm:p-6 rounded-xl sm:rounded-2xl",
                    isDark ? "bg-black/20" : "bg-black/5"
                  )}>
                    <div className="space-y-4">
                      {!showTwoFactor ? (
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div>
                            <h3 className={cn(
                              "text-base sm:text-lg font-medium mb-1",
                              isDark ? "text-white" : "text-black"
                            )}>Enable Two-Factor Auth</h3>
                            <p className={cn(
                              "text-sm",
                              isDark ? "text-white/60" : "text-black/60"
                            )}>
                              Add an extra layer of security to your account
                            </p>
                          </div>
                          <button
                            onClick={() => setShowTwoFactor(true)}
                            className={cn(
                              "px-4 py-2 rounded-xl transition-all w-full sm:w-auto",
                              "bg-gradient-to-r from-blue-400/30 to-purple-400/30 backdrop-blur-sm",
                              "border border-white/20",
                              isDark ? "text-white" : "text-black",
                            )}>
                            Configure
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="flex items-center gap-2 text-emerald-400">
                            <Check className="w-5 h-5" />
                            <span className="text-sm">Scan the QR code with your authenticator app</span>
                          </div>
                          
                          <div className="w-36 sm:w-48 h-36 sm:h-48 bg-white p-4 rounded-xl mx-auto">
                            <div className="w-full h-full bg-black/10 rounded-lg flex items-center justify-center text-sm">
                              QR Code Placeholder
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <label className={cn(
                                "block text-sm font-medium mb-2",
                                isDark ? "text-white/60" : "text-black/60"
                              )}>Verification Code</label>
                              <input
                                type="text"
                                className={cn(
                                  "w-full px-4 py-2 rounded-xl transition-all",
                                  isDark
                                    ? "bg-white/5 border border-white/10 text-white"
                                    : "bg-black/5 border border-black/10 text-black"
                                )}
                                placeholder="Enter the 6-digit code"
                              />
                            </div>
                            <div className="flex justify-end">
                              <button className={cn(
                                "px-4 py-2 rounded-xl transition-all w-full sm:w-auto",
                                "bg-gradient-to-r from-blue-400/30 to-purple-400/30 backdrop-blur-sm",
                                "border border-white/20",
                                isDark ? "text-white" : "text-black",
                              )}>
                                Verify & Enable
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}