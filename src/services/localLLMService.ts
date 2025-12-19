/**
 * Local LLM Service for ClerkTree
 * 
 * Provides fallback AI using Hermes 2 Pro - Llama 3 8B (Q4_K_M)
 * Runs locally via Ollama on Mac M3
 * 
 * Model: adrienbrault/nous-hermes2pro:Q4_K_M
 * RAM Usage: ~4.9 GB (optimized for 8GB M3)
 * 
 * Setup:
 * 1. Install Ollama: https://ollama.com/download
 * 2. Run: ollama run adrienbrault/nous-hermes2pro:Q4_K_M
 */

import { 
  CallMessage, 
  ExtractedField, 
  CallCategory, 
  PriorityLevel, 
  KnowledgeBaseConfig 
} from '../contexts/DemoCallContext';

// Configuration - optimized for 8GB M3 Mac
const OLLAMA_URL = import.meta.env.VITE_OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = import.meta.env.VITE_OLLAMA_MODEL || 'adrienbrault/nous-hermes2pro:Q4_K_M';

// Context limit - reduced for 8GB RAM (saves ~300MB vs 4096)
const MAX_CONTEXT = 2048;

// Keep model loaded to avoid wake-up lag ("5m" = 5 minutes, "-1" = forever)
const KEEP_ALIVE = "5m";

// Enable streaming for instant character-by-character responses
const USE_STREAMING = true;

