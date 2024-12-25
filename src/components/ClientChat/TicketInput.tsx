import React, { useState } from 'react';
import { Ticket, ArrowRight } from 'lucide-react';
import { cn } from '../../utils/cn';

interface TicketInputProps {
  onSubmit: (code: string) => void;
  error?: string;
  isDark: boolean;
}

export default function TicketInput({ onSubmit, error, isDark }: TicketInputProps) {
  const [code, setCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      onSubmit(code);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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