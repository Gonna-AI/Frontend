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
      <h1 className={cn(
        "text-xl md:text-2xl font-bold mb-4 md:mb-6",
        isDark ? "text-white" : "text-black"
      )}>
        AI Assistant Settings
      </h1>

      <div className="space-y-4 md:space-y-6">
        <Section title="Knowledge Base">
          <Textarea
            placeholder="Add your company's knowledge base, FAQs, or any specific information you want the AI to know..."
          />
        </Section>

        <Section title="Personality Settings">
          <div className="space-y-3 md:space-y-4">
            <FormField label="AI Name">
              <Input
                type="text"
                placeholder="Enter AI assistant name"
              />
            </FormField>
            <FormField label="Tone of Voice">
              <Select>
                <option>Professional</option>
                <option>Friendly</option>
                <option>Casual</option>
                <option>Formal</option>
              </Select>
            </FormField>
          </div>
        </Section>

        <Section title="Response Settings">
          <div className="space-y-3 md:space-y-4">
            <FormField label="Response Length">
              <Select>
                <option>Concise</option>
                <option>Moderate</option>
                <option>Detailed</option>
              </Select>
            </FormField>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="followUp"
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
  );
}