// Ollama-native tools format for Hermes 2 Pro
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
  private modelName: string = OLLAMA_MODEL;

  /**
   * Check if Ollama is running and the model is available
   */
  async checkAvailability(): Promise<boolean> {
    try {
      // Log the actual URL being used
      console.log(`🔍 Checking Ollama availability...`);
      console.log(`   URL: ${OLLAMA_URL}`);
      console.log(`   Model: ${OLLAMA_MODEL}`);
      console.log(`   Env Var: ${import.meta.env.VITE_OLLAMA_URL || 'NOT SET (using default)'}`);
      
      // Check Ollama is running
      const response = await fetch(`${OLLAMA_URL}/api/tags`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000), // Increased timeout for Railway
      });
      
      console.log(`   Response Status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error(`❌ Ollama not available: HTTP ${response.status} at ${OLLAMA_URL}`);
        console.error(`   Error: ${errorText}`);
        this.isAvailable = false;
        return false;
      }

      const data = await response.json();
      const models = data.models || [];
      
      console.log(`   Found ${models.length} model(s):`, models.map((m: { name: string }) => m.name).join(', ') || 'None');
      
      // Check if Hermes model is available
      const hermesModel = models.find((m: { name: string }) => 
        m.name.includes('hermes2pro') || 
        m.name.includes('nous-hermes') ||
        m.name === OLLAMA_MODEL
      );
      
      if (hermesModel) {
        this.modelName = hermesModel.name;
        this.isAvailable = true;
        console.log(`✅ Local LLM available: ${this.modelName}`);
        return true;
      }

      // Check for any Llama-based model as fallback
      const llamaModel = models.find((m: { name: string }) => 
        m.name.includes('llama')
      );
      
      if (llamaModel) {
        this.modelName = llamaModel.name;
        this.isAvailable = true;
        console.log(`✅ Local LLM available (fallback): ${this.modelName}`);
        return true;
      }

      // No suitable model found
      console.log('⚠️ Ollama running but no suitable model found.');
      console.log('   Expected model:', OLLAMA_MODEL);
      console.log('   Available models:', models.map((m: { name: string }) => m.name).join(', ') || 'None');
      console.log('   💡 Run on Railway: ollama run adrienbrault/nous-hermes2pro:Q4_K_M');
      this.isAvailable = false;
      return false;

    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      console.error(`❌ Ollama connection failed at ${OLLAMA_URL}`);
      console.error(`   Error: ${errorMsg}`);
      console.error(`   Error Type: ${e instanceof Error ? e.constructor.name : typeof e}`);
      
      if (errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError')) {
        console.error('   💡 This is likely a CORS or network issue.');
        console.error('   💡 Check if Railway service is running and publicly accessible.');
        console.error('   💡 Verify the URL in Netlify environment variables matches your Railway deployment.');
      } else if (errorMsg.includes('timeout')) {
        console.error('   💡 Connection timed out. Railway service might be slow or down.');
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
   * Build system prompt optimized for Hermes 2 Pro
   */
  private buildSystemPrompt(config: KnowledgeBaseConfig, existingFields: ExtractedField[]): string {
    const categoryList = config.categories.map(c => `- ${c.id}: ${c.name}`).join('\n');
    const extractedInfo = existingFields.length > 0
      ? existingFields.map(f => `${f.label}: ${f.value}`).join(', ')
      : 'None';

    // Keep prompt concise for lower context usage
    return `You are ${config.persona || 'an AI call agent'}. ${config.systemPrompt}

GREETING: "${config.greeting}"

CATEGORIES:
${categoryList}

KNOWN INFO: ${extractedInfo}

RULES:
- If caller introduced themselves, use their name naturally
- Don't ask for info you already have
- Be helpful and conversational
- Use tools to extract info and categorize calls

${config.customInstructions.length > 0 ? 'INSTRUCTIONS:\n' + config.customInstructions.join('\n') : ''}`;
  }

  /**
   * Generate response using Ollama with native tool calling
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
    const messages: OllamaMessage[] = [
      { role: 'system', content: systemPrompt },
      ...recentHistory.map(m => ({
        role: (m.speaker === 'agent' ? 'assistant' : 'user') as 'assistant' | 'user',
        content: m.text
      })),
      { role: 'user', content: userMessage }
    ];

    try {
      const response = await fetch(`${OLLAMA_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.modelName,
          messages,
          tools: OLLAMA_TOOLS,
          stream: false,
          keep_alive: KEEP_ALIVE, // Keep model in RAM to avoid wake-up lag
          options: {
            temperature: 0.7,
            num_predict: 256,      // Shorter outputs = faster response
            num_ctx: MAX_CONTEXT,  // 2048 context saves ~300MB RAM
            num_thread: 8,         // Force all M3 cores (4 perf + 4 efficiency)
            mirostat: 0,           // Disable complex sampling for speed
            low_vram: true,        // Aggressive memory management
          }
        }),
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) {
        throw new Error(`Ollama error: ${response.status}`);
      }

      const data = await response.json();
      return this.parseOllamaResponse(data, knowledgeBase, existingFields);

    } catch (error) {
      console.error('Local LLM error:', error);
      throw error;
    }
  }

  /**
   * Parse Ollama response with tool calls
   * Handles empty tool call edge cases with smarter confirmation responses
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
      const response = await fetch(`${OLLAMA_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.modelName,
          messages: [
            { role: 'system', content: 'You are a call analysis assistant. Be concise.' },
            { role: 'user', content: prompt }
          ],
          tools: [OLLAMA_TOOLS[3]], // Only summarize_call tool
          stream: false,
          keep_alive: KEEP_ALIVE,
          options: {
            temperature: 0.3,     // Low temp for accurate summarization
            num_predict: 256,     // Faster response
            num_ctx: MAX_CONTEXT,
            num_thread: 8,
            mirostat: 0,
            low_vram: true,
          }
        }),
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) {
        throw new Error(`Ollama error: ${response.status}`);
      }

      const data = await response.json();
      
      // Check for tool calls - look for extract_caller_info first
      const toolCalls = data.message?.tool_calls || [];
      const extractCall = toolCalls.find((tc: OllamaToolCall) => tc.function.name === 'extract_caller_info');
      const summaryCall = toolCalls.find((tc: OllamaToolCall) => tc.function.name === 'summarize_call');
      
      // Extract caller name if found
      let extractedName = callerName;
      if (extractCall?.function.arguments?.callerName) {
        extractedName = extractCall.function.arguments.callerName as string;
        console.log('✅ Local LLM extracted caller name in summary:', extractedName);
      }
      
      if (summaryCall?.function.arguments) {
        const args = summaryCall.function.arguments;
        const notes = (args.notes as string) || '';
        // Include caller name in notes if extracted
        const finalNotes = extractedName && !notes.toLowerCase().includes(extractedName.toLowerCase())
          ? `Caller: ${extractedName}. ${notes}`.trim()
          : notes;
        
        return {
          summary: (args.summary as string) || 'Call completed',
          mainPoints: (args.mainPoints as string[]) || ['Call completed'],
          sentiment: (args.sentiment as 'positive' | 'neutral' | 'negative') || 'neutral',
          followUpRequired: (args.followUpRequired as boolean) || priority === 'high' || priority === 'critical',
          notes: finalNotes,
          callerName: extractedName || callerName
        };
      }

      // Parse from text response if no tool call
      const textResponse = data.message?.content || '';
      return {
        summary: textResponse.slice(0, 200) || 'Call completed',
        mainPoints: ['Call completed'],
        sentiment: 'neutral',
        followUpRequired: priority === 'high' || priority === 'critical',
        notes: textResponse,
        callerName
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
   * Get the model name being used
   */
  getModelName(): string {
    return this.modelName;
  }
}

// Export singleton
export const localLLMService = new LocalLLMService();

// Initialize on import
localLLMService.initialize().catch(() => {
  console.log('💡 To enable local AI fallback, install Ollama and run:');
  console.log('   ollama run adrienbrault/nous-hermes2pro:Q4_K_M');
});

export default localLLMService;
