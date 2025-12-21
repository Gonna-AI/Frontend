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
const LLM_URL = getCleanURL(import.meta.env.VITE_OLLAMA_URL || 'https://continually-placed-tire-sig.trycloudflare.com');

// Number of tokens to generate per response
const N_PREDICT = 1024; // Reduced for faster responses

// Timeout in milliseconds - reduced for better UX
const REQUEST_TIMEOUT = 120000; // 2 minutes instead of 5

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

    // FIRST: Check if the response is garbage (model confusion indicators)
    const garbageIndicators = [
      /Test instruction \d+/i,
      /User:\s*I am a robot/i,
      /^(?:User|Human|Assistant):\s*\n+(?:User|Human|Assistant):/m,
      /(?:User|Human):\s*[\s\S]*?(?:User|Human):\s*[\s\S]*?(?:User|Human):/i, // Multiple User: markers
    ];

    const isGarbage = garbageIndicators.some(pattern => pattern.test(text));
    if (isGarbage) {
      console.warn('⚠️ Detected garbage output from model, attempting to extract usable content');
      // Try to find ANY sentence that looks like a real response
      const sentences = text.match(/[A-Z][^.!?]*[.!?]/g) || [];
      const validSentence = sentences.find(s =>
        s.length > 30 &&
        !s.includes('Test instruction') &&
        !s.includes('I am a robot') &&
        !s.startsWith('User:') &&
        !s.startsWith('Human:')
      );
      if (validSentence) {
        return { reasoning: '', answer: validSentence.trim() };
      }
      // If no valid sentence found, return a fallback
      return {
        reasoning: '',
        answer: "I apologize, but I'm having trouble generating a proper response. Could you please rephrase your question?"
      };
    }

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
   * IMPORTANT: Be conservative to avoid stripping legitimate content
   */
  private cleanFinalAnswer(text: string): string {
    if (!text) return '';

    let cleaned = text;

    // Remove only specific template placeholders (be conservative)
    cleaned = cleaned
      .replace(/\[Write assistant's response here\]/gi, '')
      .replace(/\[Your response here\]/gi, '')
      .replace(/\[To be filled\]/gi, '');

    // Remove only known reasoning/thinking tags, NOT all XML-like content
    // This preserves legitimate content like <b>, numbers like <100, etc.
    const tagsToRemove = ['think', 'thinking', 'reasoning', 'thought', 'internal_monologue', 'answer', 'response', 'output', 'final'];
    for (const tag of tagsToRemove) {
      cleaned = cleaned.replace(new RegExp(`<${tag}>[\\s\\S]*?</${tag}>`, 'gi'), '');
      cleaned = cleaned.replace(new RegExp(`<${tag}>`, 'gi'), '');
      cleaned = cleaned.replace(new RegExp(`</${tag}>`, 'gi'), '');
    }

    // Remove "Response:", "Answer:", "Persona:", "System:" prefixes only at the very start
    // This prevents the model from echoing back system prompts
    cleaned = cleaned.replace(/^(?:Response|Answer|Output|Persona|System|Instructions?):\s*/i, '');

    // Remove any echoed persona content - patterns like "Persona: I'm working on..."
    // This catches cases where the model echoes the knowledge base persona
    cleaned = cleaned.replace(/\n*Persona:\s*[^\n]+(?:\n(?![A-Z][a-z]*:)[^\n]+)*/gi, '');

    // Remove any echoed system prompt patterns at the start of response
    // These patterns indicate the model is echoing training data or system prompts
    cleaned = cleaned.replace(/^(?:I am|I'm|You are|You're)\s+(?:a\s+)?(?:helpful\s+)?(?:AI|assistant|helper|bot)[^.]*\./i, '');

    // IMPORTANT: Remove garbage patterns that indicate model confusion

    // Training data markers like BEGININPUT, ENDINPUT, BEGINCONTEXT, etc.
    cleaned = cleaned.replace(/BEGININPUT\*?[\s\S]*?\*?ENDINPUT\*?/gi, '');
    cleaned = cleaned.replace(/BEGINCONTEXT[\s\S]*?ENDCONTEXT/gi, '');
    cleaned = cleaned.replace(/BEGININPUT\s*/gi, '');
    cleaned = cleaned.replace(/\s*ENDINPUT/gi, '');
    cleaned = cleaned.replace(/BEGINCONTEXT\s*/gi, '');
    cleaned = cleaned.replace(/\s*ENDCONTEXT/gi, '');

    // Remove special tokens that models use internally
    // Match patterns like <|assistant|>, 
    if (!cleaned && text.trim()) {
      console.warn('⚠️ cleanFinalAnswer stripped all content, using original text');
      // As a last resort, try to extract just the first sentence
      const firstSentence = text.match(/[^.!?]*[.!?]/);
      if (firstSentence && firstSentence[0].length > 20) {
        cleaned = firstSentence[0].trim();
      } else {
        cleaned = text.substring(0, 500).trim(); // Cap at 500 chars for safety
      }
    }

    return cleaned;
  }

  /**
   * Build system prompt for the AI
   * NOTE: Kept VERY simple for small models like Qwen3-0.6B
   */
  private buildSystemPrompt(config: KnowledgeBaseConfig, existingFields: ExtractedField[]): string {
    const extractedInfo = existingFields.length > 0
      ? existingFields.map(f => `${f.label}: ${f.value}`).join(', ')
      : '';

    // VERY simple prompt for small models
    let prompt = `You are a helpful AI assistant.`;

    // Only add persona if it looks like an AI character description, NOT a user message
    // Skip personas that look like user scenarios/requests
    if (config.persona && config.persona !== 'Professional, empathetic, and efficient AI assistant') {
      const lowerPersona = config.persona.toLowerCase();
      const looksLikeUserMessage =
        lowerPersona.includes("i'm working") ||
        lowerPersona.includes("i am working") ||
        lowerPersona.includes("can you") ||
        lowerPersona.includes("i need") ||
        lowerPersona.includes("i want") ||
        lowerPersona.includes("please help") ||
        lowerPersona.includes("help me") ||
        lowerPersona.startsWith("i'm ") ||
        lowerPersona.startsWith("i am ") ||
        lowerPersona.includes("my project");

      if (!looksLikeUserMessage) {
        prompt += ` ${config.persona}.`;
      } else {
        console.warn('⚠️ Persona looks like a user message, skipping to avoid confusion:', config.persona.substring(0, 50));
      }
    }

    if (extractedInfo) {
      prompt += ` Known info: ${extractedInfo}.`;
    }

    prompt += ` Respond helpfully and naturally.`;

    return prompt;
  }

  /**
   * Generate response using Local LLM service
   * Uses OpenAI-compatible /v1/chat/completions API with proper JSON structure
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

    // Build messages array in OpenAI chat format
    // Only include last 4 messages to keep context minimal for small models
    const recentHistory = conversationHistory.slice(-4);

    interface ChatMessage {
      role: 'system' | 'user' | 'assistant';
      content: string;
    }

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: systemPrompt
      }
    ];

    // Add conversation history
    for (const msg of recentHistory) {
      const role = msg.speaker === 'agent' ? 'assistant' : 'user';
      const cleanedText = msg.speaker === 'agent' ? this.cleanFinalAnswer(msg.text) : msg.text;
      if (cleanedText.trim() && cleanedText.length < 500) {
        messages.push({
          role: role as 'user' | 'assistant',
          content: cleanedText
        });
      }
    }

    // Add the current user message
    messages.push({
      role: 'user',
      content: userMessage
    });

    console.log('📝 Chat messages:', messages.length);
    console.log('📝 System prompt:', systemPrompt.substring(0, 100) + '...');
    console.log('📝 User message:', userMessage);

    try {
      // Use OpenAI-compatible chat completions endpoint
      const response = await fetch(`${LLM_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages,
          max_tokens: N_PREDICT,
          temperature: 0.7,
          stream: false
        }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        const errorMsg = errorData.error || `Local LLM error: ${response.status}`;
        console.error(`❌ Local LLM API error (${response.status}):`, errorMsg);
        throw new Error(`Local LLM error: ${response.status} - ${errorMsg}`);
      }

      const data = await response.json();

      // Extract response from OpenAI-compatible format
      // Response is in data.choices[0].message.content
      const rawResponse = data.choices?.[0]?.message?.content || data.content || '';

      console.log('📥 Raw response length:', rawResponse.length, 'chars');

      const { reasoning, answer } = this.parseReasoningResponse(rawResponse);

      console.log('🧠 Reasoning extracted:', reasoning ? `${reasoning.length} chars` : 'none');
      console.log('💬 Final answer:', answer ? `${answer.length} chars` : 'none');

      // Use answer if available, otherwise fall back to raw response
      const finalResponse = answer || rawResponse;

      // Debug: Log first 200 chars of the response
      console.log('📤 Sending response (first 200 chars):', finalResponse.substring(0, 200));

      if (!finalResponse || !finalResponse.trim()) {
        console.error('❌ Empty response after parsing!');
        console.error('   Raw response was:', rawResponse.substring(0, 500));
        throw new Error('Received empty response from LLM');
      }

      return {
        response: finalResponse,
        reasoning: reasoning || undefined,
        extractedFields: existingFields,
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
        signal: AbortSignal.timeout(REQUEST_TIMEOUT),
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
