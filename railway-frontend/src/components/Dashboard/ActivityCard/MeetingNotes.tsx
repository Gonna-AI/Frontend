import React from 'react';
import { cn } from '../../../utils/cn';
import { useTheme } from '../../../hooks/useTheme';

interface MeetingNotesProps {
  summary: string;
  conversation: string[];
}

const formatSummary = (summary: string) => {
  // Remove markdown asterisks and clean up formatting
  return summary
    .replace(/\*\*/g, '') // Remove bold markers
    .replace(/\*/g, '')   // Remove single asterisks
    .split('\n')          // Split into lines
    .map(line => line.trim()) // Trim whitespace
    .filter(line => line)     // Remove empty lines
    .join('\n');             // Rejoin with newlines
};

export default function MeetingNotes({ summary, conversation }: MeetingNotesProps) {
  const { isDark } = useTheme();

  return (
    <div className="space-y-6">
      {/* Meeting Summary */}
      <div className="space-y-3">
        <h3 className={cn(
          "text-lg font-semibold",
          isDark ? "text-white" : "text-black"
        )}>
          Meeting Summary
        </h3>
        <p className={cn(
          "whitespace-pre-line", // Add whitespace-pre-line for proper line breaks
          isDark ? "text-white/70" : "text-black/70"
        )}>
          {formatSummary(summary)}
        </p>
      </div>

      {/* Conversation History */}
      <div className="space-y-3">
        <h3 className={cn(
          "text-lg font-semibold",
          isDark ? "text-white" : "text-black"
        )}>
          Conversation History
        </h3>
        <div className="space-y-2">
          {conversation.map((message, index) => (
            <p
              key={index}
              className={cn(
                "py-2",
                isDark ? "text-white/70" : "text-black/70"
              )}
            >
              {message}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}