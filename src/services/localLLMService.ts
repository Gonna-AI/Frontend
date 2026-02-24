/**
 * LLM Service for ClerkTree
 * 
 * Primary: Groq API (fast, powerful)
 * 
 * Key Features:
 * - Function calling for structured data extraction
 * - Seriousness/Priority assessment (critical, high, medium, low)
 * - Sentiment analysis and topic identification
 * - Caller information extraction
 * - Conversation summarization
 * 
 * Groq API: https://api.groq.com/openai/v1/chat/completions
 */

import {
  CallMessage,
  ExtractedField,
  CallCategory,
  PriorityLevel,
  KnowledgeBaseConfig
} from '../contexts/DemoCallContext';

import {
  ConversationAnalysis,
  generateFunctionCallingSystemPrompt,
  SeriousnessResult,
  IssueTopicsResult
} from './functionCallingTools';

// Import Groq settings for dynamic configuration
import { getGroqSettings, type GroqSettings } from '../components/DemoCall/GroqSettings';

// ============= GROQ API CONFIGURATION (PRIMARY) =============
// ============= GROQ API CONFIGURATION (PRIMARY) =============
// API calls routed via secure proxy
import { proxyJSON, ProxyRoutes } from './proxyClient';
import { ragService } from './ragService';

import log from '../utils/logger';



// Get current model and settings dynamically
function getCurrentGroqSettings(): GroqSettings {
  return getGroqSettings();
}

// Timeout in milliseconds
const REQUEST_TIMEOUT = 60000; // 1 minute for Groq

// Types
export interface LocalLLMResponse {
  response: string;
  reasoning?: string; // Extracted reasoning/thinking from the model (for display, not spoken)
  extractedFields?: ExtractedField[];
  suggestedCategory?: { id: string; name: string; confidence: number };
  suggestedPriority?: PriorityLevel;
  followUpRequired?: boolean;
  // Function calling results
  analysis?: ConversationAnalysis;
  toolCalls?: ToolCallResult[];
}

// Tool call result from the model
export interface ToolCallResult {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  result?: unknown;
}

// Sentiment card for UI display
export interface SentimentCard {
  id: string;
  type: 'sentiment' | 'urgency' | 'topic' | 'caller' | 'summary';
  title: string;
  value: string;
  icon: string;
  color: 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'gray';
  details?: string;
}

class GroqLLMService {
  private isAvailable: boolean | null = null;
  private groqAvailable: boolean | null = null;

  /**
   * Check if Groq API is available
   */
  private async checkGroqAvailability(): Promise<boolean> {
    try {
      const settings = getCurrentGroqSettings();
      log.debug('🔍 Checking Groq API availability via proxy...');
      log.debug(`   Model: ${settings.model}`);

      /* 
      // Test proxy connection with a simple hello
      const data = await proxyJSON<{choices: any[]}>(ProxyRoutes.COMPLETIONS, {
          model: settings.model,
          messages: [{ role: 'user', content: 'Hi' }],
          max_tokens: 10
      }, { timeout: 15000 });
      */

      // Simple check — for now assume always true if configured server-side
      this.groqAvailable = true;
      return true;

    } catch (e) {
      log.warn('⚠️ Groq API check failed:', e instanceof Error ? e.message : e);
      this.groqAvailable = false;
      return false;
    }
  }

  // NOTE: Local LLM check disabled - using Groq only for faster startup
  // Uncomment if you want to re-enable local Ollama fallback
  /*
  private async checkLocalAvailability(): Promise<boolean> {
    try {
      log.debug('🔍 Checking Local LLM availability...');
      log.debug(`   URL: ${LOCAL_LLM_URL}`);

      const testResponse = await fetch(`${LOCAL_LLM_URL}/api/generate`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          model: LOCAL_MODEL_NAME,
          prompt: 'ping',
          stream: false,
          thinking: false
        }),
        signal: AbortSignal.timeout(30000),
      });

      log.debug(`   Local Response Status: ${testResponse.status}`);

      if (testResponse.ok) {
        const testData = await testResponse.json();
        if (testData.response !== undefined) {
          log.debug(`✅ Local LLM available at ${LOCAL_LLM_URL}`);
          this.localAvailable = true;
          return true;
        }
      }

      this.localAvailable = false;
      return false;
    } catch (e) {
      log.warn('⚠️ Local LLM check failed:', e instanceof Error ? e.message : e);
      this.localAvailable = false;
      return false;
    }
  }
  */

