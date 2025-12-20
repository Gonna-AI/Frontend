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
const LLM_URL = import.meta.env.VITE_OLLAMA_URL || 'https://packs-measures-down-dakota.trycloudflare.com';

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
    
    // Add conversation history
    for (const msg of recentHistory) {
      const role = msg.speaker === 'agent' ? 'Assistant' : 'User';
      prompt += `${role}: ${msg.text}\n`;
    }
    
    // Add current user message
    prompt += `User: ${userMessage}\nAssistant:`;

    try {
      const response = await fetch(`${OLLAMA_URL}/completion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt,
          n_predict: 256, // Number of tokens to predict
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
      
      // Simple response format - just return the content
      return {
        response: data.content || '',
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
      
      // Simple text response - parse basic summary from content
      const textResponse = data.content || '';
      
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
