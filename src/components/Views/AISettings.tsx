import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../utils/cn';
import { Database, Bot, MessageSquare, Save, Settings as SettingsIcon } from 'lucide-react';
import Section from '../AISettings/Section';
import FormField from '../AISettings/FormField';
import Input from '../AISettings/Input';
import Select from '../AISettings/Select';
import Textarea from '../AISettings/Textarea';
import Button from '../AISettings/Button';

export default function AISettings() {
  const { isDark } = useTheme();

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/10 via-white/5 to-transparent border border-white/20 backdrop-blur-xl p-8">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[35rem] h-[35rem] bg-gradient-to-bl from-blue-500/20 via-purple-500/5 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[35rem] h-[35rem] bg-gradient-to-tr from-purple-500/10 to-transparent blur-3xl pointer-events-none" />

        <div className="relative z-10">
          {/* Header with Icon */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
              <SettingsIcon className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className={cn(
                "text-2xl font-bold mb-1",
                isDark ? "text-white" : "text-black"
              )}>
                AI Assistant Settings
              </h1>
              <p className={cn(
                isDark ? "text-white/60" : "text-black/60"
              )}>
                Configure your AI assistant's behavior and responses
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Knowledge Base Section */}
            <div className={cn(
              "p-6 rounded-2xl",
              "bg-gradient-to-br from-white/5 via-white/10 to-transparent",
              "border border-white/20 backdrop-blur-sm"
            )}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
                  <Database className="w-5 h-5 text-blue-400" />
                </div>
                <h2 className={cn(
                  "text-lg font-semibold",
                  isDark ? "text-white" : "text-black"
                )}>Knowledge Base</h2>
              </div>
              <Textarea
                className="min-h-[120px] bg-white/5 border-white/20 rounded-xl"
                placeholder="Add your company's knowledge base, FAQs, or any specific information you want the AI to know..."
              />
            </div>

            {/* Personality Settings */}
            <div className={cn(
              "p-6 rounded-2xl",
              "bg-gradient-to-br from-white/5 via-white/10 to-transparent",
              "border border-white/20 backdrop-blur-sm"
            )}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-purple-400" />
                </div>
                <h2 className={cn(
                  "text-lg font-semibold",
                  isDark ? "text-white" : "text-black"
                )}>Personality Settings</h2>
              </div>
              <div className="space-y-4">
                <FormField label="AI Name">
                  <Input
                    type="text"
                    placeholder="Enter AI assistant name"
                    className="bg-white/5 border-white/20 rounded-xl"
                  />
                </FormField>
                <FormField label="Tone of Voice">
                  <Select 
                    defaultValue="Professional"
                    className="bg-white/5 border-white/20 rounded-xl"
                  >
                    <option value="Professional">Professional</option>
                    <option value="Friendly">Friendly</option>
                    <option value="Casual">Casual</option>
                    <option value="Formal">Formal</option>
                  </Select>
                </FormField>
              </div>
            </div>

            {/* Response Settings */}
            <div className={cn(
              "p-6 rounded-2xl",
              "bg-gradient-to-br from-white/5 via-white/10 to-transparent",
              "border border-white/20 backdrop-blur-sm"
            )}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-emerald-400" />
                </div>
                <h2 className={cn(
                  "text-lg font-semibold",
                  isDark ? "text-white" : "text-black"
                )}>Response Settings</h2>
              </div>
              <div className="space-y-4">
                <FormField label="Response Length">
                  <Select 
                    defaultValue="Moderate"
                    className="bg-white/5 border-white/20 rounded-xl"
                  >
                    <option value="Concise">Concise</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Detailed">Detailed</option>
                  </Select>
                </FormField>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/20">
                  <input
                    type="checkbox"
                    id="followUp"
                    defaultChecked
                    className={cn(
                      "w-5 h-5 rounded-lg transition-all cursor-pointer",
                      isDark
                        ? "bg-white/5 border-white/20 checked:bg-blue-500/50"
                        : "bg-black/5 border-black/10 checked:bg-blue-500"
                    )}
                  />
                  <label
                    htmlFor="followUp"
                    className={cn(
                      "font-medium cursor-pointer",
                      isDark ? "text-white/80" : "text-black/80"
                    )}
                  >
                    Enable follow-up questions
                  </label>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <button className={cn(
                "px-6 py-2 rounded-xl transition-all",
                "bg-gradient-to-r from-blue-400/30 to-purple-400/30 backdrop-blur-sm",
                "border border-white/20",
                "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]",
                isDark ? "text-white" : "text-black",
                "hover:from-blue-400/40 hover:to-purple-400/40",
                "flex items-center gap-2"
              )}>
                <Save className="w-4 h-4" />
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}