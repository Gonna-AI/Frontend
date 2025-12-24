/**
 * Local LLM Service for ClerkTree
 * 
 * Provides AI using Ollama via Cloudflare tunnel
 * Default: https://spirit-indoor-chorus-equation.trycloudflare.com
 * Override with VITE_OLLAMA_URL in .env if needed
 * 
 * Uses /api/generate endpoint as requested
 */

import {
  CallMessage,
  ExtractedField,
  CallCategory,
  PriorityLevel,
  KnowledgeBaseConfig
} from '../contexts/DemoCallContext';

// Configuration - using local service via cloudflare tunnel
// Clean URL: remove trailing slashes, extra spaces, and any trailing text
const getCleanURL = (url: string) => {
  if (!url) return '';
  // Remove any text after the URL (like " check with this")
  let cleaned = url.trim().split(/\s+/)[0];
  // Remove trailing slashes
  cleaned = cleaned.replace(/\/+$/, '');
  return cleaned;
};
const LLM_URL = getCleanURL(import.meta.env.VITE_OLLAMA_URL || 'https://consumption-monetary-thrown-manufacture.trycloudflare.com');
const MODEL_NAME = 'ministral-3:14b';

// Timeout in milliseconds
const REQUEST_TIMEOUT = 120000; // 2 minutes

// Types
export interface LocalLLMResponse {
  response: string;
  reasoning?: string; // Extracted reasoning/thinking from the model (for display, not spoken)
  extractedFields?: ExtractedField[];
  suggestedCategory?: { id: string; name: string; confidence: number };
  suggestedPriority?: PriorityLevel;
  followUpRequired?: boolean;
}

class LocalLLMService {
  private isAvailable: boolean | null = null;

  /**
   * Check if Local LLM service is running and available
   */
  async checkAvailability(): Promise<boolean> {
    try {
      console.log(`🔍 Checking Local LLM availability...`);
      console.log(`   URL: ${LLM_URL}`);
      console.log(`   Env Var: ${import.meta.env.VITE_OLLAMA_URL || 'NOT SET (using default)'}`);

      // Test the /api/generate endpoint with a simple prompt
      const testResponse = await fetch(`${LLM_URL}/api/generate`, {
        method: 'POST',
        mode: 'cors', // Explicitly request CORS
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          model: MODEL_NAME,
          prompt: 'ping',
          stream: false,
          thinking: false
        }),
        signal: AbortSignal.timeout(30000), // 30 second timeout for availability check
      });

      console.log(`   Response Status: ${testResponse.status} ${testResponse.statusText}`);

      if (!testResponse.ok) {
        const errorText = await testResponse.text().catch(() => 'Unknown error');
        console.error(`❌ Local LLM service not available: HTTP ${testResponse.status} at ${LLM_URL}`);
        console.error(`   Error: ${errorText}`);
        this.isAvailable = false;
        return false;
      }

      const testData = await testResponse.json();
      if (testData.response !== undefined) {
        this.isAvailable = true;
        console.log(`✅ Local LLM service available at ${LLM_URL}`);
        return true;
      }

      this.isAvailable = false;
      return false;

    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      console.error(`❌ Local LLM connection failed at ${LLM_URL}`);
      console.error(`   Error: ${errorMsg}`);
      console.error(`   Error Type: ${e instanceof Error ? e.constructor.name : typeof e}`);

      if (errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError') || errorMsg.includes('Load failed')) {
        console.error('   💡 This is a CORS (Cross-Origin Resource Sharing) issue!');
        console.error('   💡 The Ollama server needs to allow requests from your website.');
        console.error('   💡 FIX: On the machine running Ollama, set the environment variable:');
        console.error('   💡       export OLLAMA_ORIGINS="*"');
        console.error('   💡       Then restart Ollama with: ollama serve');
        console.error('   💡 Alternatively, set OLLAMA_ORIGINS to your specific domain.');
      } else if (errorMsg.includes('timeout')) {
        console.error('   💡 Connection timed out. Service might be slow or down.');
      } else {
        console.error('   💡 Make sure VITE_OLLAMA_URL is set correctly in Netlify environment variables.');
        console.error(`   💡 Current value: – "${import.meta.env.VITE_OLLAMA_URL || 'NOT SET'}"`);
      }

