/**
 * Local LLM Service for ClerkTree
 * 
 * Provides AI using Ollama via Cloudflare tunnel
 * Default: https://powered-lat-journalism-expressed.trycloudflare.com
 * Override with VITE_OLLAMA_URL in .env if needed
 * 
 * Uses /completion endpoint with prompt-based requests
 */

import {
  CallMessage,
  ExtractedField,
  CallCategory,
  PriorityLevel,
  KnowledgeBaseConfig
} from '../contexts/DemoCallContext';

// Configuration - using local service via cloudflare tunnel
// Clean URL: remove trailing slashes, extra spaces, and any trailing text like "check with this"
const getCleanURL = (url: string) => {
  if (!url) return '';
  // Remove any text after the URL (like " check with this")
  let cleaned = url.trim().split(/\s+/)[0];
  // Remove trailing slashes
  cleaned = cleaned.replace(/\/+$/, '');
  return cleaned;
};
const LLM_URL = getCleanURL(import.meta.env.VITE_OLLAMA_URL || 'https://powered-lat-journalism-expressed.trycloudflare.com');

// Number of tokens to generate per response - increased for reasoning models
const N_PREDICT = 2048;

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
      // Log the actual URL being used
      console.log(`🔍 Checking Local LLM availability...`);
      console.log(`   URL: ${LLM_URL}`);
      console.log(`   Env Var: ${import.meta.env.VITE_OLLAMA_URL || 'NOT SET (using default)'}`);

      // Test the /completion endpoint with a simple prompt
      const testResponse = await fetch(`${LLM_URL}/completion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'test',
          n_predict: 10,
        }),
        signal: AbortSignal.timeout(10000),
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
      if (testData.content !== undefined) {
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

      if (errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError')) {
        console.error('   💡 This is likely a CORS or network issue.');
        console.error('   💡 Check if the local service is running and accessible via cloudflare tunnel.');
        console.error('   💡 Verify the URL in Netlify environment variables matches your cloudflare tunnel URL.');
      } else if (errorMsg.includes('timeout')) {
        console.error('   💡 Connection timed out. Service might be slow or down.');
      } else {
        console.error('   💡 Make sure VITE_OLLAMA_URL is set correctly in Netlify environment variables.');
        console.error('   💡 Current value:', import.meta.env.VITE_OLLAMA_URL || 'NOT SET');
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
   * Returns both the reasoning (for display) and the clean response (for speech)
   */
  private parseReasoningResponse(text: string): { reasoning: string; answer: string } {
    if (!text) return { reasoning: '', answer: '' };

    let reasoning = '';
    let answer = text;

    // Common reasoning tag patterns used by different models
    // DeepSeek R1, Qwen QwQ, etc. use <think>...</think>
    // Some models use <thinking>, <reasoning>, <thought>
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
   * Clean the final answer - remove template artifacts and formatting issues
   */
  private cleanFinalAnswer(text: string): string {
    if (!text) return '';

    let cleaned = text;

    // Remove template placeholders
    cleaned = cleaned
      .replace(/\[Write assistant's response here\]/gi, '')
      .replace(/\[Your response here\]/gi, '')
      .replace(/\[To be filled\]/gi, '')
      .replace(/\[To be\s*$/gi, '')
      .replace(/\[.*response.*\]/gi, '')
      .replace(/\[.*to be.*\]/gi, '');

    // Remove any remaining XML-like tags
    cleaned = cleaned.replace(/<[^>]+>/g, '');

    // Remove "Response:" or "Answer:" prefixes
    cleaned = cleaned.replace(/^(?:Response|Answer|Output):\s*/i, '');

    // Remove test patterns
    cleaned = cleaned.replace(/Test instruction \d+.*$/gim, '');
    cleaned = cleaned.replace(/^User \d+:.*$/gim, '');
    cleaned = cleaned.replace(/^Assistant \d+:.*$/gim, '');

    // Clean up whitespace
    cleaned = cleaned
      .replace(/^\s*\n+/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    // If answer is empty but we have text, try to extract last meaningful sentence
    if (!cleaned && text.trim()) {
      const lines = text.split('\n').filter(l => l.trim());
      if (lines.length > 0) {
        // Get the last non-empty line that looks like a response
        for (let i = lines.length - 1; i >= 0; i--) {
          const line = lines[i].trim();
          if (line.length > 10 && !line.startsWith('<') && !line.includes('[')) {
            cleaned = line;
            break;
          }
        }
      }
    }

    return cleaned;
  }

  /**
   * Build system prompt for the AI
   */
  private buildSystemPrompt(config: KnowledgeBaseConfig, existingFields: ExtractedField[]): string {
    const categoryList = config.categories.map(c => `- ${c.id}: ${c.name}`).join('\n');
    const extractedInfo = existingFields.length > 0
      ? existingFields.map(f => `${f.label}: ${f.value}`).join(', ')
      : 'None';

    // Keep prompt concise for lower context usage
    return `You are ${config.persona || 'an AI assistant'}. ${config.systemPrompt}

CATEGORIES:
${categoryList}

KNOWN INFO: ${extractedInfo}

RULES:
- If caller introduced themselves, use their name naturally
- Don't ask for info you already have
- Be helpful and conversational
- Respond naturally based on the conversation context

${config.customInstructions.length > 0 ? 'INSTRUCTIONS:\n' + config.customInstructions.join('\n') : ''}`;
  }

  /**
   * Generate response using Local LLM service
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

    const systemPrompt = this.buildSystemPrompt(knowledgeBase, existingFields);

    // Format conversation history (limit to recent messages to save context)
    const recentHistory = conversationHistory.slice(-10);

    // Build prompt string from conversation history
    let prompt = systemPrompt + '\n\n';

    // Add conversation history (clean each message first)
    for (const msg of recentHistory) {
      const role = msg.speaker === 'agent' ? 'Assistant' : 'User';
      // Clean agent responses to prevent template artifacts from being fed back
      const cleanedText = msg.speaker === 'agent' ? this.cleanFinalAnswer(msg.text) : msg.text;
      prompt += `${role}: ${cleanedText}\n`;
    }

    // Add current user message
    prompt += `User: ${userMessage}\nAssistant:`;

    try {
      const response = await fetch(`${LLM_URL}/completion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt,
          n_predict: N_PREDICT,
        }),
        signal: AbortSignal.timeout(60000), // 60 second timeout
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        const errorMsg = errorData.error || `Local LLM error: ${response.status}`;
        console.error(`❌ Local LLM API error (${response.status}):`, errorMsg);
        throw new Error(`Local LLM error: ${response.status} - ${errorMsg}`);
      }

      const data = await response.json();

      // Parse the response - separate reasoning from final answer
      const rawResponse = data.content || '';
      const { reasoning, answer } = this.parseReasoningResponse(rawResponse);

      console.log('🧠 Reasoning extracted:', reasoning ? `${reasoning.length} chars` : 'none');
      console.log('💬 Final answer:', answer ? `${answer.length} chars` : 'none');

      return {
        response: answer || rawResponse,
        reasoning: reasoning || undefined,
        extractedFields: existingFields, // Keep existing fields
      };

    } catch (error) {
      console.error('Local LLM error:', error);
      throw error;
    }
  }



  /**
   * Generate call summary using local LLM
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

    // Format transcript concisely
    const transcript = messages.slice(-20).map(m =>
      `${m.speaker === 'agent' ? 'AI' : 'Caller'}: ${m.text}`
    ).join('\n');

    const extractedText = extractedFields.map(f => `${f.label}: ${f.value}`).join(', ');
    const callerName = extractedFields.find(f => f.id === 'name')?.value;

    const prompt = `Summarize this call transcript. IMPORTANT: First extract the caller's name if mentioned but not yet extracted.

TRANSCRIPT:
${transcript}

EXTRACTED INFO: ${extractedText || 'None'}
${category ? `CATEGORY: ${category.name}` : ''}
${priority ? `PRIORITY: ${priority}` : ''}

If the caller's name was mentioned in the conversation, extract it using extract_caller_info FIRST, then provide a concise summary with key points.`;

    try {
      const response = await fetch(`${LLM_URL}/completion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt,
          n_predict: N_PREDICT,
        }),
        signal: AbortSignal.timeout(60000),
      });

      if (!response.ok) {
        throw new Error(`Local LLM error: ${response.status}`);
      }

      const data = await response.json();

      // Parse the response - separate reasoning from final answer
      const rawResponse = data.content || '';
      const { answer: textResponse } = this.parseReasoningResponse(rawResponse);
      const finalText = textResponse || rawResponse;

      // Try to extract a simple summary (first sentence or first 200 chars)
      const summary = finalText.split('.')[0] || finalText.slice(0, 200) || 'Call completed';

      return {
        summary: summary,
        mainPoints: [textResponse.slice(0, 100) || 'Call completed'],
        sentiment: 'neutral', // Can't detect sentiment from simple API
        followUpRequired: priority === 'high' || priority === 'critical',
        notes: textResponse,
        callerName: callerName
      };

    } catch (error) {
      console.error('Local LLM summary error:', error);
      throw error;
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
localLLMService.initialize().catch(() => {
  console.log('💡 To enable local AI, make sure your cloudflare tunnel is running.');
});

export default localLLMService;
