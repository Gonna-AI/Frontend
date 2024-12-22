import React from 'react';
import { Bell, Lock, Globe, Eye, Volume2, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../utils/cn';

export default function Settings() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent border border-white/10 backdrop-blur-xl p-6 md:p-8">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[25rem] h-[25rem] bg-gradient-to-bl from-rose-500/20 via-purple-500/5 to-transparent blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[25rem] h-[25rem] bg-gradient-to-tr from-purple-500/10 to-transparent blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-8">
          <h1 className={cn(
            "text-2xl font-bold",
            isDark ? "text-white" : "text-black"
          )}>System Settings</h1>

          {/* Notifications Section */}
          <section className="space-y-4">
            <h2 className={cn(
              "text-lg font-semibold flex items-center space-x-2",
              isDark ? "text-white" : "text-black"
            )}>
              <Bell className="w-5 h-5 text-rose-400" />
              <span>Notifications</span>
            </h2>
            
            <div className="space-y-3">
              {['Email notifications', 'Push notifications', 'SMS alerts'].map((setting) => (
                <div key={setting} className="flex items-center justify-between">
                  <span className={isDark ? "text-white/80" : "text-black/80"}>
                    {setting}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className={cn(
                      "w-11 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all",
                      isDark
                        ? "bg-white/10 peer-checked:bg-rose-500"
                        : "bg-black/10 peer-checked:bg-rose-500"
                    )} />
                  </label>
                </div>
              ))}
            </div>
          </section>

          {/* Privacy Section */}
          <section className="space-y-4">
            <h2 className={cn(
              "text-lg font-semibold flex items-center space-x-2",
              isDark ? "text-white" : "text-black"
            )}>
              <Lock className="w-5 h-5 text-purple-400" />
              <span>Privacy</span>
            </h2>
            
            <div className="space-y-3">
              {['Two-factor authentication', 'Activity log', 'Data sharing'].map((setting) => (
                <div key={setting} className="flex items-center justify-between">
                  <span className={isDark ? "text-white/80" : "text-black/80"}>
                    {setting}
                  </span>
                  <button className={cn(
                    "px-3 py-1 rounded-lg text-sm transition-all",
                    isDark
                      ? "bg-white/10 hover:bg-white/20 text-white"
                      : "bg-black/10 hover:bg-black/20 text-black"
                  )}>
                    Configure
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Language & Region */}
          <section className="space-y-4">
            <h2 className={cn(
              "text-lg font-semibold flex items-center space-x-2",
              isDark ? "text-white" : "text-black"
            )}>
              <Globe className="w-5 h-5 text-emerald-400" />
              <span>Language & Region</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={cn(
                  "block text-sm font-medium mb-2",
                  isDark ? "text-white/60" : "text-black/60"
                )}>Language</label>
                <select className={cn(
                  "w-full px-3 py-2 rounded-lg transition-all",
                  isDark
                    ? "bg-white/5 border border-white/10 text-white"
                    : "bg-black/5 border border-black/10 text-black"
                )}>
                  <option>English (US)</option>
                  <option>Spanish</option>
                  <option>French</option>
                </select>
              </div>
              
              <div>
                <label className={cn(
                  "block text-sm font-medium mb-2",
                  isDark ? "text-white/60" : "text-black/60"
                )}>Time Zone</label>
                <select className={cn(
                  "w-full px-3 py-2 rounded-lg transition-all",
                  isDark
                    ? "bg-white/5 border border-white/10 text-white"
                    : "bg-black/5 border border-black/10 text-black"
                )}>
                  <option>UTC-5 (Eastern Time)</option>
                  <option>UTC-8 (Pacific Time)</option>
                  <option>UTC+0 (GMT)</option>
                </select>
              </div>
            </div>
          </section>

          {/* Appearance */}
          <section className="space-y-4">
            <h2 className={cn(
              "text-lg font-semibold flex items-center space-x-2",
              isDark ? "text-white" : "text-black"
            )}>
              <Eye className="w-5 h-5 text-blue-400" />
              <span>Appearance</span>
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={isDark ? "text-white/80" : "text-black/80"}>
                  Theme
                </span>
                <button
                  onClick={toggleTheme}
                  className={cn(
                    "p-2 rounded-lg transition-all",
                    isDark
                      ? "bg-white/10 hover:bg-white/20"
                      : "bg-black/10 hover:bg-black/20"
                  )}
                >
                  {isDark ? (
                    <Sun className="w-5 h-5 text-yellow-400" />
                  ) : (
                    <Moon className="w-5 h-5 text-purple-400" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className={isDark ? "text-white/80" : "text-black/80"}>
                  Sound Effects
                </span>
                <div className="flex items-center space-x-2">
                  <Volume2 className={cn(
                    "w-5 h-5",
                    isDark ? "text-white/60" : "text-black/60"
                  )} />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    className="w-32"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <button className={cn(
              "px-6 py-2 rounded-lg transition-all",
              "bg-gradient-to-r from-rose-500 to-purple-500",
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