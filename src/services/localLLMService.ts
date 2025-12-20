/**
 * Local LLM Service for ClerkTree
 * 
 * Provides AI using local service via cloudflare tunnel
 * 
 * API: https://packs-measures-down-dakota.trycloudflare.com/completion
 * Uses simple prompt-based completion endpoint
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
const LLM_URL = getCleanURL(import.meta.env.VITE_OLLAMA_URL || 'https://pregnant-operational-centers-feels.trycloudflare.com');

// Number of tokens to generate per response
const N_PREDICT = 256;

// Tool definitions (for reference, not used with simple API)
const OLLAMA_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'extract_caller_info',
      description: 'Extract information about the caller from their message. Call this when the caller provides their name, contact info, or explains their purpose.',
      parameters: {
        type: 'object',
        properties: {
          callerName: {
            type: 'string',
            description: 'The full name of the caller if mentioned'
          },
          contactInfo: {
            type: 'string', 
            description: 'Phone number or email if provided'
          },
          callPurpose: {
            type: 'string',
            description: 'The main reason for the call'
          },
          urgencyLevel: {
            type: 'string',
            enum: ['low', 'medium', 'high', 'critical'],
            description: 'How urgent the caller\'s issue appears to be'
          }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'categorize_call',
      description: 'Categorize the call into one of the available categories',
      parameters: {
        type: 'object',
        properties: {
          categoryId: { 
            type: 'string', 
            description: 'The category ID (e.g., support, sales, billing)' 
          },
          categoryName: { 
            type: 'string', 
            description: 'Human-readable category name' 
          },
          confidence: { 
            type: 'number', 
            description: 'Confidence score between 0 and 1' 
          }
        },
        required: ['categoryId', 'categoryName']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'set_priority',
      description: 'Set the priority level for this call based on urgency indicators',
      parameters: {
        type: 'object',
        properties: {
          priority: {
            type: 'string',
            enum: ['low', 'medium', 'high', 'critical'],
            description: 'Priority level for the call'
          },
          reasoning: { 
            type: 'string', 
            description: 'Brief explanation for the priority' 
          },
          followUpRequired: { 
            type: 'boolean', 
            description: 'Whether follow-up action is needed' 
          }
        },
        required: ['priority', 'followUpRequired']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'summarize_call',
      description: 'Generate a comprehensive summary of the completed call',
      parameters: {
        type: 'object',
        properties: {
          summary: { 
            type: 'string', 
            description: 'Brief 1-2 sentence overall summary' 
          },
          mainPoints: { 
            type: 'array', 
            items: { type: 'string' }, 
            description: 'Array of key discussion points' 
          },
          sentiment: { 
            type: 'string', 
            enum: ['positive', 'neutral', 'negative'],
            description: 'Overall caller sentiment'
          },
          followUpRequired: { 
            type: 'boolean',
            description: 'Whether follow-up is needed'
          },
          notes: { 
            type: 'string',
            description: 'Additional notes or context'
          }
        },
        required: ['summary', 'mainPoints', 'sentiment']
      }
    }
  }
];

// Types
export interface LocalLLMResponse {
  response: string;
  extractedFields?: ExtractedField[];
  suggestedCategory?: { id: string; name: string; confidence: number };
  suggestedPriority?: PriorityLevel;
  followUpRequired?: boolean;
}

interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OllamaToolCall {
  function: {
    name: string;
    arguments: Record<string, unknown>;
  };
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
   * Clean response text by removing template artifacts and extracting final answer from reasoning
   */
  private cleanResponse(text: string): string {
    if (!text) return '';
    
    let cleaned = text;
    
    // First, try to extract final answer from XML tags (reasoning models often use <final> tags)
    const finalTagMatch = cleaned.match(/<final[^>]*>(.*?)<\/final>/is);
    if (finalTagMatch && finalTagMatch[1]) {
      cleaned = finalTagMatch[1].trim();
    }
    
    // Try to extract from JSON structure if present
    const jsonMatch = cleaned.match(/"final_answer"\s*:\s*"([^"]+)"/i) || 
                     cleaned.match(/"final_answer"\s*:\s*'([^']+)'/i);
    if (jsonMatch && jsonMatch[1]) {
      cleaned = jsonMatch[1].trim();
    }
    
    // Remove template placeholders (with variations)
    cleaned = cleaned
      .replace(/\[Write assistant's response here\]/gi, '')
      .replace(/\[Your response here\]/gi, '')
      .replace(/\[To be filled\]/gi, '')
      .replace(/\[To be\s*$/gi, '')
      .replace(/\[.*response.*\]/gi, '')
      .replace(/\[.*to be.*\]/gi, '');
    
    // Remove XML reasoning tags if present (<thought>, <reasoning>, etc.)
    cleaned = cleaned.replace(/<thought[^>]*>.*?<\/thought>/gis, '');
    cleaned = cleaned.replace(/<reasoning[^>]*>.*?<\/reasoning>/gis, '');
    cleaned = cleaned.replace(/<thinking[^>]*>.*?<\/thinking>/gis, '');
    
    // Remove "Response:" label and following newlines (anywhere in text)
    cleaned = cleaned.replace(/Response:\s*/gim, '');
    
    // Remove "Test instruction X" lines
    cleaned = cleaned.replace(/Test instruction \d+.*$/gim, '');
    
    // Remove lines that are instructions about test mode or templates
    cleaned = cleaned.replace(/If the user says "test me",.*$/gim, '');
    cleaned = cleaned.replace(/You need to (use|respond|fill).*$/gim, '');
    cleaned = cleaned.replace(/You don't have to.*$/gim, '');
    cleaned = cleaned.replace(/but you don't have to.*$/gim, '');
    
    // Remove lines that repeat conversation patterns or test patterns
    cleaned = cleaned.replace(/Assistant's response to user \d+.*$/gim, '');
    cleaned = cleaned.replace(/^User \d+:.*$/gim, '');
    cleaned = cleaned.replace(/^Assistant \d+:.*$/gim, '');
    
    // Remove test conversation templates
    cleaned = cleaned.replace(/Now, the conversation is:.*$/gim, '');
    cleaned = cleaned.replace(/The conversation is:.*$/gim, '');
    
    // Remove repetitive dream references (seems to be a model quirk)
    cleaned = cleaned.replace(/\b(not\s+)?in\s+my\s+dream\b/gi, '');
    
    // Extract final answer from reasoning model output
    // Look for markers like "Final answer:", "Therefore:", "So:", "Answer:", "In conclusion:", etc.
    const finalAnswerPatterns = [
      /(?:Final answer|Therefore|So|Answer|In conclusion|To conclude|Thus|Hence|As a result)[:：]\s*(.+)/is,
      /(?:Final answer|Therefore|So|Answer|In conclusion)[:：]\s*(.+)/is,
    ];
    
    for (const pattern of finalAnswerPatterns) {
      const match = cleaned.match(pattern);
      if (match && match[1]) {
        cleaned = match[1].trim();
        break;
      }
    }
    
    // Split into lines and identify reasoning vs final answer
    const lines = cleaned.split('\n').map(line => line.trim()).filter(line => line);
    
    // If we have multiple paragraphs, try to find the final answer
    // Reasoning models often structure: reasoning steps... then final answer at the end
    if (lines.length > 3) {
      // Look for transition words that indicate final answer
      const finalAnswerIndicators = [
        'therefore', 'so', 'thus', 'hence', 'consequently', 
        'final answer', 'answer:', 'conclusion', 'in summary'
      ];
      
      // Find the last significant paragraph that doesn't look like reasoning
      let finalAnswerStart = -1;
      for (let i = lines.length - 1; i >= 0; i--) {
        const lowerLine = lines[i].toLowerCase();
        // Check if this line starts with a final answer indicator
        if (finalAnswerIndicators.some(indicator => lowerLine.startsWith(indicator))) {
          finalAnswerStart = i;
          break;
        }
        // If we find a line that's a complete sentence and doesn't look like reasoning, it might be the answer
        if (i >= lines.length - 2 && lines[i].length > 20 && !lowerLine.includes('step') && !lowerLine.includes('think')) {
          finalAnswerStart = i;
          break;
        }
      }
      
      // If we found a final answer section, extract from there
      if (finalAnswerStart >= 0 && finalAnswerStart < lines.length - 1) {
        cleaned = lines.slice(finalAnswerStart).join(' ').replace(/^(?:Final answer|Therefore|So|Answer|In conclusion)[:：]\s*/i, '').trim();
      } else {
        // Otherwise, take the last 1-2 paragraphs as the answer
        cleaned = lines.slice(Math.max(0, lines.length - 2)).join(' ').trim();
      }
    } else {
      // For shorter responses, filter out reasoning-like lines
      cleaned = lines.filter(line => {
        const lower = line.toLowerCase();
        // Filter out lines that look like reasoning steps
        if (/^(step \d+|first|second|third|next|then|also|additionally|furthermore|moreover)[:：]?/i.test(lower)) {
          return false;
        }
        if (/^(let me|i need to|i should|i will|thinking|considering|analyzing)/i.test(lower)) {
          return false;
        }
        return true;
      }).join(' ').trim();
    }
    
    // Final cleanup: remove any remaining template-like content
    cleaned = cleaned
      .replace(/^\[.*\]$/gim, '')
      .replace(/^(Response|Test|Instruction|User \d+|Assistant \d+):/i, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    
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
      const cleanedText = msg.speaker === 'agent' ? this.cleanResponse(msg.text) : msg.text;
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
      
      // Clean the response - remove template artifacts and labels
      const rawResponse = data.content || '';
      const cleanedResponse = this.cleanResponse(rawResponse) || rawResponse;
      
      return {
        response: cleanedResponse,
        extractedFields: existingFields, // Keep existing fields
      };

    } catch (error) {
      console.error('Local LLM error:', error);
      throw error;
    }
  }

  /**
   * Parse Local LLM response (unused with simple API, kept for compatibility)
   */
  private parseOllamaResponse(
    data: { message?: { content?: string; tool_calls?: OllamaToolCall[] } },
    knowledgeBase: KnowledgeBaseConfig,
    existingFields: ExtractedField[] = []
  ): LocalLLMResponse {
    const result: LocalLLMResponse = {
      response: data.message?.content || '',
      extractedFields: [],
    };

    const toolCalls = data.message?.tool_calls || [];
    let extractedName: string | null = null;
    let extractedPurpose: string | null = null;

    for (const tc of toolCalls) {
      const args = tc.function.arguments;
      
      switch (tc.function.name) {
        case 'extract_caller_info':
          if (args.callerName) {
            extractedName = args.callerName as string;
            result.extractedFields!.push({
              id: 'name',
              label: 'Caller Name',
              value: extractedName,
              confidence: 0.92,
              extractedAt: new Date()
            });
          }
          if (args.callPurpose) {
            extractedPurpose = args.callPurpose as string;
            result.extractedFields!.push({
              id: 'purpose',
              label: 'Call Purpose',
              value: extractedPurpose,
              confidence: 0.88,
              extractedAt: new Date()
            });
          }
          if (args.contactInfo) {
            result.extractedFields!.push({
              id: 'contact',
              label: 'Contact Info',
              value: args.contactInfo as string,
              confidence: 0.9,
              extractedAt: new Date()
            });
          }
          if (args.urgencyLevel) {
            result.suggestedPriority = args.urgencyLevel as PriorityLevel;
          }
          break;
          
        case 'categorize_call':
          const matchedCategory = knowledgeBase.categories.find(
            c => c.id === args.categoryId || 
                 c.name.toLowerCase() === (args.categoryName as string)?.toLowerCase()
          );
          if (matchedCategory) {
            result.suggestedCategory = {
              id: matchedCategory.id,
              name: matchedCategory.name,
              confidence: (args.confidence as number) || 0.85
            };
          } else if (args.categoryId && args.categoryName) {
            result.suggestedCategory = {
              id: args.categoryId as string,
              name: args.categoryName as string,
              confidence: (args.confidence as number) || 0.8
            };
          }
          break;
          
        case 'set_priority':
          if (args.priority) {
            result.suggestedPriority = args.priority as PriorityLevel;
            result.followUpRequired = args.followUpRequired as boolean;
          }
          break;
      }
    }

    // Handle empty text response with smart confirmation (better UX)
    if (!result.response.trim()) {
      // Check what we know (newly extracted + existing)
      const knownName = extractedName || existingFields.find(f => f.id === 'name')?.value;
      const knownPurpose = extractedPurpose || existingFields.find(f => f.id === 'purpose')?.value;
      
      if (extractedName && extractedPurpose) {
        // Just extracted both - confirm them
        result.response = `I've noted your name as ${extractedName} and that you're calling about ${extractedPurpose}. How can I assist you further?`;
      } else if (extractedName) {
        // Just got the name
        result.response = `Nice to meet you, ${extractedName}! How can I help you today?`;
      } else if (extractedPurpose) {
        // Just got the purpose
        result.response = `I understand you need help with ${extractedPurpose}. ${knownName ? `${knownName}, ` : ''}let me see how I can assist.`;
      } else if (knownName && knownPurpose) {
        // We know everything, ask if there's more
        result.response = `${knownName}, is there anything else you'd like to add about ${knownPurpose}?`;
      } else if (knownName) {
        // We have name but need purpose
        result.response = `${knownName}, what can I help you with today?`;
      } else {
        // Generic fallback
        result.response = "I understand. How can I help you further?";
      }
    }

    return result;
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
      
      // Clean the response - remove template artifacts and labels
      const rawResponse = data.content || '';
      const textResponse = this.cleanResponse(rawResponse) || rawResponse;
      
      // Try to extract a simple summary (first sentence or first 200 chars)
      const summary = textResponse.split('.')[0] || textResponse.slice(0, 200) || 'Call completed';
      
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
