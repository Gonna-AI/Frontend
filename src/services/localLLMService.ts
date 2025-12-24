/**
 * Local LLM Service for ClerkTree
 * 
 * Provides AI using Ollama via Cloudflare tunnel with Mistral-style Function Calling
 * Reference: https://docs.mistral.ai/capabilities/function_calling
 * 
 * Key Features:
 * - Function calling for structured data extraction
 * - Seriousness/Priority assessment (critical, high, medium, low)
 * - Sentiment analysis and topic identification
 * - Caller information extraction
 * - Conversation summarization
 * 
 * Default: https://consumption-monetary-thrown-manufacture.trycloudflare.com
 * Override with VITE_OLLAMA_URL in .env if needed
 * 
 * Uses /api/generate and /api/chat endpoints
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
   * Enhanced with Mistral-style function calling system prompt
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

    // Build the enhanced prompt string for /api/generate
    // Using Mistral-style function calling system prompt structure

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

    let prompt = `System: ${systemPrompt}\n\n`;

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

    // Helper function to make the API request with retry logic
    const makeRequest = async (retryCount = 0): Promise<string> => {
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
          signal: AbortSignal.timeout(retryCount === 0 ? REQUEST_TIMEOUT : 60000), // Shorter timeout on retry
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          const errorMsg = errorData.error || `Local LLM error: ${response.status}`;
          console.error(` Local LLM API error (${response.status}):`, errorMsg);
          throw new Error(`Local LLM error: ${response.status} - ${errorMsg}`);
        }

        const data = await response.json();
        return data.response || '';
      } catch (error) {
        // Retry once if first request fails (cold start issue)
        if (retryCount === 0) {
          console.warn('First request failed, retrying...', error);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
          return makeRequest(1);
        }
        throw error;
      }
    };

    try {
      const rawResponse = await makeRequest();

      console.log('📝 Raw response length:', rawResponse.length, 'chars');

      // Parse reasoning/thinking if present
      const { reasoning, answer } = this.parseReasoningResponse(rawResponse);

      console.log(' Reasoning extracted:', reasoning ? `${reasoning.length} chars` : 'none');
      console.log(' Final answer:', answer ? `${answer.length} chars` : 'none');

      // Use answer if available, otherwise fall back to raw response
      const finalResponse = answer || rawResponse;

      if (!finalResponse || !finalResponse.trim()) {
        console.error(' Empty response after parsing!');
        console.error('   Raw response was:', rawResponse.substring(0, 500));
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
      console.error('Local LLM error:', error);
      throw error;
    }
  }

  /**
   * Extract analysis from the conversation using AI model
   * PURE AI/ML APPROACH - No hardcoded patterns
   * Makes a focused API call to extract structured data from the message
   */
  private async extractAIAnalysis(
    userMessage: string,
    existingFields: ExtractedField[]
  ): Promise<{
    fields: ExtractedField[];
    priority?: PriorityLevel;
    category?: { id: string; name: string; confidence: number };
    analysis?: ConversationAnalysis;
  }> {
    const fields: ExtractedField[] = [];
    const now = new Date();

    // Build context of what we already know
    const knownFields = existingFields.map(f => `${f.label}: ${f.value}`).join(', ');

    // AI-powered extraction prompt - model does ALL the work
    const analysisPrompt = `Analyze this caller message and extract structured information. Respond with ONLY valid JSON.

MESSAGE: "${userMessage}"
${knownFields ? `\nALREADY KNOWN: ${knownFields}` : ''}

Extract and return JSON (use null if not detected):
{
  "caller_name": "extracted full name or null",
  "phone": "phone number or null", 
  "email": "email address or null",
  "company": "company/organization name or null",
  "reference_number": "any reference/case/account number or null",
  "alternative_contact": "any other contact method mentioned (WhatsApp, callback time, etc) or null",
  "priority": "critical|high|medium|low",
  "priority_reasoning": "why this priority level",
  "sentiment": "positive|neutral|negative",
  "emotion": "happy|satisfied|neutral|confused|frustrated|angry|anxious|sad|relieved",
  "emotion_intensity": "mild|moderate|strong",
  "category": "inquiry|support|complaint|appointment|feedback|sales|billing|technical|other",
  "topic": "main topic of the message",
  "escalation_needed": "yes|no|maybe",
  "time_sensitivity": "immediate|today|this_week|no_rush",
  "is_appointment_request": true|false,
  "appointment_date": "YYYY-MM-DD format or null",
  "appointment_time": "HH:MM format (24h) or null",
  "appointment_purpose": "what the appointment is for or null"
}`;

    try {
      console.log('🤖 Running AI-based message analysis...');

      const response = await fetch(`${LLM_URL}/api/generate`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          model: MODEL_NAME,
          prompt: analysisPrompt,
          stream: false,
          thinking: false
        }),
        signal: AbortSignal.timeout(30000), // 30 second timeout for quick analysis
      });

      if (!response.ok) {
        console.warn('AI analysis request failed, returning empty analysis');
        return { fields };
      }

      const data = await response.json();
      const rawResponse = data.response || '';

      // Parse JSON from response
      let parsed: Record<string, unknown> | null = null;
      try {
        const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.warn('Failed to parse AI analysis JSON:', e);
        return { fields };
      }

      if (!parsed) {
        return { fields };
      }

      console.log('✅ AI analysis extracted:', {
        name: parsed.caller_name,
        priority: parsed.priority,
        emotion: parsed.emotion,
        category: parsed.category
      });

      // Extract fields from AI response (only if not already known)
      if (parsed.caller_name && typeof parsed.caller_name === 'string' && parsed.caller_name !== 'null' && !existingFields.find(f => f.id === 'name')) {
        fields.push({
          id: 'name',
          label: 'Caller Name',
          value: parsed.caller_name,
          confidence: 0.9,
          extractedAt: now
        });
      }

      if (parsed.phone && typeof parsed.phone === 'string' && parsed.phone !== 'null' && !existingFields.find(f => f.id === 'phone')) {
        fields.push({
          id: 'phone',
          label: 'Phone Number',
          value: parsed.phone,
          confidence: 0.95,
          extractedAt: now
        });
      }

      if (parsed.email && typeof parsed.email === 'string' && parsed.email !== 'null' && !existingFields.find(f => f.id === 'email')) {
        fields.push({
          id: 'email',
          label: 'Email',
          value: parsed.email,
          confidence: 0.95,
          extractedAt: now
        });
      }

      if (parsed.company && typeof parsed.company === 'string' && parsed.company !== 'null' && !existingFields.find(f => f.id === 'company')) {
        fields.push({
          id: 'company',
          label: 'Company/Organization',
          value: parsed.company,
          confidence: 0.85,
          extractedAt: now
        });
      }

      if (parsed.reference_number && typeof parsed.reference_number === 'string' && parsed.reference_number !== 'null' && !existingFields.find(f => f.id === 'reference')) {
        fields.push({
          id: 'reference',
          label: 'Reference Number',
          value: parsed.reference_number,
          confidence: 0.95,
          extractedAt: now
        });
      }

      // Extract alternative contact method (WhatsApp, callback time, etc.)
      if (parsed.alternative_contact && typeof parsed.alternative_contact === 'string' && parsed.alternative_contact !== 'null' && !existingFields.find(f => f.id === 'alt_contact')) {
        fields.push({
          id: 'alt_contact',
          label: 'Alternative Contact',
          value: parsed.alternative_contact,
          confidence: 0.85,
          extractedAt: now
        });
      }

      // Extract appointment details
      if (parsed.is_appointment_request === true) {
        if (parsed.appointment_date && typeof parsed.appointment_date === 'string' && parsed.appointment_date !== 'null') {
          fields.push({
            id: 'appt_date',
            label: 'Appointment Date',
            value: parsed.appointment_date,
            confidence: 0.9,
            extractedAt: now
          });
        }
        if (parsed.appointment_time && typeof parsed.appointment_time === 'string' && parsed.appointment_time !== 'null') {
          fields.push({
            id: 'appt_time',
            label: 'Appointment Time',
            value: parsed.appointment_time,
            confidence: 0.9,
            extractedAt: now
          });
        }
        if (parsed.appointment_purpose && typeof parsed.appointment_purpose === 'string' && parsed.appointment_purpose !== 'null') {
          fields.push({
            id: 'appt_purpose',
            label: 'Appointment Purpose',
            value: parsed.appointment_purpose,
            confidence: 0.85,
            extractedAt: now
          });
        }
      }

      // Extract priority (AI-determined)
      const priority = ['critical', 'high', 'medium', 'low'].includes(parsed.priority as string)
        ? (parsed.priority as PriorityLevel)
        : undefined;

      // Extract category (AI-determined)
      const validCategories = ['inquiry', 'support', 'complaint', 'appointment', 'feedback', 'sales', 'billing', 'technical', 'other'];
      const category = validCategories.includes(parsed.category as string)
        ? {
          id: parsed.category as string,
          name: (parsed.category as string).charAt(0).toUpperCase() + (parsed.category as string).slice(1),
          confidence: 0.85
        }
        : undefined;

      // Build analysis object from AI response
      const analysis: ConversationAnalysis = {
        seriousness: priority ? {
          priority_level: priority,
          urgency_indicators: [],
          reasoning: (parsed.priority_reasoning as string) || 'AI-determined priority',
          escalation_needed: (parsed.escalation_needed as 'yes' | 'no' | 'maybe') || 'no',
          time_sensitivity: (parsed.time_sensitivity as 'immediate' | 'today' | 'this_week' | 'no_rush') || 'this_week'
        } : undefined,
        sentiment: parsed.sentiment ? {
          overall_sentiment: (parsed.sentiment as 'positive' | 'neutral' | 'negative') || 'neutral',
          caller_emotion: (parsed.emotion as any) || 'neutral',
          emotion_intensity: (parsed.emotion_intensity as 'mild' | 'moderate' | 'strong') || 'moderate'
        } : undefined,
        issueTopics: parsed.topic ? {
          primary_topic: parsed.topic as string,
          issue_category: (parsed.category as string) || 'inquiry',
          issue_description: parsed.topic as string
        } : undefined,
        // Add appointment details if this is an appointment request
        appointment: parsed.is_appointment_request === true ? {
          requested: true,
          date: parsed.appointment_date as string || undefined,
          time: parsed.appointment_time as string || undefined,
          purpose: parsed.appointment_purpose as string || undefined,
          confirmed: false
        } : undefined,
        // Add contact status
        contactStatus: {
          has_phone: !!(parsed.phone && parsed.phone !== 'null') || existingFields.some(f => f.id === 'phone'),
          has_email: !!(parsed.email && parsed.email !== 'null') || existingFields.some(f => f.id === 'email'),
          has_any_contact: !!(parsed.phone || parsed.email || parsed.alternative_contact) ||
            existingFields.some(f => ['phone', 'email', 'alt_contact'].includes(f.id)),
          needs_followup_contact: !(parsed.phone || parsed.email || parsed.alternative_contact) &&
            !existingFields.some(f => ['phone', 'email', 'alt_contact'].includes(f.id)),
          alternative_contact: parsed.alternative_contact as string || undefined
        }
      };

      return { fields, priority, category, analysis };

    } catch (error) {
      console.error('AI analysis error:', error);
      // Return empty on error - don't block the main response
      return { fields };
    }
  }

  /**
   * Generate comprehensive call summary using function calling approach
   * Based on Mistral AI function calling pattern for structured data extraction
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
    // Enhanced function calling results
    analysis?: ConversationAnalysis;
    sentimentCards?: SentimentCard[];
    seriousnessLevel?: SeriousnessResult;
    issueTopics?: IssueTopicsResult;
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

    // Enhanced function calling prompt for comprehensive analysis
    const prompt = `System: You are an expert AI analyst specializing in call analysis. Analyze this conversation transcript and extract comprehensive structured information.

## CONVERSATION TRANSCRIPT
${transcript}

## KNOWN INFORMATION
${callerName ? `Caller Name: ${callerName}` : 'Caller name: Unknown'}
${extractedText ? `Extracted Info: ${extractedText}` : ''}
${category ? `Category: ${category.name}` : ''}
${priority ? `Initial Priority: ${priority}` : ''}

## ANALYSIS INSTRUCTIONS
Provide a comprehensive analysis in JSON format. Include:
1. SERIOUSNESS: Assess urgency level (critical/high/medium/low) based on keywords, tone, and context
2. SENTIMENT: Analyze caller emotion and overall sentiment
3. TOPICS: Identify main issues and categories discussed
4. SUMMARY: Create a concise summary with key points

Respond with ONLY valid JSON:
{
  "summary": "Brief 1-2 sentence summary",
  "mainPoints": ["key point 1", "key point 2", "key point 3"],
  "outcome": "resolved|unresolved|needs_followup|escalated",
  "seriousness": {
    "priority_level": "critical|high|medium|low",
    "reasoning": "Why this priority",
    "escalation_needed": "yes|no|maybe",
    "time_sensitivity": "immediate|today|this_week|no_rush"
  },
  "sentiment": "positive|neutral|negative",
  "caller_emotion": "happy|satisfied|neutral|confused|frustrated|angry|anxious|sad|relieved",
  "emotion_intensity": "mild|moderate|strong",
  "primary_topic": "Main topic discussed",
  "issue_category": "inquiry|support|complaint|appointment|feedback|sales|billing|technical|other",
  "resolution_status": "resolved|partially_resolved|unresolved|needs_followup",
  "keywords": ["keyword1", "keyword2"],
  "action_items": ["action 1", "action 2"],
  "followUpRequired": true,
  "follow_up_notes": "What follow-up is needed",
  "notes": "Additional observations"
}

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

      // Attempt to parse enhanced JSON response
      let parsedSummary: Record<string, unknown> | null = null;
      try {
        const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedSummary = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.log('Could not parse summary as JSON, using text fallback:', e);
      }

      if (parsedSummary) {
        // Extract seriousness analysis
        let seriousnessLevel: SeriousnessResult | undefined;
        if (parsedSummary.seriousness && typeof parsedSummary.seriousness === 'object') {
          const s = parsedSummary.seriousness as Record<string, unknown>;
          seriousnessLevel = {
            priority_level: (s.priority_level as PriorityLevel) || priority || 'medium',
            urgency_indicators: [],
            reasoning: (s.reasoning as string) || '',
            escalation_needed: (s.escalation_needed as 'yes' | 'no' | 'maybe') || 'no',
            time_sensitivity: (s.time_sensitivity as 'immediate' | 'today' | 'this_week' | 'no_rush') || 'this_week'
          };
        }

        // Extract issue topics
        let issueTopics: IssueTopicsResult | undefined;
        if (parsedSummary.primary_topic || parsedSummary.issue_category) {
          issueTopics = {
            primary_topic: (parsedSummary.primary_topic as string) || 'General inquiry',
            issue_category: (parsedSummary.issue_category as string) || 'inquiry',
            issue_description: (parsedSummary.summary as string) || '',
            resolution_status: (parsedSummary.resolution_status as 'resolved' | 'partially_resolved' | 'unresolved' | 'needs_followup') || 'unresolved',
            keywords: (parsedSummary.keywords as string[]) || []
          };
        }

        // Build sentiment cards for UI display
        const sentimentCards: SentimentCard[] = [];

        // Seriousness card
        if (seriousnessLevel) {
          const priorityColors: Record<string, 'red' | 'orange' | 'yellow' | 'green'> = {
            critical: 'red',
            high: 'orange',
            medium: 'yellow',
            low: 'green'
          };
          sentimentCards.push({
            id: 'seriousness',
            type: 'urgency',
            title: 'Priority Level',
            value: seriousnessLevel.priority_level.toUpperCase(),
            icon: '🚨',
            color: priorityColors[seriousnessLevel.priority_level] || 'gray',
            details: seriousnessLevel.reasoning
          });
        }

        // Sentiment card
        if (parsedSummary.sentiment || parsedSummary.caller_emotion) {
          const sentimentColors: Record<string, 'green' | 'gray' | 'red' | 'blue'> = {
            positive: 'green',
            neutral: 'gray',
            negative: 'red',
            mixed: 'blue'
          };
          const emotionIcons: Record<string, string> = {
            happy: '😊',
            satisfied: '😌',
            neutral: '😐',
            confused: '😕',
            frustrated: '😤',
            angry: '😠',
            anxious: '😰',
            sad: '😢',
            relieved: '😅'
          };
          sentimentCards.push({
            id: 'sentiment',
            type: 'sentiment',
            title: 'Caller Sentiment',
            value: (parsedSummary.caller_emotion as string) || (parsedSummary.sentiment as string) || 'neutral',
            icon: emotionIcons[(parsedSummary.caller_emotion as string)] || '😐',
            color: sentimentColors[(parsedSummary.sentiment as string)] || 'gray',
            details: `Intensity: ${(parsedSummary.emotion_intensity as string) || 'moderate'}`
          });
        }

        // Topic card
        if (issueTopics) {
          const categoryColors: Record<string, 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple'> = {
            complaint: 'red',
            support: 'orange',
            appointment: 'green',
            sales: 'blue',
            feedback: 'purple',
            billing: 'orange',
            technical: 'yellow',
            inquiry: 'blue'
          };
          sentimentCards.push({
            id: 'topic',
            type: 'topic',
            title: 'Issue Category',
            value: issueTopics.issue_category,
            icon: '📋',
            color: categoryColors[issueTopics.issue_category] || 'gray',
            details: issueTopics.primary_topic
          });
        }

        // Build full analysis object
        const analysis: ConversationAnalysis = {
          seriousness: seriousnessLevel,
          issueTopics,
          sentiment: parsedSummary.sentiment ? {
            overall_sentiment: (parsedSummary.sentiment as 'positive' | 'neutral' | 'negative') || 'neutral',
            caller_emotion: (parsedSummary.caller_emotion as any) || 'neutral',
            emotion_intensity: (parsedSummary.emotion_intensity as 'mild' | 'moderate' | 'strong') || 'moderate'
          } : undefined,
          summary: {
            brief_summary: (parsedSummary.summary as string) || '',
            main_points: (parsedSummary.mainPoints as string[]) || [],
            outcome: (parsedSummary.outcome as string) || 'unresolved',
            follow_up_required: parsedSummary.followUpRequired === true ? 'yes' : 'no',
            follow_up_notes: (parsedSummary.follow_up_notes as string) || ''
          }
        };

        console.log('✅ Enhanced analysis complete:', {
          priority: seriousnessLevel?.priority_level,
          sentiment: parsedSummary.sentiment,
          topic: issueTopics?.primary_topic,
          cardsCount: sentimentCards.length
        });

        return {
          summary: (parsedSummary.summary as string) || 'Call completed',
          mainPoints: Array.isArray(parsedSummary.mainPoints) ? parsedSummary.mainPoints as string[] : [(parsedSummary.summary as string) || 'Call completed'],
          sentiment: ['positive', 'neutral', 'negative'].includes(parsedSummary.sentiment as string)
            ? (parsedSummary.sentiment as 'positive' | 'neutral' | 'negative')
            : 'neutral',
          followUpRequired: parsedSummary.followUpRequired === true || priority === 'high' || priority === 'critical',
          notes: (parsedSummary.notes as string) || rawResponse,
          callerName: callerName,
          // Enhanced function calling results
          analysis,
          sentimentCards,
          seriousnessLevel,
          issueTopics
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

// Re-export function calling types for use in other components
export type { ConversationAnalysis, SeriousnessResult, IssueTopicsResult } from './functionCallingTools';
export { conversationTools, mapToExtractedFields, generateFunctionCallingSystemPrompt } from './functionCallingTools';

export default localLLMService;
