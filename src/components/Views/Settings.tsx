import React, { useState } from 'react';
import { Bell, Lock, Globe, Settings as SettingsIcon, User, Mail, Shield, 
  FileText, Users, Database, Boxes, HelpCircle, MessageSquare, Check } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../utils/cn';

export default function Settings() {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('general');
  const [showTwoFactor, setShowTwoFactor] = useState(false);

  const sidebarItems = [
    { icon: FileText, label: 'General', id: 'general' },
    { icon: Bell, label: 'Notifications', id: 'notifications' },
    { icon: Lock, label: 'Two Factor Auth', id: '2fa' },
    { icon: Database, label: 'API Tokens', id: 'api' },
    { icon: Users, label: 'Team', id: 'team' },
    { icon: Boxes, label: 'Apps', id: 'apps' },
    { icon: HelpCircle, label: 'Help', id: 'help' },
    { icon: MessageSquare, label: 'Contact Support', id: 'support' },
  ];

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="relative overflow-hidden rounded-3xl border backdrop-blur-xl bg-gradient-to-br from-white/5 via-white/10 to-transparent border-white/20 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] p-0">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[35rem] h-[35rem] bg-gradient-to-bl from-blue-500/20 via-purple-500/5 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[35rem] h-[35rem] bg-gradient-to-tr from-purple-500/10 to-transparent blur-3xl pointer-events-none" />

        <div className="relative z-10 flex">
          {/* Sidebar */}
          <div className={cn(
            "w-64 p-6 border-r",
            isDark ? "border-white/10" : "border-black/10"
          )}>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                <SettingsIcon className="w-5 h-5 text-blue-400" />
              </div>
              <span className={cn(
                "font-semibold",
                isDark ? "text-white" : "text-black"
              )}>Settings</span>
            </div>

            <nav className="space-y-2">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2 rounded-xl transition-all",
                    activeTab === item.id
                      ? "bg-gradient-to-r from-blue-400/30 to-purple-400/30 backdrop-blur-sm border border-white/20"
                      : "hover:bg-white/5",
                    isDark ? "text-white" : "text-black"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-8">
            {activeTab === 'general' && (
              <div className="space-y-8">
                <h2 className={cn(
                  "text-xl font-semibold",
                  isDark ? "text-white" : "text-black"
                )}>General Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className={cn(
                      "text-lg mb-4",
                      isDark ? "text-white" : "text-black"
                    )}>Your Photo</h3>
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                        <User className="w-10 h-10 text-blue-400" />
                      </div>
                      <button className={cn(
                        "px-4 py-2 rounded-xl transition-all",
                        "bg-gradient-to-r from-blue-400/30 to-purple-400/30 backdrop-blur-sm",
                        "border border-white/20",
                        "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]",
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
              <div className="space-y-8">
                <h2 className={cn(
                  "text-xl font-semibold",
                  isDark ? "text-white" : "text-black"
                )}>Two-Factor Authentication</h2>

                <div className={cn(
                  "p-6 rounded-2xl",
                  isDark ? "bg-black/20" : "bg-black/5"
                )}>
                  <div className="space-y-4">
                    {!showTwoFactor ? (
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className={cn(
                            "text-lg font-medium mb-1",
                            isDark ? "text-white" : "text-black"
                          )}>Enable Two-Factor Auth</h3>
                          <p className={isDark ? "text-white/60" : "text-black/60"}>
                            Add an extra layer of security to your account
                          </p>
                        </div>
                        <button
                          onClick={() => setShowTwoFactor(true)}
                          className={cn(
                            "px-4 py-2 rounded-xl transition-all",
                            "bg-gradient-to-r from-blue-400/30 to-purple-400/30 backdrop-blur-sm",
                            "border border-white/20",
                            "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]",
                            isDark ? "text-white" : "text-black",
                          )}>
                          Configure
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="flex items-center gap-2 text-emerald-400">
                          <Check className="w-5 h-5" />
                          <span>Scan the QR code with your authenticator app</span>
                        </div>
                        
                        <div className="w-48 h-48 bg-white p-4 rounded-xl mx-auto">
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
                              "px-4 py-2 rounded-xl transition-all",
                              "bg-gradient-to-r from-blue-400/30 to-purple-400/30 backdrop-blur-sm",
                              "border border-white/20",
                              "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]",
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
  );
}