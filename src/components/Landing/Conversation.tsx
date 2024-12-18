import React from 'react';
import { cn } from '../../utils/cn';

const messages = [
  { isAI: true, text: "Hello! I notice this is a high-priority medical claim. How can I assist you today?" },
  { isAI: false, text: "The client is requesting an urgent update on their claim status from last week." },
  { isAI: true, text: "I've analyzed the claim history and detected urgency. Would you like me to schedule a priority callback within the next 2 hours?" },
  { isAI: false, text: "Yes, that would be helpful. Can you also prepare a summary of the claim status?" },
  { isAI: true, text: "I've scheduled a priority callback for 2:30 PM. Here's the claim summary: Initial filing date 03/15, current status: Under Review, Expected resolution: 48 hours. Sentiment analysis indicates the client needs reassurance about the timeline." }
];

export default function Conversation() {
  return (
    <div className="py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-white">
          AI-Powered Claims Assistant in Action
        </h2>

        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex",
                message.isAI ? "justify-start" : "justify-end"
              )}
            >
              <div className={cn(
                "max-w-md p-4 rounded-2xl relative group transform hover:scale-105 transition-all",
                message.isAI
                  ? "bg-white/10 backdrop-blur-xl border border-white/20 text-white glass-effect"
                  : "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white glass-effect"
              )}>
                <div className={cn(
                  "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity",
                  message.isAI
                    ? "bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10"
                    : "bg-white/10"
                )} />
                <p className="relative">
                  {message.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}