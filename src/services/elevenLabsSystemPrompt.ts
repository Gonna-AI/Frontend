// src/services/elevenLabsSystemPrompt.ts
import type { KnowledgeBaseConfig } from '../contexts/DemoCallContext';

/**
 * Builds a voice-optimised system prompt for the ElevenLabs ConvAI agent
 * from the user's KnowledgeBaseConfig.
 *
 * Rules:
 * - No markdown that doesn't translate to speech (no **, no ---)
 * - No references to tool calling or "searching the knowledge base"
 * - Auto-detect English / German and respond in the caller's language
 */
export function buildElevenLabsSystemPrompt(kb: KnowledgeBaseConfig): string {
  const sections: string[] = [];

  // 1. Persona + base system prompt
  const persona = kb.persona?.trim() || 'a professional, empathetic AI receptionist';
  sections.push(`You are ${persona}.`);

  if (kb.systemPrompt?.trim()) {
    sections.push(kb.systemPrompt.trim());
  }

  // 2. Call categories
  if (kb.categories?.length) {
    const catLines = kb.categories
      .map(c => `- ${c.name}: ${c.description}`)
      .join('\n');
    sections.push(`Call Categories\nClassify each call into one of these categories:\n${catLines}`);
  }

  // 3. Priority rules
  if (kb.priorityRules?.length) {
    const ruleLines = kb.priorityRules.map(r => `- ${r}`).join('\n');
    sections.push(`Priority Rules\n${ruleLines}`);
  }

  // 4. Custom instructions
  if (kb.customInstructions?.length) {
    const instrLines = kb.customInstructions.map(i => `- ${i}`).join('\n');
    sections.push(`Instructions\n${instrLines}`);
  }

  // 5. Response guidelines
  if (kb.responseGuidelines?.trim()) {
    sections.push(`Response Guidelines\n${kb.responseGuidelines.trim()}`);
  }

  // 6. Language auto-detection (English / German)
  sections.push(`Language Detection — CRITICAL
Detect the language the caller uses at the very start of the conversation.
If they speak German, respond ENTIRELY in German for the whole call.
If they speak English, respond ENTIRELY in English for the whole call.
Switch languages only if the caller explicitly switches. Mirror their language automatically.
Never mix languages within a single response.`);

  // 7. Voice interaction rules (override any text-chat habits)
  sections.push(`Voice Interaction Rules
This is a voice call, not a text chat.
Keep responses concise — one or two sentences at most.
Do not use bullet points, asterisks, dashes, or any special formatting.
Speak naturally, as if having a real phone conversation.
Do not announce that you are searching a database or looking something up — just answer.`);

  return sections.join('\n\n');
}