  /**
   * Check availability - Groq only
   */
  async checkAvailability(): Promise<boolean> {
    const groqOk = await this.checkGroqAvailability();

    this.isAvailable = groqOk;

    if (groqOk) {
      log.debug('🚀 Using Groq API');
    } else {
      log.error('❌ Groq API not available! Check your VITE_GROQ_API_KEY');
    }

    return this.isAvailable;
  }

  /**
   * Initialize the service
   */
  async initialize(): Promise<boolean> {
    return await this.checkAvailability();
  }

  /**
   * Alias for checkAvailability to match component usage
   */
  async checkConnection(): Promise<boolean> {
    return await this.checkAvailability();
  }

  /**
   * Get current model name
   */
  getModel(): string {
    const settings = getCurrentGroqSettings();
    return settings.model;
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

    // Remove internal analysis/reasoning text that shouldn't be shown to users
    // Patterns like: *(Internally: ...), [Internal Analysis], (Internal:), etc.
    cleaned = cleaned.replace(/\*?\(Internally:[^)]*\)\*?/gi, '');
    cleaned = cleaned.replace(/\*?\[Internally:[^\]]*\]\*?/gi, '');
    cleaned = cleaned.replace(/\(Internal:[^)]*\)/gi, '');
    cleaned = cleaned.replace(/\[Internal Analysis[^\]]*\]/gi, '');
    cleaned = cleaned.replace(/\[Internal:[^\]]*\]/gi, '');
    cleaned = cleaned.replace(/\*\(.*?internal.*?\)\*/gi, '');
    cleaned = cleaned.replace(/\n*\*?\(Note to self:[^)]*\)\*?\n*/gi, '');
    cleaned = cleaned.replace(/\n*---\s*Internal[^-]*---\n*/gi, '');
    // Remove markdown italics containing "Internally" or "Internal"
    cleaned = cleaned.replace(/\*[^*]*(?:Internally|Internal)[^*]*\*/gi, '');
    // Remove parenthetical internal notes
    cleaned = cleaned.replace(/\n*\([^)]*(?:no name|no contact|need to|should ask|internally)[^)]*\)\n*/gi, '');

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
      log.warn('cleanFinalAnswer stripped all content, using original text');
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
    const now = new Date();

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

          // Helper to check if value is valid (not null, "null", empty)
          const isValid = (val: unknown): val is string =>
            val !== null && val !== 'null' && val !== '' && typeof val === 'string';

          // Add caller name if found and not already present
          if (isValid(ext.name) && !existingFields.find(f => f.id === 'name')) {
            newFields.push({
              id: 'name',
              label: 'Caller Name',
              value: ext.name,
              confidence: 0.95,
              extractedAt: now
            });
          }

          // Add email if found
          if (isValid(ext.email) && !existingFields.find(f => f.id === 'email')) {
            newFields.push({
              id: 'email',
              label: 'Email',
              value: ext.email,
              confidence: 0.95,
              extractedAt: now
            });
          }

          // Add phone if found
          if (isValid(ext.phone) && !existingFields.find(f => f.id === 'phone')) {
            newFields.push({
              id: 'phone',
              label: 'Phone',
              value: ext.phone,
              confidence: 0.95,
              extractedAt: now
            });
          }

          // Add company if found
          if (isValid(ext.company) && !existingFields.find(f => f.id === 'company')) {
            newFields.push({
              id: 'company',
              label: 'Company',
              value: ext.company,
              confidence: 0.9,
              extractedAt: now
            });
          }

          // Add appointment date if found
          if (isValid(ext.appointment_date) && !existingFields.find(f => f.id === 'appt_date')) {
            newFields.push({
              id: 'appt_date',
              label: 'Appointment Date',
              value: ext.appointment_date,
              confidence: 0.9,
              extractedAt: now
            });
          }

          // Add appointment time if found
          if (isValid(ext.appointment_time) && !existingFields.find(f => f.id === 'appt_time')) {
            newFields.push({
              id: 'appt_time',
              label: 'Appointment Time',
              value: ext.appointment_time,
              confidence: 0.9,
              extractedAt: now
            });
          }

          // Add purpose if found (legacy field)
          if (isValid(ext.purpose) && !existingFields.find(f => f.id === 'purpose')) {
            newFields.push({
              id: 'purpose',
              label: 'Call Purpose',
              value: ext.purpose,
              confidence: 0.85,
              extractedAt: now
            });
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

        log.debug('Extracted metadata from model:', {
          fields: newFields.length - existingFields.length,
          priority: suggestedPriority,
          category: suggestedCategory?.name
        });

      } catch (e) {
        log.warn('Failed to parse model JSON metadata:', e);
        // JSON parsing failed, just clean the response
        cleanResponse = response.replace(/```json\s*[\s\S]*?\s*```/gi, '').trim();
      }
    }

    return { cleanResponse, extractedFields: newFields, suggestedCategory, suggestedPriority };
  }

  /**
   * Generate response using Groq API
   * Enhanced with function calling system prompt
   */
  async generateResponse(
    userMessage: string,
    conversationHistory: CallMessage[],
    knowledgeBase: KnowledgeBaseConfig,
    existingFields: ExtractedField[]
  ): Promise<LocalLLMResponse> {
    // Auto-initialize if not yet done
    if (this.isAvailable === null) {
      log.debug('🔄 Auto-initializing LLM service...');
      await this.checkAvailability();
    }

    // Check if Groq is available
    if (!this.groqAvailable) {
      throw new Error('Groq API not available - check VITE_GROQ_API_KEY');
    }

    // Build the enhanced prompt string
    // Using function calling system prompt structure

    // 1. Enhanced System Prompt with function calling context
    const knownInfo = existingFields.length > 0
      ? existingFields.map(f => `${f.label}: ${f.value}`).join(', ')
      : '';

    const toolNames = [
      'extract_caller_info - Get caller name, contact, company',
      'assess_seriousness - Determine priority (critical/high/medium/low)',
      'analyze_sentiment - Detect caller emotion and mood',
      'identify_issue_topics - Categorize the main issue',
      'extract_appointment - Get date, time, and purpose for appointments'
    ];

    // Check what contact info we already have
    const hasPhone = existingFields.some(f => f.id === 'phone' || f.label.toLowerCase().includes('phone'));
    const hasEmail = existingFields.some(f => f.id === 'email' || f.label.toLowerCase().includes('email'));

    const systemPrompt = generateFunctionCallingSystemPrompt(
      knowledgeBase.persona || 'Professional AI Receptionist',
      knownInfo,
      toolNames,
      { hasPhone, hasEmail } // Pass contact info status
    );

    let ragContext = '';
    if (knowledgeBase.id) {
      log.debug(`🔍 Fetching RAG context for KB ID ${knowledgeBase.id}...`);
      const contextDocs = await ragService.searchRelevantContext(userMessage, knowledgeBase.id, 3);
      if (contextDocs && contextDocs.length > 0) {
        ragContext = `\n\n=== RELEVANT KNOWLEDGE BASE CONTEXT ===\n${contextDocs.join('\n\n')}\n=======================================\nUse the above information to help answer the user.`;
      }
    }

    let prompt = `System: ${systemPrompt}${ragContext}\n\n`;

    // 2. Conversation History (last 8 messages for better context)
    const recentHistory = conversationHistory.slice(-8);
    for (const msg of recentHistory) {
      const role = msg.speaker === 'agent' ? 'Assistant' : 'User';
      // Clean previous agent messages to avoid feeding back garbage
      const content = msg.speaker === 'agent' ? this.cleanFinalAnswer(msg.text) : msg.text;
      if (content.trim() && content.length < 500) { // Limit length to avoid context stuffing
        prompt += `${role}: ${content}\n`;
      }
    }

    // 3. Current User Message with inline extraction instructions
    prompt += `User: ${userMessage}\n`;
    prompt += `\nRespond naturally to the caller, then AFTER your response, add a JSON block with any new information extracted.

Format your response EXACTLY like this:
[Your natural response to the caller here]

\`\`\`json
{"extracted": {"name": "caller name or null", "email": "email or null", "phone": "phone or null", "company": "company or null", "appointment_date": "date or null", "appointment_time": "time or null", "appointment_purpose": "purpose or null"}, "priority": "low|medium|high|critical", "category": "inquiry|support|complaint|appointment|other"}
\`\`\`

Rules:
- Your spoken response comes FIRST (no internal notes!)
- The JSON block comes AFTER, separated by a blank line
- Only include fields that were mentioned in THIS message
- Use null for fields not mentioned
`;
    prompt += `Assistant:`;

    // Build messages array for Groq API (OpenAI format)
    const groqMessages = [
      { role: 'system' as const, content: systemPrompt + ragContext },
      ...recentHistory.map(msg => ({
        role: msg.speaker === 'agent' ? 'assistant' as const : 'user' as const,
        content: msg.speaker === 'agent' ? this.cleanFinalAnswer(msg.text) : msg.text
      })),
      { role: 'user' as const, content: `${userMessage}\n\nRespond naturally to the caller, then AFTER your response, add a JSON block with extracted information.\n\nFormat:\n[Your response]\n\n\`\`\`json\n{"extracted": {"name": "caller name or null", "email": "email or null", "phone": "phone or null", "company": "company or null"}, "priority": "low|medium|high|critical", "category": "inquiry|support|complaint|appointment|other"}\n\`\`\`` }
    ];

    // Helper function for Groq API request
    const makeGroqRequest = async (): Promise<string | null> => {
      if (!this.groqAvailable) return null;

      const settings = getCurrentGroqSettings();
      try {
        log.debug(`🚀 Calling Groq API via proxy (model: ${settings.model}, temp: ${settings.temperature})...`);

        interface GroqResponse {
          choices?: Array<{
            message?: {
              content?: string;
            };
          }>;
        }

        const data = await proxyJSON<GroqResponse>(ProxyRoutes.COMPLETIONS, {
          model: settings.model,
          messages: groqMessages,
          temperature: settings.temperature,
          max_tokens: settings.maxTokens,
          top_p: settings.topP,
        }, { timeout: REQUEST_TIMEOUT });

        const content = data.choices?.[0]?.message?.content;
        if (content) {
          log.debug('✅ Groq response received via proxy');
          return content;
        }
        return null;
      } catch (error) {
        log.warn('⚠️ Groq request failed:', error instanceof Error ? error.message : error);
        return null;
      }
    };

    try {
      // Use Groq only (no local fallback for faster responses)
      const rawResponse = await makeGroqRequest();

      if (!rawResponse) {
        throw new Error('Groq API failed - check your API key');
      }

      log.debug('📝 Raw response length:', rawResponse.length, 'chars');

      // Parse reasoning/thinking if present
      const { reasoning, answer } = this.parseReasoningResponse(rawResponse);

      log.debug(' Reasoning extracted:', reasoning ? `${reasoning.length} chars` : 'none');
      log.debug(' Final answer:', answer ? `${answer.length} chars` : 'none');

      // Use answer if available, otherwise fall back to raw response
      const finalResponse = answer || rawResponse;

      if (!finalResponse || !finalResponse.trim()) {
        log.error(' Empty response after parsing!');
        log.error('   Raw response was:', rawResponse.substring(0, 500));
        // Instead of throwing, return a helpful message
        return {
          response: "I apologize, I'm still warming up. Could you please repeat that?",
          extractedFields: []
        };
      }

      // Parse any metadata if the model outputted JSON
      const extracted = this.parseExtractedMetadata(finalResponse, knowledgeBase, existingFields);

      // Return response IMMEDIATELY - don't wait for AI analysis
      // The analysis was causing delays and double API calls
      // The main response already contains extracted data from parseExtractedMetadata
      return {
        response: extracted.cleanResponse,
        reasoning: reasoning || undefined,
        extractedFields: extracted.extractedFields,
        suggestedCategory: extracted.suggestedCategory,
        suggestedPriority: extracted.suggestedPriority,
      };

    } catch (error) {
      log.error('Local LLM error:', error);
      throw error;
    }
  }


  /**
   * Generate comprehensive call summary using function calling approach
   * Based on Groq API function calling pattern for structured data extraction
   */
  async summarizeCall(
    messages: CallMessage[],
    extractedFields: ExtractedField[],
    _category?: CallCategory,
    _priority?: PriorityLevel
  ): Promise<{
    summary: string;
    mainPoints: string[];
    sentiment: string; // Now supports 10 sentiment types
    followUpRequired: boolean;
    notes: string;
    callerName?: string;
    // Enhanced summary fields
    suggestions?: string[];
    callerIntent?: string;
    urgency?: string;
    moodIndicators?: string[];
    topics?: string[];
    resolution?: string;
    riskLevel?: string;
    estimatedPriority?: string;
    // Enhanced function calling results
    analysis?: ConversationAnalysis;
    sentimentCards?: SentimentCard[];
    seriousnessLevel?: SeriousnessResult;
    issueTopics?: IssueTopicsResult;
  }> {
    // Auto-initialize if not yet done
    if (this.isAvailable === null) {
      log.debug('🔄 Auto-initializing LLM service for summary...');
      await this.checkAvailability();
    }

    // Check if Groq is available
    if (!this.groqAvailable) {
      throw new Error('Groq API not available for summary');
    }

    // Quick timeout for fast notes generation (30 seconds)
    const SUMMARY_TIMEOUT = 30000;

    // Format transcript concisely - limit to last 8 messages for faster processing
    const recentMessages = messages.slice(-8);
    const transcript = recentMessages.map(m =>
      `${m.speaker === 'agent' ? 'AI' : 'Caller'}: ${m.text.slice(0, 150)}`
    ).join('\n');

    const extractedText = extractedFields.map(f => `${f.label}: ${f.value}`).join(', ');

    // Try to find caller name from extracted fields first
    let callerName = extractedFields.find(f => f.id === 'name')?.value;

    // If no name in fields, try to extract from messages
    if (!callerName) {
      for (const msg of messages) {
        if (msg.speaker === 'user') {
          // Look for name patterns - enhanced for all cultures
          const patterns = [
            /(?:my name is|i'?m|this is|i am)\s+([A-Za-z][A-Za-z]+(?:\s+[A-Za-z][A-Za-z]+)?)/i,
            /^([A-Za-z][A-Za-z]+(?:\s+[A-Za-z][A-Za-z]+)?)\s+(?:here|calling|speaking)/i,
            /(?:im|its|it's)\s+([A-Za-z][A-Za-z]+(?:\s+[A-Za-z][A-Za-z]+)?)/i,
          ];
          for (const pattern of patterns) {
            const match = msg.text.match(pattern);
            if (match?.[1] && match[1].length > 2) {
              const name = match[1].trim();
              const commonWords = ['hello', 'hi', 'hey', 'yes', 'no', 'okay', 'sure', 'thanks', 'thank', 'you', 'the', 'help', 'need', 'want', 'thing', 'calling', 'good', 'fine', 'here'];
              if (!commonWords.includes(name.toLowerCase())) {
                callerName = name;
                break;
              }
            }
          }
          if (callerName) break;
        }
      }
    }

    // Enhanced prompt for detailed summary with comprehensive analysis
    const prompt = `Analyze this call transcript thoroughly and provide a comprehensive summary.

TRANSCRIPT:
${transcript}

${callerName ? `Caller: ${callerName}` : ''}${extractedText ? `\nExtracted Info: ${extractedText}` : ''}

Generate a detailed JSON response with:
1. "summary": A 2-3 sentence overview of what happened in the call
2. "keyPoints": 4-6 specific, detailed bullet points about the call
3. "callerIntent": What the caller wanted (1 sentence)
4. "sentiment": Choose the most accurate:
   - "very_positive" (enthusiastic, grateful, delighted)
   - "positive" (satisfied, pleased, happy)
   - "slightly_positive" (content, agreeable)
   - "neutral" (informational, no strong emotion)
   - "mixed" (alternating emotions, confused)
   - "slightly_negative" (mildly frustrated, impatient)
   - "negative" (upset, disappointed, annoyed)
   - "very_negative" (angry, furious, distressed)
   - "anxious" (worried, concerned, nervous)
   - "urgent" (panicked, emergency tone)
5. "moodIndicators": Array of 2-4 emotions detected (e.g., ["concerned", "hopeful", "frustrated"])
6. "urgency": "none" | "low" | "medium" | "high" | "critical" | "emergency"
7. "topics": Array of 2-5 topics discussed (e.g., ["billing inquiry", "appointment scheduling", "complaint"])
8. "suggestions": 2-3 actionable items for the admin
9. "resolution": "resolved" | "partially_resolved" | "unresolved" | "requires_callback" | "escalation_needed"
10. "riskLevel": "none" | "low" | "medium" | "high" (potential for escalation or complaint)
11. "followUp": true/false - does this need follow-up action?
12. "estimatedPriority": "low" | "medium" | "high" | "critical"

Respond ONLY with valid JSON:
{"summary": "...", "keyPoints": ["...", "..."], "callerIntent": "...", "sentiment": "...", "moodIndicators": ["...", "..."], "urgency": "...", "topics": ["...", "..."], "suggestions": ["...", "..."], "resolution": "...", "riskLevel": "...", "followUp": true/false, "estimatedPriority": "..."}`;

    try {
      log.debug('📝 Generating summary...');

      let rawResponse = '';

      // Try Groq first for faster summary (it's much faster)
      if (this.groqAvailable) {
        const settings = getCurrentGroqSettings();
        try {
          log.debug(`🚀 Using Groq for summary (model: ${settings.model})...`);
          const groqResponse = await proxyJSON<GroqResponse>(ProxyRoutes.COMPLETIONS, {
            model: settings.model,
            messages: [
              { role: 'system', content: 'You are a call summarization assistant. Always respond with valid JSON containing summary, keyPoints, sentiment, suggestions, etc.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.4,
            max_tokens: 1024,
          }, { timeout: SUMMARY_TIMEOUT });

          if (groqResponse) {
            rawResponse = groqResponse.choices?.[0]?.message?.content || '';
            log.debug('✅ Groq summary received, length:', rawResponse.length);

            // Log if response is empty
            if (!rawResponse) {
              log.warn('⚠️ Groq returned empty content. Full response:', JSON.stringify(groqResponse).slice(0, 500));
            }
          } else {
            log.error('❌ Groq summary request failed');
          }
        } catch (e) {
          log.warn('⚠️ Groq summary failed:', e);
          throw new Error('Groq summary failed');
        }
      } else {
        throw new Error('Groq not available for summary');
      }

      // Handle empty response with a simple fallback
      if (!rawResponse) {
        log.debug('⚠️ Empty response, generating simple summary...');
        // Create a simple fallback summary
        const fallbackSummary = {
          summary: `Call with ${callerName || 'Unknown Caller'}. ${extractedText || 'No additional details extracted.'}`,
          keyPoints: ['Call completed', extractedText || 'No details provided'].filter(Boolean),
          callerIntent: 'General inquiry',
          sentiment: 'neutral',
          moodIndicators: [],
          urgency: 'low',
          topics: [],
          suggestions: ['Review call recording if available'],
          resolution: 'unresolved',
          riskLevel: 'low',
          followUp: false,
          estimatedPriority: 'low'
        };
        rawResponse = JSON.stringify(fallbackSummary);
      }

      log.debug('📝 Summary raw response:', rawResponse.slice(0, 200));

      // Attempt to parse enhanced JSON response
      let parsedSummary: Record<string, unknown> | null = null;
      try {
        const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedSummary = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        log.debug('Could not parse summary as JSON, using text fallback:', e);
      }

      if (parsedSummary) {
        // Enhanced format: detailed summary with suggestions
        const summaryText = (parsedSummary.summary as string) || '';

        // Try multiple possible field names for key points
        let keyPoints: string[] = [];
        if (Array.isArray(parsedSummary.keyPoints) && parsedSummary.keyPoints.length > 0) {
          keyPoints = parsedSummary.keyPoints as string[];
        } else if (Array.isArray(parsedSummary.key_points) && parsedSummary.key_points.length > 0) {
          keyPoints = parsedSummary.key_points as string[];
        } else if (Array.isArray(parsedSummary.notes) && parsedSummary.notes.length > 0) {
          keyPoints = parsedSummary.notes as string[];
        } else if (summaryText) {
          // If no keyPoints but we have summary, split summary into points
          keyPoints = [summaryText];
        }

        log.debug('📋 Parsed summary fields:', {
          summaryText: summaryText.slice(0, 50),
          keyPointsCount: keyPoints.length,
          hasCallerIntent: !!parsedSummary.callerIntent,
          hasSuggestions: Array.isArray(parsedSummary.suggestions)
        });

        const callerIntent = (parsedSummary.callerIntent as string) || (parsedSummary.caller_intent as string) || '';
        const suggestions = Array.isArray(parsedSummary.suggestions)
          ? parsedSummary.suggestions as string[]
          : [];
        const moodIndicators = Array.isArray(parsedSummary.moodIndicators)
          ? parsedSummary.moodIndicators as string[]
          : [];
        const topics = Array.isArray(parsedSummary.topics)
          ? parsedSummary.topics as string[]
          : [];
        const resolution = (parsedSummary.resolution as string) || 'unresolved';
        const riskLevel = (parsedSummary.riskLevel as string) || 'low';
        const estimatedPriority = (parsedSummary.estimatedPriority as string) || 'medium';

        // Support all 10 sentiment types
        const validSentiments = [
          'very_positive', 'positive', 'slightly_positive', 'neutral', 'mixed',
          'slightly_negative', 'negative', 'very_negative', 'anxious', 'urgent'
        ];
        const sentiment = validSentiments.includes(parsedSummary.sentiment as string)
          ? (parsedSummary.sentiment as string)
          : 'neutral';

        const urgency = ['none', 'low', 'medium', 'high', 'critical', 'emergency'].includes(parsedSummary.urgency as string)
          ? (parsedSummary.urgency as string)
          : 'medium';
        const followUp = parsedSummary.followUp === true || parsedSummary.followUpRequired === true;

        log.debug('✅ Comprehensive summary generated:', {
          keyPoints: keyPoints.length,
          suggestions: suggestions.length,
          moodIndicators: moodIndicators.length,
          topics: topics.length,
          sentiment,
          urgency,
          resolution
        });

        // Build detailed notes string with all info
        const notesArray = [
          summaryText ? `📋 ${summaryText}` : '',
          callerIntent ? `🎯 Intent: ${callerIntent}` : '',
          keyPoints.length > 0 ? `\n📌 Key Points:\n• ${keyPoints.join('\n• ')}` : '',
          topics.length > 0 ? `\n🏷️ Topics: ${topics.join(', ')}` : '',
          moodIndicators.length > 0 ? `\n😊 Mood: ${moodIndicators.join(', ')}` : '',
          suggestions.length > 0 ? `\n💡 Suggestions:\n• ${suggestions.join('\n• ')}` : '',
          `\n📊 Status: ${resolution.replace('_', ' ')} | Risk: ${riskLevel}`,
          urgency !== 'none' && urgency !== 'low' ? `\n⚠️ Urgency: ${urgency.toUpperCase()}` : ''
        ].filter(Boolean).join('\n');

        return {
          summary: summaryText || keyPoints.join(' • ') || 'Call completed',
          mainPoints: keyPoints.length > 0 ? keyPoints : ['Call completed'],
          sentiment,
          followUpRequired: followUp,
          notes: notesArray || 'Call completed',
          callerName: callerName,
          // Enhanced fields
          suggestions: suggestions,
          callerIntent: callerIntent,
          urgency: urgency,
          moodIndicators: moodIndicators,
          topics: topics,
          resolution: resolution,
          riskLevel: riskLevel,
          estimatedPriority: estimatedPriority,
        };
      }

      // Fallback: extract summary from text
      const summary = rawResponse.split('.')[0] || rawResponse.slice(0, 200) || 'Call completed';

      return {
        summary: summary,
        mainPoints: [summary],
        sentiment: 'neutral',
        followUpRequired: false,
        notes: rawResponse,
        callerName: callerName
      };

    } catch (error) {
      log.error('Local LLM summary error:', error);

      // Return a basic summary on error instead of throwing
      // This ensures the call still saves with at least basic info
      const basicSummary = messages.length > 0
        ? `Conversation with ${messages.filter(m => m.speaker === 'user').length} user messages`
        : 'Call completed';

      return {
        summary: basicSummary,
        mainPoints: [basicSummary],
        sentiment: 'neutral',
        followUpRequired: false,
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
    return GROQ_API_URL;
  }
}


// Export singleton (keeping name for backwards compatibility)
export const localLLMService = new GroqLLMService();

// Initialize on import
localLLMService.initialize();

// Re-export function calling types for use in other components
export type { ConversationAnalysis, SeriousnessResult, IssueTopicsResult } from './functionCallingTools';
export { conversationTools, mapToExtractedFields, generateFunctionCallingSystemPrompt } from './functionCallingTools';

export default localLLMService;
