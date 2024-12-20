import React, { useState } from 'react';
import { FileText, Info } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { useTheme } from '../../../hooks/useTheme';

interface MeetingNotesProps {
  summary: string;
  conversation: string[];
}

export default function MeetingNotes({ summary, conversation }: MeetingNotesProps) {
  const { isDark } = useTheme();
  const [showConversation, setShowConversation] = useState(false);

  return (
    <div className={cn(
      "p-4 rounded-lg",
      isDark ? "bg-white/5" : "bg-black/5"
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-purple-400" />
          <span className={isDark ? "text-white/60" : "text-black/60"}>
            Minutes of Meeting
          </span>
        </div>
        <button
          onClick={() => setShowConversation(!showConversation)}
          className={cn(
            "p-2 rounded-lg transition-colors",
            isDark
              ? "hover:bg-white/10 text-white/60"
              : "hover:bg-black/10 text-black/60"
          )}
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      {showConversation ? (
        <div className="space-y-3">
          {conversation.map((message, index) => (
            <div
              key={index}
              className={cn(
                "p-2 rounded",
                isDark ? "bg-white/5" : "bg-black/5"
              )}
            >
              <p className={cn(
                "text-sm",
                isDark ? "text-white/80" : "text-black/80"
              )}>
                {message}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className={cn(
          "text-sm",
          isDark ? "text-white/80" : "text-black/80"
        )}>
          {summary}
        </p>
      )}
    </div>
  );
}