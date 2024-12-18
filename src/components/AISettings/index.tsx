import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../utils/cn';

export default function AISettings() {
  const { isDark } = useTheme();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className={cn(
        "text-2xl font-bold mb-6",
        isDark ? "text-white" : "text-black"
      )}>
        AI Assistant Settings
      </h1>

      <div className="space-y-6">
        <section className={cn(
          "rounded-xl p-6",
          isDark
            ? "bg-gradient-to-br from-white/5 via-white/10 to-white/5 backdrop-blur-lg border border-white/10"
            : "bg-gradient-to-br from-black/5 via-black/10 to-black/5 backdrop-blur-lg border border-black/10"
        )}>
          <h2 className={cn(
            "text-xl font-semibold mb-4",
            isDark ? "text-white" : "text-black"
          )}>
            Knowledge Base
          </h2>
          <textarea
            className={cn(
              "w-full h-32 p-3 rounded-lg transition-all",
              isDark
                ? "bg-white/5 border-white/10 text-white placeholder-white/40"
                : "bg-black/5 border-black/10 text-black placeholder-black/40"
            )}
            placeholder="Add your company's knowledge base, FAQs, or any specific information..."
          />
        </section>

        <section className={cn(
          "rounded-xl p-6",
          isDark
            ? "bg-gradient-to-br from-white/5 via-white/10 to-white/5 backdrop-blur-lg border border-white/10"
            : "bg-gradient-to-br from-black/5 via-black/10 to-black/5 backdrop-blur-lg border border-black/10"
        )}>
          <h2 className={cn(
            "text-xl font-semibold mb-4",
            isDark ? "text-white" : "text-black"
          )}>
            Personality Settings
          </h2>
          <div className="space-y-4">
            <div>
              <label className={cn(
                "block text-sm font-medium mb-1",
                isDark ? "text-white/80" : "text-black/80"
              )}>
                AI Name
              </label>
              <input
                type="text"
                className={cn(
                  "w-full p-2 rounded-lg transition-all",
                  isDark
                    ? "bg-white/5 border-white/10 text-white placeholder-white/40"
                    : "bg-black/5 border-black/10 text-black placeholder-black/40"
                )}
                placeholder="Enter AI assistant name"
              />
            </div>
            <div>
              <label className={cn(
                "block text-sm font-medium mb-1",
                isDark ? "text-white/80" : "text-black/80"
              )}>
                Tone of Voice
              </label>
              <select className={cn(
                "w-full p-2 rounded-lg transition-all",
                isDark
                  ? "bg-white/5 border-white/10 text-white"
                  : "bg-black/5 border-black/10 text-black"
              )}>
                <option>Professional</option>
                <option>Friendly</option>
                <option>Casual</option>
                <option>Formal</option>
              </select>
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <button className={cn(
            "px-4 py-2 rounded-lg transition-all",
            isDark
              ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-90"
              : "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-90"
          )}>
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}