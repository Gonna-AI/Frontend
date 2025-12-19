import React, { useState } from 'react';
import { Ticket, ArrowRight } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../utils/cn';

interface TicketVerificationProps {
  onVerify: (code: string) => void;
}

export default function TicketVerification({ onVerify }: TicketVerificationProps) {
  const { isDark } = useTheme();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!code.trim()) {
      setError('Please enter a ticket code');
      return;
    }

    if (code === '123') {
      onVerify(code);
    } else {
      setError('Invalid ticket code');
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 md:p-8">
      <div className={cn(
        "w-full max-w-md p-6 rounded-xl",
        isDark ? "bg-white/5" : "bg-black/5"
      )}>
        <div className="flex items-center gap-3 mb-6">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            isDark ? "bg-white/10" : "bg-black/10"
          )}>
            <Ticket className={cn(
              "w-5 h-5",
              isDark ? "text-white" : "text-black"
            )} />
          </div>
          <h2 className={cn(
            "text-xl font-semibold",
            isDark ? "text-white" : "text-black"
          )}>
            Enter Ticket Code
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
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
                  ? "bg-white/5 border border-white/10 text-white placeholder-white/30 focus:ring-white/20"
                  : "bg-black/5 border border-black/10 text-black placeholder-black/30 focus:ring-black/20"
              )}
            />
            {error && (
              <p className="mt-2 text-sm text-red-400">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            className={cn(
              "w-full flex items-center justify-center gap-2",
              "px-4 py-3 rounded-lg",
              "transition-colors duration-200",
              isDark
                ? "bg-white/10 hover:bg-white/20 text-white"
                : "bg-black/10 hover:bg-black/20 text-black"
            )}
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}