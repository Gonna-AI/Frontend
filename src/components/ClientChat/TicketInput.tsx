import React, { useState } from 'react';
import { Ticket, ArrowRight, Copy, RefreshCw } from 'lucide-react';
import { cn } from '../../utils/cn';

interface TicketInputProps {
  onSubmit: (code: string) => void;
  error?: string;
  isDark: boolean;
}

export default function TicketInput({ onSubmit, error, isDark }: TicketInputProps) {
  const [code, setCode] = useState('');
  const [generatedTicket, setGeneratedTicket] = useState('');

  const generateTicket = () => {
    const randomTicket = Math.random().toString(36).substring(2, 10).toUpperCase();
    setGeneratedTicket(randomTicket);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedTicket);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      onSubmit(code);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Generate Ticket Section */}
      <div className={cn(
        "p-4 rounded-xl",
        isDark ? "bg-white/5" : "bg-black/5"
      )}>
        <div className="flex items-center gap-3 mb-4">
          <RefreshCw className={cn(
            "w-5 h-5",
            isDark ? "text-emerald-400" : "text-emerald-600"
          )} />
          <span className={isDark ? "text-white/60" : "text-black/60"}>
            Generate Ticket
          </span>
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={generateTicket}
            className={cn(
              "w-full px-4 py-3 rounded-lg",
              "transition-colors duration-200",
              "flex items-center justify-center gap-2",
              isDark
                ? "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30"
                : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border border-emerald-500/20"
            )}
          >
            Generate New Ticket
          </button>

          {generatedTicket && (
            <div className={cn(
              "flex items-center gap-2 p-3 rounded-lg",
              isDark ? "bg-black/40" : "bg-white/40",
              "border",
              isDark ? "border-white/10" : "border-black/10"
            )}>
              <span className={cn(
                "flex-1 font-mono",
                isDark ? "text-white" : "text-black"
              )}>
                {generatedTicket}
              </span>
              <button
                type="button"
                onClick={copyToClipboard}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  isDark
                    ? "hover:bg-white/10 text-white/60"
                    : "hover:bg-black/10 text-black/60"
                )}
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Support Ticket Input */}
      <div className={cn(
        "p-4 rounded-xl",
        isDark ? "bg-white/5" : "bg-black/5"
      )}>
        <div className="flex items-center gap-3 mb-4">
          <Ticket className={cn(
            "w-5 h-5",
            isDark ? "text-purple-400" : "text-purple-600"
          )} />
          <span className={isDark ? "text-white/60" : "text-black/60"}>
            Support Ticket
          </span>
        </div>
        
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter your ticket code"
          className={cn(
            "w-full px-4 py-3 rounded-lg",
            "transition-colors duration-200",
            "focus:outline-none focus:ring-2",
            isDark
              ? "bg-black/40 border border-white/10 text-white placeholder-white/30 focus:ring-purple-500/30"
              : "bg-white/40 border border-black/10 text-black placeholder-black/30 focus:ring-purple-500/30"
          )}
        />
        
        {error && (
          <p className="mt-2 text-sm text-red-400">{error}</p>
        )}
      </div>

      <button
        type="submit"
        className={cn(
          "w-full flex items-center justify-center gap-2",
          "px-4 py-3 rounded-lg",
          "transition-all duration-200",
          "bg-gradient-to-r",
          isDark
            ? "from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 text-white"
            : "from-purple-500/10 to-blue-500/10 hover:from-purple-500/20 hover:to-blue-500/20 text-black",
          "border",
          isDark ? "border-white/10" : "border-black/10"
        )}
      >
        <span>Continue to Chat</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </form>
  );
}