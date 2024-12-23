import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../utils/cn';
import Section from './Section';
import FormField from './FormField';
import Input from './Input';
import Select from './Select';
import Textarea from './Textarea';
import Button from './Button';

export default function AISettings() {
  const { isDark } = useTheme();

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-white/10 backdrop-blur-xl p-6 md:p-8">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[25rem] h-[25rem] bg-gradient-to-bl from-blue-500/20 via-purple-500/5 to-transparent blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[25rem] h-[25rem] bg-gradient-to-tr from-purple-500/10 to-transparent blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <h1 className={cn(
            "text-2xl font-bold mb-8",
            isDark ? "text-white" : "text-black"
          )}>
            AI Assistant Settings
          </h1>

          <div className="space-y-6">
            <Section title="Knowledge Base">
              <Textarea
                placeholder="Add your company's knowledge base, FAQs, or any specific information you want the AI to know..."
              />
            </Section>

            <Section title="Personality Settings">
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

            <Section title="Response Settings">
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