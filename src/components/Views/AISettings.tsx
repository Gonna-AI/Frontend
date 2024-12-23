import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../utils/cn';
import { Database, Bot, MessageSquare } from 'lucide-react';
import Section from '../AISettings/Section';
import FormField from '../AISettings/FormField';
import Input from '../AISettings/Input';
import Select from '../AISettings/Select';
import Textarea from '../AISettings/Textarea';
import Button from '../AISettings/Button';

export default function AISettings() {
  const { isDark } = useTheme();

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className={cn(
        "relative overflow-hidden rounded-2xl p-6 md:p-8",
        isDark 
          ? "bg-black/40 border-white/10" 
          : "bg-white/80 border-black/5",
        "border backdrop-blur-xl"
      )}>
        {/* Background Gradients */}
        <div className={cn(
          "absolute top-0 right-0 w-[25rem] h-[25rem] blur-2xl pointer-events-none",
          "bg-gradient-to-bl",
          isDark 
            ? "from-blue-500/20 via-purple-500/5 to-transparent"
            : "from-blue-500/10 via-purple-500/5 to-transparent"
        )} />
        <div className={cn(
          "absolute bottom-0 left-0 w-[25rem] h-[25rem] blur-2xl pointer-events-none",
          "bg-gradient-to-tr",
          isDark 
            ? "from-purple-500/10 to-transparent"
            : "from-purple-500/5 to-transparent"
        )} />

        <div className="relative z-10">
          <h1 className={cn(
            "text-2xl font-bold mb-2",
            isDark ? "text-white" : "text-black"
          )}>
            AI Assistant Settings
          </h1>
          <p className={cn(
            "mb-8",
            isDark ? "text-white/60" : "text-black/60"
          )}>
            Configure your AI assistant's behavior and responses
          </p>

          <div className="space-y-6">
            <Section 
              icon={Database} 
              title="Knowledge Base"
              iconColor="text-blue-400"
            >
              <Textarea
                placeholder="Add your company's knowledge base, FAQs, or any specific information you want the AI to know..."
              />
            </Section>

            <Section 
              icon={Bot}
              title="Personality Settings"
              iconColor="text-purple-400"
            >
              <div className="space-y-4">
                <FormField label="AI Name">
                  <Input
                    type="text"
                    placeholder="Enter AI assistant name"
                  />
                </FormField>
                <FormField label="Tone of Voice">
                  <Select defaultValue="Professional">
                    <option value="Professional">Professional</option>
                    <option value="Friendly">Friendly</option>
                    <option value="Casual">Casual</option>
                    <option value="Formal">Formal</option>
                  </Select>
                </FormField>
              </div>
            </Section>

            <Section 
              icon={MessageSquare}
              title="Response Settings"
              iconColor="text-emerald-400"
            >
              <div className="space-y-4">
                <FormField label="Response Length">
                  <Select defaultValue="Moderate">
                    <option value="Concise">Concise</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Detailed">Detailed</option>
                  </Select>
                </FormField>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="followUp"
                    defaultChecked
                    className={cn(
                      "w-4 h-4 md:w-5 md:h-5 rounded transition-all",
                      isDark
                        ? "bg-white/5 border border-white/10 checked:bg-white/20"
                        : "bg-black/5 border border-black/10 checked:bg-blue-500"
                    )}
                  />
                  <label
                    htmlFor="followUp"
                    className={cn(
                      "text-sm md:text-base font-medium",
                      isDark ? "text-white/80" : "text-black/80"
                    )}
                  >
                    Enable follow-up questions
                  </label>
                </div>
              </div>
            </Section>

            <div className="flex justify-end pt-4">
              <Button>
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}