import React, { useState } from 'react';
import { Bell, Lock, Settings as SettingsIcon, User, 
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
    { icon: MessageSquare, label: 'Support', id: 'support' },
  ];

  const GlassContainer = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={cn(
      "rounded-2xl transition-all border backdrop-blur-lg",
      isDark 
        ? "bg-white/5 border-white/10" 
        : "bg-black/5 border-black/10",
      className
    )}>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen">
      <div className="p-4 md:p-6 max-w-[95rem] mx-auto">
        <GlassContainer className="min-h-[85vh] overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Sidebar */}
            <div className="sticky top-0 md:w-20 border-r border-inherit">
              <div className="flex md:flex-col md:h-[85vh] p-4 gap-3 items-center">
                {/* Settings Icon */}
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center mb-6 hidden md:flex",
                  isDark ? "bg-white/5" : "bg-black/5"
                )}>
                  <SettingsIcon className={cn(
                    "w-5 h-5",
                    isDark ? "text-white/70" : "text-black/70"
                  )} />
                </div>
                
                {/* Navigation Icons */}
                <div className="flex md:flex-col w-full gap-2 overflow-x-auto md:overflow-x-visible md:overflow-y-auto">
                  {sidebarItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={cn(
                        "flex items-center gap-3 p-2.5 rounded-xl transition-all",
                        "group outline-none",
                        activeTab === item.id
                          ? isDark 
                            ? "bg-white/10" 
                            : "bg-black/10"
                          : isDark
                            ? "hover:bg-white/5"
                            : "hover:bg-black/5"
                      )}
                    >
                      <div className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center",
                        activeTab === item.id
                          ? isDark 
                            ? "bg-white/10" 
                            : "bg-black/10"
                          : "bg-transparent"
                      )}>
                        <item.icon className={cn(
                          "w-5 h-5",
                          activeTab === item.id
                            ? isDark 
                              ? "text-white/90" 
                              : "text-black/90"
                            : isDark
                              ? "text-white/60"
                              : "text-black/60"
                        )} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6">
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <h2 className={cn(
                    "text-xl font-semibold",
                    isDark ? "text-white" : "text-black"
                  )}>General Settings</h2>
                  
                  <div className="space-y-6">
                    <GlassContainer className="p-6">
                      <h3 className={cn(
                        "text-lg mb-4",
                        isDark ? "text-white" : "text-black"
                      )}>Your Photo</h3>
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className={cn(
                          "w-16 h-16 rounded-xl flex items-center justify-center",
                          isDark ? "bg-white/5" : "bg-black/5"
                        )}>
                          <User className={cn(
                            "w-8 h-8",
                            isDark ? "text-white/70" : "text-black/70"
                          )} />
                        </div>
                        <button className={cn(
                          "px-4 py-2 rounded-xl transition-colors w-full sm:w-auto",
                          isDark 
                            ? "bg-white/10 hover:bg-white/20 text-white" 
                            : "bg-black/10 hover:bg-black/20 text-black"
                        )}>
                          Update
                        </button>
                      </div>
                    </GlassContainer>

                    <GlassContainer className="p-6 space-y-4">
                      <div>
                        <label className={cn(
                          "block text-sm font-medium mb-2",
                          isDark ? "text-white/60" : "text-black/60"
                        )}>Name</label>
                        <input
                          type="text"
                          className={cn(
                            "w-full px-4 py-2 rounded-xl transition-colors",
                            isDark
                              ? "bg-white/5 border border-white/10 text-white"
                              : "bg-black/5 border border-black/10 text-black",
                            "focus:outline-none focus:ring-2",
                            isDark
                              ? "focus:ring-white/20"
                              : "focus:ring-black/20"
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
                            "w-full px-4 py-2 rounded-xl transition-colors",
                            isDark
                              ? "bg-white/5 border border-white/10 text-white"
                              : "bg-black/5 border border-black/10 text-black",
                            "focus:outline-none focus:ring-2",
                            isDark
                              ? "focus:ring-white/20"
                              : "focus:ring-black/20"
                          )}
                          placeholder="Enter your email"
                        />
                      </div>
                    </GlassContainer>
                  </div>
                </div>
              )}

              {activeTab === '2fa' && (
                <div className="space-y-6">
                  <h2 className={cn(
                    "text-xl font-semibold",
                    isDark ? "text-white" : "text-black"
                  )}>Two-Factor Authentication</h2>

                  <GlassContainer className="p-6">
                    <div className="space-y-6">
                      {!showTwoFactor ? (
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div>
                            <h3 className={cn(
                              "text-lg font-medium mb-1",
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
                              "px-4 py-2 rounded-xl transition-colors w-full sm:w-auto",
                              isDark 
                                ? "bg-white/10 hover:bg-white/20 text-white" 
                                : "bg-black/10 hover:bg-black/20 text-black"
                            )}>
                            Configure
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center",
                              isDark ? "bg-emerald-500/20" : "bg-emerald-500/10"
                            )}>
                              <Check className={cn(
                                "w-5 h-5",
                                isDark ? "text-emerald-400" : "text-emerald-600"
                              )} />
                            </div>
                            <span className={cn(
                              "text-sm",
                              isDark ? "text-emerald-400" : "text-emerald-600"
                            )}>
                              Scan the QR code with your authenticator app
                            </span>
                          </div>
                          
                          <div className="mx-auto">
                            <GlassContainer className="p-4 w-40 h-40">
                              <div className="w-full h-full rounded-lg flex items-center justify-center text-sm">
                                QR Code
                              </div>
                            </GlassContainer>
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
                                  "w-full px-4 py-2 rounded-xl transition-colors",
                                  isDark
                                    ? "bg-white/5 border border-white/10 text-white"
                                    : "bg-black/5 border border-black/10 text-black",
                                  "focus:outline-none focus:ring-2",
                                  isDark
                                    ? "focus:ring-white/20"
                                    : "focus:ring-black/20"
                                )}
                                placeholder="Enter the 6-digit code"
                              />
                            </div>
                            <div className="flex justify-end">
                              <button className={cn(
                                "px-4 py-2 rounded-xl transition-colors",
                                isDark 
                                  ? "bg-white/10 hover:bg-white/20 text-white" 
                                  : "bg-black/10 hover:bg-black/20 text-black"
                              )}>
                                Verify & Enable
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </GlassContainer>
                </div>
              )}
            </div>
          </div>
        </GlassContainer>
      </div>
    </div>
  );
}