      this.isAvailable = false;
      return false;
    }
  }

  /**
   * Initialize the service
   */
  async initialize(): Promise<boolean> {
    return await this.checkAvailability();
  }

  /**
   * Parse response from reasoning model - separates thinking/reasoning from final answer
   * This function is largely deprecated with /api/generate and thinking: false,
   * but kept for robustness if models still output tags.
   */
  private parseReasoningResponse(text: string): { reasoning: string; answer: string } {
    if (!text) return { reasoning: '', answer: '' };

    let reasoning = '';
    let answer = text;

    // Common reasoning tag patterns used by different models
    const reasoningPatterns = [
      /<think>([\s\S]*?)<\/think>/gi,
      /<thinking>([\s\S]*?)<\/thinking>/gi,
      /<reasoning>([\s\S]*?)<\/reasoning>/gi,
      /<thought>([\s\S]*?)<\/thought>/gi,
      /<internal_monologue>([\s\S]*?)<\/internal_monologue>/gi,
    ];

    // Extract all reasoning blocks
    for (const pattern of reasoningPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        if (match[1]) {
          reasoning += (reasoning ? '\n\n' : '') + match[1].trim();
        }
      }
      // Remove reasoning from answer
      answer = answer.replace(pattern, '');
    }

    // Also handle unclosed tags (model got cutoff mid-reasoning)
    const unclosedPatterns = [
      /<think>([\s\S]*)$/i,
      /<thinking>([\s\S]*)$/i,
      /<reasoning>([\s\S]*)$/i,
    ];

    for (const pattern of unclosedPatterns) {
      const match = answer.match(pattern);
      if (match && match[1]) {
        reasoning += (reasoning ? '\n\n' : '') + match[1].trim() + ' [truncated]';
        answer = answer.replace(pattern, '');
      }
    }

    // Try to extract final answer from markers if present
    const finalAnswerPatterns = [
      /<answer>([\s\S]*?)<\/answer>/i,
      /<response>([\s\S]*?)<\/response>/i,
      /<output>([\s\S]*?)<\/output>/i,
      /<final>([\s\S]*?)<\/final>/i,
    ];

    for (const pattern of finalAnswerPatterns) {
      const match = answer.match(pattern);
      if (match && match[1]) {
        answer = match[1].trim();
        break;
      }
    }

    // Clean up the answer
    answer = this.cleanFinalAnswer(answer);

    // Clean up reasoning for display
    reasoning = reasoning
      .replace(/^\s*\n+/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return { reasoning, answer };
  }

  /**
   * Clean the final response text
   */
  private cleanFinalAnswer(text: string): string {
    if (!text) return '';
    let cleaned = text;

    // Remove "Assistant:" prefix if present (common in completion models)
    cleaned = cleaned.replace(/^(?:Assistant|AI):\s*/i, '');

    // Remove only specific template placeholders (be conservative)
    cleaned = cleaned
      .replace(/\[Write assistant's response here\]/gi, '')
      .replace(/\[Your response here\]/gi, '')
      .replace(/\[To be filled\]/gi, '');

    // Remove only known reasoning/thinking tags, NOT all XML-like content
    const tagsToRemove = ['think', 'thinking', 'reasoning', 'thought', 'internal_monologue', 'answer', 'response', 'output', 'final'];
    for (const tag of tagsToRemove) {
      cleaned = cleaned.replace(new RegExp(`<${tag}>[\\s\\S]*?</${tag}>`, 'gi'), '');
      cleaned = cleaned.replace(new RegExp(`<${tag}>`, 'gi'), '');
      cleaned = cleaned.replace(new RegExp(`</${tag}>`, 'gi'), '');
    }

    // Remove "Response:", "Answer:", "Persona:", "System:" prefixes only at the very start
    cleaned = cleaned.replace(/^(?:Response|Answer|Output|Persona|System|Instructions?):\s*/i, '');

    // Remove any echoed persona content - patterns like "Persona: I'm working on..."
    cleaned = cleaned.replace(/\n*Persona:\s*[^\n]+(?:\n(?![A-Z][a-z]*:)[^\n]+)*/gi, '');

    // Remove any echoed system prompt patterns at the start of response
    cleaned = cleaned.replace(/^(?:I am|I'm|You are|You're)\s+(?:a\s+)?(?:helpful\s+)?(?:AI|assistant|helper|bot)[^.]*\./i, '');

    // Remove garbage patterns that indicate model confusion
    cleaned = cleaned.replace(/BEGININPUT\*?[\s\S]*?\*?ENDINPUT\*?/gi, '');
    cleaned = cleaned.replace(/BEGINCONTEXT[\s\S]*?ENDCONTEXT/gi, '');
    cleaned = cleaned.replace(/BEGININPUT\s*/gi, '');
    cleaned = cleaned.replace(/\s*ENDINPUT/gi, '');
    cleaned = cleaned.replace(/BEGINCONTEXT\s*/gi, '');
    cleaned = cleaned.replace(/\s*ENDCONTEXT/gi, '');

    // Remove special tokens that models use internally like <|assistant|>, <|end|>, etc.
    cleaned = cleaned.replace(/<\|[^|]+\|>/g, '');

    // Remove training data markers
    cleaned = cleaned.replace(/Test instruction \d+[\s\S]*?(?=(?:Test instruction|\n\n|$))/gi, '');
    cleaned = cleaned.replace(/^User:\s*I am a robot[\s\S]*/gim, '');
    cleaned = cleaned.replace(/^(?:User|Human|Assistant):\s*$/gim, '');
    cleaned = cleaned.replace(/(?:Human|User|Assistant):\s*\n+(?:Human|User|Assistant):/gi, '');

    // Remove placeholder brackets
    cleaned = cleaned.replace(/\[.*?\]/g, '');

    // Clean up whitespace
    cleaned = cleaned.replace(/^\s*\n+/g, '').replace(/\n{3,}/g, '\n\n').trim();

    // SAFETY: If cleaning resulted in empty but original had content
    if (!cleaned && text.trim()) {
      console.warn('cleanFinalAnswer stripped all content, using original text');
      const firstSentence = text.match(/[^.!?]*[.!?]/);
      if (firstSentence && firstSentence[0].length > 20) {
        cleaned = firstSentence[0].trim();
      } else {
        cleaned = text.substring(0, 500).trim();
      }
    }

    return cleaned;
  }

  /**
   * Parse extracted metadata from model response
   * Looks for JSON block at end of response
   */
  private parseExtractedMetadata(response: string, config: KnowledgeBaseConfig, existingFields: ExtractedField[]): {
    cleanResponse: string;
    extractedFields: ExtractedField[];
    suggestedCategory?: { id: string; name: string; confidence: number };
    suggestedPriority?: PriorityLevel;
  } {
    let cleanResponse = response;
    const newFields: ExtractedField[] = [...existingFields];
    let suggestedPriority: PriorityLevel | undefined;
    let suggestedCategory: { id: string; name: string; confidence: number } | undefined;

    // Look for JSON block in response
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/i);
    if (jsonMatch && jsonMatch[1]) {
      try {
        const metadata = JSON.parse(jsonMatch[1]);

        // Remove JSON block from response for the spoken part
        cleanResponse = response.replace(/```json\s*[\s\S]*?\s*```/gi, '').trim();

        // Extract fields from metadata
        if (metadata.extracted) {
          const ext = metadata.extracted;

          // Add caller name if found and not already present
          if (ext.name && !existingFields.find(f => f.id === 'name')) {
            newFields.push({
              id: 'name',
              label: 'Caller Name',
              value: ext.name,
              confidence: 0.9,
              extractedAt: new Date()
            });
          }

          // Add purpose if found
          if (ext.purpose && !existingFields.find(f => f.id === 'purpose')) {
            newFields.push({
              id: 'purpose',
              label: 'Call Purpose',
              value: ext.purpose,
              confidence: 0.85,
              extractedAt: new Date()
            });
          }

          // Add contact if found
          if (ext.contact && !existingFields.find(f => f.id === 'contact')) {
            newFields.push({
              id: 'contact',
              label: 'Contact Info',
              value: ext.contact,
              confidence: 0.9,
              extractedAt: new Date()
            });
          }

          // Add any other extracted fields
          for (const [key, value] of Object.entries(ext)) {
            if (value && typeof value === 'string' && !['name', 'purpose', 'contact'].includes(key)) {
              if (!existingFields.find(f => f.id === key)) {
                newFields.push({
                  id: key,
                  label: key.charAt(0).toUpperCase() + key.slice(1),
                  value: value,
                  confidence: 0.8,
                  extractedAt: new Date()
                });
              }
            }
          }
        }

        // Get priority
        if (metadata.priority && ['critical', 'high', 'medium', 'low'].includes(metadata.priority)) {
          suggestedPriority = metadata.priority as PriorityLevel;
        }

        // Get category
        if (metadata.category && config.categories) {
          const cat = config.categories.find(c =>
            c.id === metadata.category ||
            c.name.toLowerCase() === metadata.category.toLowerCase()
          );
          if (cat) {
            suggestedCategory = { ...cat, confidence: 0.85 };
          }
        }

        console.log('Extracted metadata from model:', {
          fields: newFields.length - existingFields.length,
          priority: suggestedPriority,
          category: suggestedCategory?.name
        });

      } catch (e) {
        console.warn('Failed to parse model JSON metadata:', e);
        // JSON parsing failed, just clean the response
        cleanResponse = response.replace(/```json\s*[\s\S]*?\s*```/gi, '').trim();
      }
    }

    return { cleanResponse, extractedFields: newFields, suggestedCategory, suggestedPriority };
  }

  /**
   * Generate response using Local LLM service via /api/generate
   */
  async generateResponse(
    userMessage: string,
    conversationHistory: CallMessage[],
    knowledgeBase: KnowledgeBaseConfig,
    existingFields: ExtractedField[]
  ): Promise<LocalLLMResponse> {
    if (!this.isAvailable) {
      throw new Error('Local LLM not available');
    }

    // Build the prompt string for /api/generate
    // We manually construct the chat history

    // 1. System Prompt
    let prompt = `System: You are a receptionist. Keep responses short (1-2 sentences).`;
    if (existingFields.length > 0) {
      const info = existingFields.map(f => `${f.label}: ${f.value}`).join(', ');
      prompt += ` Known info: ${info}.`;
    }
    prompt += `\n`;

    // 2. Conversation History (last 6 messages)
    const recentHistory = conversationHistory.slice(-6);
    for (const msg of recentHistory) {
      const role = msg.speaker === 'agent' ? 'Assistant' : 'User';
      // Clean previous agent messages to avoid feeding back garbage
      const content = msg.speaker === 'agent' ? this.cleanFinalAnswer(msg.text) : msg.text;
      if (content.trim() && content.length < 500) { // Limit length to avoid context stuffing
        prompt += `${role}: ${content}\n`;
      }
    }

    // 3. Current User Message
    prompt += `User: ${userMessage}\nAssistant:`;

    console.log('📝 Sending prompt to /api/generate:', prompt.substring(0, 500) + '...');

    try {
      const response = await fetch(`${LLM_URL}/api/generate`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          model: MODEL_NAME,
          prompt: prompt,
          stream: false,
          thinking: false // Request no thinking output
        }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        const errorMsg = errorData.error || `Local LLM error: ${response.status}`;
        console.error(` Local LLM API error (${response.status}):`, errorMsg);
        throw new Error(`Local LLM error: ${response.status} - ${errorMsg}`);
      }

      const data = await response.json();
      const rawResponse = data.response || '';

      console.log('📝 Raw response length:', rawResponse.length, 'chars');

      // Since 'thinking' is false, we don't expect <think> tags, but we should still handle them just in case
      const { reasoning, answer } = this.parseReasoningResponse(rawResponse);

      console.log(' Reasoning extracted:', reasoning ? `${reasoning.length} chars` : 'none');
      console.log(' Final answer:', answer ? `${answer.length} chars` : 'none');

      // Use answer if available, otherwise fall back to raw response
      const finalResponse = answer || rawResponse;

      if (!finalResponse || !finalResponse.trim()) {
        console.error(' Empty response after parsing!');
        console.error('   Raw response was:', rawResponse.substring(0, 500));
        throw new Error('Received empty response from LLM');
      }

      // Parse any metadata if the model outputted JSON (unlikely with this simple prompt but possible if trained)
      const extracted = this.parseExtractedMetadata(finalResponse, knowledgeBase, existingFields);

      return {
        response: extracted.cleanResponse,
        reasoning: reasoning || undefined,
        extractedFields: extracted.extractedFields,
        suggestedCategory: extracted.suggestedCategory,
        suggestedPriority: extracted.suggestedPriority,
      };

    } catch (error) {
      console.error('Local LLM error:', error);
      throw error;
    }
  }

  /**
   * Generate call summary using /api/generate
   */
  async summarizeCall(
    messages: CallMessage[],
    extractedFields: ExtractedField[],
    category?: CallCategory,
    priority?: PriorityLevel
  ): Promise<{
    summary: string;
    mainPoints: string[];
    sentiment: 'positive' | 'neutral' | 'negative';
    followUpRequired: boolean;
    notes: string;
    callerName?: string;
  }> {
    if (!this.isAvailable) {
      throw new Error('Local LLM not available');
    }

    // Use longer timeout for summary generation (3 minutes)
    const SUMMARY_TIMEOUT = 180000;

    // Format transcript concisely - limit to last 10 messages for faster processing
    const recentMessages = messages.slice(-10);
    const transcript = recentMessages.map(m =>
      `${m.speaker === 'agent' ? 'AI' : 'Caller'}: ${m.text.slice(0, 200)}`
    ).join('\n');

    const extractedText = extractedFields.map(f => `${f.label}: ${f.value}`).join(', ');

    // Try to find caller name from extracted fields first
    let callerName = extractedFields.find(f => f.id === 'name')?.value;

    // If no name in fields, try to extract from messages
    if (!callerName) {
      for (const msg of messages) {
        if (msg.speaker === 'user') {
          // Look for name patterns
          const patterns = [
            /(?:my name is|i'?m|this is|i am)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
            /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:here|calling|speaking)/i,
          ];
          for (const pattern of patterns) {
            const match = msg.text.match(pattern);
            if (match?.[1] && match[1].length > 2) {
              callerName = match[1].trim();
              break;
            }
          }
          if (callerName) break;
        }
      }
    }

    // Simple prompt for summary
    const prompt = `System: Summarize this call in JSON format: {"summary": "...", "mainPoints": ["...", "..."], "sentiment": "neutral", "followUpRequired": false, "notes": "..."}.
    
${transcript}

${callerName ? `Caller Name: ${callerName}` : 'Caller name: Unknown'}
${extractedText ? `Extracted Info: ${extractedText}` : ''}
${category ? `Category: ${category.name}` : ''}
${priority ? `Priority: ${priority}` : ''}

Assistant:`;

    try {
      console.log('📝 Generating summary with /api/generate...');

      const response = await fetch(`${LLM_URL}/api/generate`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          model: MODEL_NAME,
          prompt: prompt,
          stream: false,
          thinking: false
        }),
        signal: AbortSignal.timeout(SUMMARY_TIMEOUT),
      });

      if (!response.ok) {
        throw new Error(`Local LLM error: ${response.status}`);
      }

      const data = await response.json();
      const rawResponse = data.response || '';

      console.log('📝 Summary raw response:', rawResponse.slice(0, 200));

      // Attempt to parse JSON
      let parsedSummary = null;
      try {
        const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedSummary = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.log('Could not parse summary as JSON, using text fallback:', e);
      }

      if (parsedSummary) {
        return {
          summary: parsedSummary.summary || 'Call completed',
          mainPoints: Array.isArray(parsedSummary.mainPoints) ? parsedSummary.mainPoints : [parsedSummary.summary || 'Call completed'],
          sentiment: ['positive', 'neutral', 'negative'].includes(parsedSummary.sentiment) ? parsedSummary.sentiment : 'neutral',
          followUpRequired: parsedSummary.followUpRequired === true || priority === 'high' || priority === 'critical',
          notes: parsedSummary.notes || rawResponse,
          callerName: callerName
        };
      }

      // Fallback: extract summary from text
      const summary = rawResponse.split('.')[0] || rawResponse.slice(0, 200) || 'Call completed';

      return {
        summary: summary,
        mainPoints: [summary],
        sentiment: 'neutral',
        followUpRequired: priority === 'high' || priority === 'critical',
        notes: rawResponse,
        callerName: callerName
      };

    } catch (error) {
      console.error('Local LLM summary error:', error);

      // Return a basic summary on error instead of throwing
      // This ensures the call still saves with at least basic info
      const basicSummary = messages.length > 0
        ? `Conversation with ${messages.filter(m => m.speaker === 'user').length} user messages`
        : 'Call completed';

      return {
        summary: basicSummary,
        mainPoints: [basicSummary],
        sentiment: 'neutral',
        followUpRequired: priority === 'high' || priority === 'critical',
        notes: `Summary generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        callerName: callerName
      };
    }
  }

  /**
   * Check if service is available
   */
  isServiceAvailable(): boolean {
    return this.isAvailable === true;
  }

  /**
   * Get the service URL being used
   */
  getServiceUrl(): string {
    return LLM_URL;
  }
}

// Export singleton
export const localLLMService = new LocalLLMService();

// Initialize on import
localLLMService.initialize();

export default localLLMService;
