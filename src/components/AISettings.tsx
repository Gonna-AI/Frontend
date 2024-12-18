import React, { useState } from 'react';
import { 
  Database, 
  Bot, 
  MessageSquare,
  CheckCircle 
} from 'lucide-react';

export default function AISettings() {
  const [aiName, setAiName] = useState('');
  const [tone, setTone] = useState('Professional');
  const [length, setLength] = useState('Moderate');
  const [enableFollowUp, setEnableFollowUp] = useState(true);

  return (
    <div className="p-6 max-w-4xl mx-auto min-h-screen bg-black relative overflow-hidden">
      {/* Corner Gradients */}
      <div className="absolute top-0 right-0 w-[35rem] h-[35rem] bg-gradient-to-bl from-purple-600/10 via-blue-500/5 to-transparent blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[25rem] h-[25rem] bg-gradient-to-tr from-blue-600/5 to-transparent blur-2xl pointer-events-none" />

      <div className="relative z-10 space-y-8">
        {/* Header Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white">
            AI Assistant Settings
          </h1>
          <p className="mt-2 text-white/60">
            Configure your AI assistant's behavior and responses
          </p>
        </div>

        {/* Knowledge Base */}
        <section className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-8 space-y-4 hover:bg-white/[0.04] transition-colors duration-300">
          <div className="flex items-center space-x-3 mb-6">
            <Database className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-semibold text-white">Knowledge Base</h2>
          </div>
          <textarea
            className="w-full h-40 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-lg resize-none hover:bg-white/[0.03] transition-colors duration-300"
            placeholder="Add your company's knowledge base, FAQs, or any specific information you want the AI to know..."
          />
        </section>

        {/* Personality Settings */}
        <section className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-8 space-y-6 hover:bg-white/[0.04] transition-colors duration-300">
          <div className="flex items-center space-x-3 mb-4">
            <Bot className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-semibold text-white">Personality Settings</h2>
          </div>
          <div className="space-y-6">
            <div>
              <label className="block text-base font-medium text-white/80 mb-3">
                AI Name
              </label>
              <input
                type="text"
                value={aiName}
                onChange={(e) => setAiName(e.target.value)}
                className="w-full p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/30 text-lg hover:bg-white/[0.03] transition-colors duration-300"
                placeholder="Enter AI assistant name"
              />
            </div>
            <div>
              <label className="block text-base font-medium text-white/80 mb-3">
                Tone of Voice
              </label>
              <div className="grid grid-cols-4 gap-3">
                {['Professional', 'Friendly', 'Casual', 'Formal'].map((option) => (
                  <button
                    key={option}
                    onClick={() => setTone(option)}
                    className={`p-4 rounded-xl border text-sm font-medium transition-all duration-300 ${
                      tone === option 
                        ? 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                        : 'bg-white/[0.02] border-white/[0.05] text-white/60 hover:bg-white/[0.05]'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Response Settings */}
        <section className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-8 space-y-6 hover:bg-white/[0.04] transition-colors duration-300">
          <div className="flex items-center space-x-3 mb-4">
            <MessageSquare className="w-6 h-6 text-emerald-400" />
            <h2 className="text-2xl font-semibold text-white">Response Settings</h2>
          </div>
          <div className="space-y-6">
            <div>
              <label className="block text-base font-medium text-white/80 mb-3">
                Response Length
              </label>
              <div className="flex space-x-3">
                {['Concise', 'Moderate', 'Detailed'].map((option) => (
                  <button
                    key={option}
                    onClick={() => setLength(option)}
                    className={`flex-1 p-4 rounded-xl border text-sm font-medium transition-all duration-300 ${
                      length === option 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-white/[0.02] border-white/[0.05] text-white/60 hover:bg-white/[0.05]'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setEnableFollowUp(!enableFollowUp)}
                className={`flex items-center space-x-2 p-4 rounded-xl border transition-all duration-300 ${
                  enableFollowUp
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : 'bg-white/[0.02] border-white/[0.05] text-white/60'
                }`}
              >
                <CheckCircle className={`w-5 h-5 ${enableFollowUp ? 'opacity-100' : 'opacity-0'}`} />
                <span>Enable follow-up questions</span>
              </button>
            </div>
          </div>
        </section>

        {/* Save Button */}
        <div className="flex justify-end pt-6">
          <button className="px-8 py-4 rounded-xl bg-blue-500 text-white font-semibold text-lg hover:bg-blue-600 active:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}