import React, { useState } from 'react';
import { Database, Bot, MessageSquare, CheckCircle } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { cn } from '../utils/cn';

export default function AISettings() {
  const { isDark } = useTheme();
  const [aiName, setAiName] = useState('');
  const [tone, setTone] = useState('Professional');
  const [length, setLength] = useState('Moderate');
  const [enableFollowUp, setEnableFollowUp] = useState(true);

  const GlassContainer = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={cn(
      "p-4 sm:p-6 rounded-2xl border transition-all",
      isDark 
        ? "bg-black/40 border-white/10" 
        : "bg-black/5 border-black/10",
      className
    )}>
      {children}
    </div>
  );

  const IconContainer = ({ icon: Icon, color }: { icon: any, color: string }) => (
    <div className={cn(
      "w-10 h-10 rounded-xl flex items-center justify-center",
      isDark ? "bg-black/40" : "bg-black/5"
    )}>
      <Icon className={cn("w-5 h-5", color)} />
    </div>
  );

  return (
    <div className="p-2 sm:p-4 md:p-6 max-w-[95rem] mx-auto">
      <div className={cn(
        "relative overflow-hidden rounded-xl sm:rounded-3xl min-h-[85vh]",
        isDark ? "bg-[#1c1c1c]" : "bg-white",
        "border",
        isDark ? "border-white/10" : "border-black/10",
        "p-4 sm:p-6 md:p-8",
        "transition-colors duration-200"
      )}>
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[35rem] h-[35rem] bg-gradient-to-bl from-blue-500/10 via-purple-500/5 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[35rem] h-[35rem] bg-gradient-to-tr from-purple-500/10 to-transparent blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Header */}
          <div>
            <h1 className={cn(
              "text-xl sm:text-2xl font-bold",
              isDark ? "text-white" : "text-black"
            )}>
              AI Assistant Settings
            </h1>
            <p className={cn(
              "mt-2",
              isDark ? "text-white/60" : "text-black/60"
            )}>
              Configure your AI assistant's behavior and responses
            </p>
          </div>

          {/* Knowledge Base */}
          <GlassContainer>
            <div className="flex items-center gap-4 mb-6">
              <IconContainer 
                icon={Database} 
                color={isDark ? "text-blue-400" : "text-blue-600"} 
              />
              <h2 className={cn(
                "text-lg font-semibold",
                isDark ? "text-white" : "text-black"
              )}>Knowledge Base</h2>
            </div>
            <textarea
              className={cn(
                "w-full h-40 p-4 rounded-xl transition-all resize-none",
                "focus:outline-none focus:ring-2",
                isDark
                  ? "bg-black/40 border border-white/10 text-white placeholder-white/30 focus:ring-white/20"
                  : "bg-black/5 border border-black/10 text-black placeholder-black/30 focus:ring-black/20"
              )}
              placeholder="Add your company's knowledge base, FAQs, or any specific information..."
            />
          </GlassContainer>

          {/* Personality Settings */}
          <GlassContainer>
            <div className="flex items-center gap-4 mb-6">
              <IconContainer 
                icon={Bot} 
                color={isDark ? "text-purple-400" : "text-purple-600"} 
              />
              <h2 className={cn(
                "text-lg font-semibold",
                isDark ? "text-white" : "text-black"
              )}>Personality Settings</h2>
            </div>
            <div className="space-y-6">
              <div>
                <label className={cn(
                  "block text-sm font-medium mb-3",
                  isDark ? "text-white/60" : "text-black/60"
                )}>
                  AI Name
                </label>
                <input
                  type="text"
                  value={aiName}
                  onChange={(e) => setAiName(e.target.value)}
                  className={cn(
                    "w-full p-4 rounded-xl transition-all",
                    "focus:outline-none focus:ring-2",
                    isDark
                      ? "bg-black/40 border border-white/10 text-white placeholder-white/30 focus:ring-white/20"
                      : "bg-black/5 border border-black/10 text-black placeholder-black/30 focus:ring-black/20"
                  )}
                  placeholder="Enter AI assistant name"
                />
              </div>
              <div>
                <label className={cn(
                  "block text-sm font-medium mb-3",
                  isDark ? "text-white/60" : "text-black/60"
                )}>
                  Tone of Voice
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {['Professional', 'Friendly', 'Casual', 'Formal'].map((option) => (
                    <button
                      key={option}
                      onClick={() => setTone(option)}
                      className={cn(
                        "p-3 rounded-xl border text-sm font-medium transition-all",
                        tone === option 
                          ? isDark
                            ? "bg-black/60 border-white/20 text-white"
                            : "bg-black/10 border-black/20 text-black"
                          : isDark
                            ? "bg-black/40 border-white/10 text-white/60 hover:bg-black/50"
                            : "bg-black/5 border-black/10 text-black/60 hover:bg-black/10"
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </GlassContainer>

          {/* Response Settings */}
          <GlassContainer>
            <div className="flex items-center gap-4 mb-6">
              <IconContainer 
                icon={MessageSquare} 
                color={isDark ? "text-emerald-400" : "text-emerald-600"} 
              />
              <h2 className={cn(
                "text-lg font-semibold",
                isDark ? "text-white" : "text-black"
              )}>Response Settings</h2>
            </div>
            <div className="space-y-6">
              <div>
                <label className={cn(
                  "block text-sm font-medium mb-3",
                  isDark ? "text-white/60" : "text-black/60"
                )}>
                  Response Length
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  {['Concise', 'Moderate', 'Detailed'].map((option) => (
                    <button
                      key={option}
                      onClick={() => setLength(option)}
                      className={cn(
                        "flex-1 p-3 rounded-xl border text-sm font-medium transition-all",
                        length === option 
                          ? isDark
                            ? "bg-black/60 border-white/20 text-white"
                            : "bg-black/10 border-black/20 text-black"
                          : isDark
                            ? "bg-black/40 border-white/10 text-white/60 hover:bg-black/50"
                            : "bg-black/5 border-black/10 text-black/60 hover:bg-black/10"
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <button
                  onClick={() => setEnableFollowUp(!enableFollowUp)}
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-xl border transition-all w-full sm:w-auto",
                    enableFollowUp
                      ? isDark
                        ? "bg-black/60 border-white/20 text-white"
                        : "bg-black/10 border-black/20 text-black"
                      : isDark
                        ? "bg-black/40 border-white/10 text-white/60"
                        : "bg-black/5 border-black/10 text-black/60"
                  )}
                >
                  <CheckCircle className={cn(
                    "w-5 h-5",
                    enableFollowUp 
                      ? isDark 
                        ? "text-white" 
                        : "text-black"
                      : "opacity-0",
                  )} />
                  <span>Enable follow-up questions</span>
                </button>
              </div>
            </div>
          </GlassContainer>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <button className={cn(
              "px-6 py-2.5 rounded-xl transition-all font-medium",
              isDark 
                ? "bg-black/40 hover:bg-black/60 text-white border border-white/10" 
                : "bg-black/5 hover:bg-black/10 text-black border border-black/10"
            )}>
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}