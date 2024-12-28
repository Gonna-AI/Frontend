import React, { useState } from 'react';
import { Ticket, ArrowRight, Copy, RefreshCw } from 'lucide-react';

// Utility function to combine class names
const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};

interface TicketInputProps {
  onSubmit: (code: string) => void;
  error?: string;
  isDark: boolean;
}

// Custom CSS for animations
const styles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }

  .animate-fadeOut {
    animation: fadeOut 0.3s ease-out forwards;
  }

  .animate-spin {
    animation: spin 1s linear infinite;
  }
`;

export default function TicketInput({ onSubmit, error, isDark }: TicketInputProps) {
  const [code, setCode] = useState('');
  const [generatedTicket, setGeneratedTicket] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const generateTicket = () => {
    if (hasGenerated) return;
    
    setIsGenerating(true);
    const randomTicket = Math.random().toString(36).substring(2, 10).toUpperCase();
    
    setTimeout(() => {
      setGeneratedTicket(randomTicket);
      setIsGenerating(false);
      setHasGenerated(true);
    }, 800);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedTicket);
      setIsCopying(true);
      setTimeout(() => setIsCopying(false), 1000);
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
    <>
      <style>{styles}</style>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Generate Ticket Section */}
        <div className={cn(
          "p-4 rounded-xl transition-all duration-300",
          isDark ? "bg-white/5" : "bg-black/5"
        )}>
          <div className="flex items-center gap-3 mb-4">
            <RefreshCw 
              className={cn(
                "w-5 h-5 transition-transform duration-700",
                isDark ? "text-emerald-400" : "text-emerald-600",
                isGenerating && "animate-spin"
              )}
            />
            <span className={isDark ? "text-white/60" : "text-black/60"}>
              Generate Ticket
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {!generatedTicket ? (
              <button
                type="button"
                onClick={generateTicket}
                disabled={isGenerating}
                className={cn(
                  "w-full px-4 py-3 rounded-lg",
                  "transition-all duration-300",
                  "flex items-center justify-center gap-2",
                  isDark
                    ? "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30"
                    : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border border-emerald-500/20",
                  isGenerating && "opacity-50 cursor-not-allowed"
                )}
              >
                {isGenerating ? "Generating..." : "Generate New Ticket"}
              </button>
            ) : (
              <div 
                className={cn(
                  "flex items-center gap-2 p-3 rounded-lg animate-fadeIn",
                  isDark ? "bg-black/40" : "bg-white/40",
                  "border",
                  isDark ? "border-white/10" : "border-black/10"
                )}
              >
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
                    "p-2 rounded-lg transition-all duration-300 relative",
                    isDark
                      ? "hover:bg-white/10 text-white/60"
                      : "hover:bg-black/10 text-black/60"
                  )}
                >
                  <Copy 
                    className={cn(
                      "w-4 h-4 transition-all duration-300",
                      isCopying && "scale-125 text-emerald-400"
                    )} 
                  />
                  {isCopying && (
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs text-emerald-400 whitespace-nowrap animate-fadeOut">
                      Copied!
                    </span>
                  )}
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
              "transition-all duration-300",
              "focus:outline-none focus:ring-2",
              isDark
                ? "bg-black/40 border border-white/10 text-white placeholder-white/30 focus:ring-purple-500/30"
                : "bg-white/40 border border-black/10 text-black placeholder-black/30 focus:ring-purple-500/30"
            )}
          />
          
          {error && (
            <p className="mt-2 text-sm text-red-400 animate-fadeIn">{error}</p>
          )}
        </div>

        <button
          type="submit"
          className={cn(
            "w-full flex items-center justify-center gap-2",
            "px-4 py-3 rounded-lg",
            "transition-all duration-300",
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
    </>
  );
}