/**
 * AI Service Layer - Smart Conversation Handler
 * 
 * Priority chain:
 * 1. Gemini API (cloud, most capable)
 * 2. Local LLM via cloudflare tunnel (local service)
 * 3. Smart Mock (fallback, always available)
 */

import { 
  KnowledgeBaseConfig, 
  ExtractedField, 
  CallCategory, 
  PriorityLevel,
  CallMessage,
  CallSummary,
  ActionItem 
} from '../contexts/DemoCallContext';
import { 
  generateCallResponse, 
  summarizeCall, 
  testGeminiConnection,
  AIAnalysisResult,
  CallSummaryResult 
} from './geminiService';
import { localLLMService, LocalLLMResponse } from './localLLMService';

// Configuration for AI operations
interface AIConfig {
  useGemini: boolean;
  useLocalLLM: boolean;
  fallbackToMock: boolean;
}

// Conversation state tracking
interface ConversationState {
  hasGreeted: boolean;
  hasName: boolean;
  callerName: string | null;
  hasPurpose: boolean;
  purpose: string | null;
  hasAskedAnythingElse: boolean;
  turnCount: number;
  detectedUrgency: PriorityLevel | null;
  detectedCategory: string | null;
  isWrappingUp: boolean;
}

// Response types for AI operations
export interface AIResponse {
  text: string;
  extractedFields?: ExtractedField[];
  suggestedCategory?: CallCategory;
  suggestedPriority?: PriorityLevel;
  confidence: number;
  source?: 'gemini' | 'local-llm' | 'mock';
}

export interface SummaryResponse {
  summary: CallSummary;
  tags: string[];
  callerName?: string; // Caller name extracted during summary
}

export interface FieldExtractionResponse {
  fields: ExtractedField[];
  confidence: number;
}

export interface CategoryPrediction {
  category: CallCategory;
  confidence: number;
  reasoning: string;
}

export interface PriorityPrediction {
  priority: PriorityLevel;
  confidence: number;
  reasoning: string;
}

class AIService {
  private config: AIConfig = {
    useGemini: true,
    useLocalLLM: true,
    fallbackToMock: true,
  };
  private knowledgeBase: KnowledgeBaseConfig | null = null;
  private geminiAvailable: boolean | null = null;
  private localLLMAvailable: boolean | null = null;
  private conversationState: ConversationState = this.resetConversationState();

  private resetConversationState(): ConversationState {
    return {
      hasGreeted: false,
      hasName: false,
      callerName: null,
      hasPurpose: false,
      purpose: null,
      hasAskedAnythingElse: false,
      turnCount: 0,
      detectedUrgency: null,
      detectedCategory: null,
      isWrappingUp: false,
    };
  }

  /**
   * Reset conversation state for new call
   */
  resetState() {
    this.conversationState = this.resetConversationState();
  }

  /**
   * Initialize the AI service
   * Parallelizes availability checks for faster startup
   */
  async initialize(): Promise<void> {
    console.log('🔄 Initializing AI services...');
    
    // Run both checks in parallel for faster startup
    const [geminiResult, localResult] = await Promise.all([
      testGeminiConnection().catch(() => false),
      localLLMService.initialize().catch(() => false)
    ]);
    
    this.geminiAvailable = geminiResult;
    this.localLLMAvailable = localResult;

    console.log('☁️ Gemini API available:', this.geminiAvailable);
    if (this.localLLMAvailable) {
      console.log('🖥️ Local LLM available:', localLLMService.getServiceUrl());
    } else {
      const llmUrl = import.meta.env.VITE_OLLAMA_URL || 'https://packs-measures-down-dakota.trycloudflare.com';
      console.log(`⚠️ Local LLM not available. Check: ${llmUrl}`);
      console.log('💡 Make sure your cloudflare tunnel is running and accessible');
    }

    // Log the active chain
    const chain = [];
    if (this.geminiAvailable) chain.push('Gemini');
    if (this.localLLMAvailable) chain.push('Local LLM');
    chain.push('Smart Mock');
    console.log('🔗 AI Chain:', chain.join(' → '));
    
    if (!this.geminiAvailable && !this.localLLMAvailable) {
      console.warn('⚠️ WARNING: Both Gemini and Local LLM are unavailable. Using Smart Mock fallback only.');
      console.warn('💡 To fix:');
      console.warn('   1. Check VITE_GEMINI_API_KEY is set');
      console.warn('   2. Check VITE_OLLAMA_URL points to your cloudflare tunnel URL');
    }
  }

  /**
   * Set whether to use Gemini or mock responses
   */
  setConfig(config: Partial<AIConfig>) {
    this.config = { ...this.config, ...config };
  }

  /**
   * Set the knowledge base configuration for context
   */
  setKnowledgeBase(kb: KnowledgeBaseConfig) {
    this.knowledgeBase = kb;
    console.log('📚 Knowledge base updated:', kb.persona);
  }

  /**
   * Get current AI status
   */
  getStatus(): { gemini: boolean; localLLM: boolean; localLLMModel?: string } {
    return {
      gemini: this.geminiAvailable === true,
      localLLM: this.localLLMAvailable === true,
      localLLMModel: this.localLLMAvailable ? localLLMService.getServiceUrl() : undefined,
    };
  }

  /**
   * Generate a response to user input using the AI chain
   */
  async generateResponse(
    userMessage: string,
    conversationHistory: CallMessage[],
    extractedFields: ExtractedField[]
  ): Promise<AIResponse> {
    const kb = this.knowledgeBase;
    
    if (!kb) {
      console.warn('Knowledge base not set, using smart mock');
      return this.smartMockResponse(userMessage, conversationHistory, extractedFields);
    }

    // Step 1: Try Gemini first (cloud)
    if (this.config.useGemini && this.geminiAvailable !== false) {
      try {
        console.log('🌐 Calling Gemini API...');
        console.log('   Gemini Available:', this.geminiAvailable);
        console.log('   API Key Set:', !!import.meta.env.VITE_GEMINI_API_KEY);
        const result: AIAnalysisResult = await generateCallResponse(
          userMessage,
          conversationHistory,
          kb,
          extractedFields
        );

        // Convert Gemini response to our format
        const response: AIResponse = {
          text: result.response,
          extractedFields: result.extractedFields,
          suggestedPriority: result.suggestedPriority,
          confidence: 0.95,
          source: 'gemini',
        };

        // Map suggested category
        if (result.suggestedCategory) {
          const matchedCategory = kb.categories.find(
            c => c.id === result.suggestedCategory?.id || 
                 c.name.toLowerCase() === result.suggestedCategory?.name.toLowerCase()
          );
          if (matchedCategory) {
            response.suggestedCategory = matchedCategory;
          }
        }

        console.log('✅ Gemini response received');
        return response;

      } catch (error) {
        console.error('❌ Gemini API error:', error);
        this.geminiAvailable = false; // Mark as unavailable to avoid repeated failures
      }
    }

      // Step 2: Try Local LLM
    if (this.config.useLocalLLM && this.localLLMAvailable !== false) {
      try {
        console.log('🖥️ Calling Local LLM...');
        console.log('   Local LLM Available:', this.localLLMAvailable);
        console.log('   Ollama URL:', import.meta.env.VITE_OLLAMA_URL || 'NOT SET');
        const result: LocalLLMResponse = await localLLMService.generateResponse(
          userMessage,
          conversationHistory,
          kb,
          extractedFields
        );

        // Convert to our format
        const response: AIResponse = {
          text: result.response,
          extractedFields: result.extractedFields,
          suggestedPriority: result.suggestedPriority,
          confidence: 0.88,
          source: 'local-llm',
        };

        // Map suggested category
        if (result.suggestedCategory) {
          const matchedCategory = kb.categories.find(
            c => c.id === result.suggestedCategory?.id || 
                 c.name.toLowerCase() === result.suggestedCategory?.name.toLowerCase()
          );
          if (matchedCategory) {
            response.suggestedCategory = matchedCategory;
          }
        }

        console.log('✅ Local LLM response received');
        return response;

      } catch (error) {
        console.error('❌ Local LLM error:', error);
        this.localLLMAvailable = false; // Mark as unavailable
      }
    }

    // Step 3: No fallback - model must be available
    console.error('❌ No AI model available - cloudflare model must be accessible');
    throw new Error('AI model unavailable - ensure cloudflare tunnel is running and accessible');
  }

  /**
   * Generate call summary
   */
  async generateSummary(
    messages: CallMessage[],
    extractedFields: ExtractedField[],
    category?: CallCategory,
    priority?: PriorityLevel
  ): Promise<SummaryResponse> {
    const kb = this.knowledgeBase;
    
    if (!kb) {
      return this.mockGenerateSummary(messages, extractedFields, category, priority);
    }

    // Step 1: Try Gemini
    if (this.config.useGemini && this.geminiAvailable) {
      try {
        console.log('🌐 Calling Gemini for summary...');
        const result: CallSummaryResult = await summarizeCall(messages, kb, extractedFields);

        const tags: string[] = [];
        if (result.category) tags.push(result.category.id);
        if (result.priority === 'critical' || result.priority === 'high') {
          tags.push('follow-up-needed');
        }
        if (result.followUpRequired) tags.push('follow-up');

        const actionItems: ActionItem[] = result.actionItems.map((item, index) => ({
          id: `action-${Date.now()}-${index}`,
          text: item.task,
          completed: false,
        }));

        // Extract caller name from notes if present
        let callerName: string | undefined;
        if (result.notes) {
          const nameMatch = result.notes.match(/(?:caller|from|name is|named):\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
          if (nameMatch?.[1]) {
            callerName = nameMatch[1];
          }
        }

        return {
          summary: {
            mainPoints: result.mainPoints,
            sentiment: result.sentiment,
            actionItems,
            followUpRequired: result.followUpRequired,
            notes: result.notes,
          },
          tags,
          callerName,
        };

      } catch (error) {
        console.error('❌ Gemini summary error:', error);
      }
    }

    // Step 2: Try Local LLM
    if (this.config.useLocalLLM && this.localLLMAvailable) {
      try {
        console.log('🖥️ Calling Local LLM for summary...');
        const result = await localLLMService.summarizeCall(
          messages,
          extractedFields,
          category,
          priority
        );

        const tags: string[] = [];
        if (category) tags.push(category.id);
        if (result.followUpRequired) tags.push('follow-up');

        // Include caller name in notes if extracted
        let notes = result.notes;
        if (result.callerName && !notes.toLowerCase().includes(result.callerName.toLowerCase())) {
          notes = `Caller: ${result.callerName}. ${notes}`.trim();
        }

        return {
          summary: {
            mainPoints: result.mainPoints,
            sentiment: result.sentiment,
            actionItems: [],
            followUpRequired: result.followUpRequired,
            notes,
          },
          tags,
          callerName: result.callerName, // Pass caller name back
        };

      } catch (error) {
        console.error('❌ Local LLM summary error:', error);
      }
    }

    // Step 3: Fallback to mock
    return this.mockGenerateSummary(messages, extractedFields, category, priority);
  }

  /**
   * Smart mock response generator with conversation state tracking
   */
  private async smartMockResponse(
    _userMessage: string,
    _conversationHistory: CallMessage[],
    _existingFields: ExtractedField[]
  ): Promise<AIResponse> {
    // All responses must come from the cloudflare model
    // This function should never be called - model must be available
    throw new Error('AI model unavailable - all responses must be generated by the cloudflare model. Ensure your cloudflare tunnel is running.');
  }

  /**
   * Mock summary generator
   */
  private async mockGenerateSummary(
    messages: CallMessage[],
    extractedFields: ExtractedField[],
    category?: CallCategory,
    priority?: PriorityLevel
  ): Promise<SummaryResponse> {
    await this.delay(400);

    const userMessages = messages.filter(m => m.speaker === 'user');
    const mainPoints: string[] = [];
    const tags: string[] = [];
    const actionItems: ActionItem[] = [];

    const callerName = extractedFields.find(f => f.id === 'name')?.value;
    const purpose = extractedFields.find(f => f.id === 'purpose')?.value;

    if (callerName) {
      mainPoints.push(`Caller: ${callerName}`);
    }
    if (purpose) {
      mainPoints.push(`Purpose: ${purpose}`);
    }

    userMessages.slice(0, 3).forEach((msg) => {
      if (msg.text.length > 15) {
        mainPoints.push(msg.text.substring(0, 80) + (msg.text.length > 80 ? '...' : ''));
      }
    });

    extractedFields.forEach(field => {
      if (field.id !== 'name' && field.id !== 'purpose' && field.value) {
        mainPoints.push(`${field.label}: ${field.value}`);
      }
    });

    if (category) tags.push(category.id);
    if (priority === 'critical' || priority === 'high') {
      tags.push('priority');
      tags.push('follow-up-needed');
    }

    const allText = messages.map(m => m.text).join(' ').toLowerCase();
    let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
    
    const positiveWords = ['thank', 'great', 'awesome', 'excellent', 'appreciate', 'helpful', 'wonderful'];
    const negativeWords = ['frustrated', 'angry', 'terrible', 'awful', 'disappointed', 'upset', 'worst'];
    
    const positiveCount = positiveWords.filter(w => allText.includes(w)).length;
    const negativeCount = negativeWords.filter(w => allText.includes(w)).length;
    
    if (positiveCount > negativeCount) sentiment = 'positive';
    else if (negativeCount > positiveCount) sentiment = 'negative';

    if (priority === 'critical' || priority === 'high') {
      actionItems.push({
        id: `action-${Date.now()}-1`,
        text: 'Follow up with caller urgently',
        completed: false,
      });
    }
    if (purpose?.toLowerCase().includes('appointment') || purpose?.toLowerCase().includes('schedule')) {
      actionItems.push({
        id: `action-${Date.now()}-2`,
        text: 'Schedule appointment as requested',
        completed: false,
      });
    }
    if (category?.id === 'support') {
      actionItems.push({
        id: `action-${Date.now()}-3`,
        text: 'Create support ticket for issue resolution',
        completed: false,
      });
    }

    let notes = '';
    if (callerName) {
      notes += `Call from ${callerName}. `;
    }
    if (purpose) {
      notes += `Regarding: ${purpose}. `;
    }
    if (category) {
      notes += `Categorized as ${category.name}. `;
    }
    if (priority && priority !== 'medium') {
      notes += `Priority: ${priority}. `;
    }
    if (!notes) {
      notes = 'Call completed successfully.';
    }

    return {
      summary: {
        mainPoints: mainPoints.length > 0 ? mainPoints : ['Call completed'],
        sentiment,
        actionItems,
        followUpRequired: priority === 'critical' || priority === 'high',
        notes,
      },
      tags,
    };
  }

  /**
   * Predict call category
   */
  async predictCategory(
    messages: CallMessage[],
    categories: CallCategory[]
  ): Promise<CategoryPrediction> {
    await this.delay(150);

    const allText = messages.map(m => m.text).join(' ').toLowerCase();

    if (allText.includes('complaint') || allText.includes('frustrated')) {
      return {
        category: categories.find(c => c.id === 'complaint') || categories[0],
        confidence: 0.88,
        reasoning: 'Detected complaint-related keywords',
      };
    }
    if (allText.includes('appointment') || allText.includes('schedule')) {
      return {
        category: categories.find(c => c.id === 'appointment') || categories[0],
        confidence: 0.92,
        reasoning: 'Appointment scheduling request detected',
      };
    }
    if (allText.includes('help') || allText.includes('issue') || allText.includes('problem')) {
      return {
        category: categories.find(c => c.id === 'support') || categories[0],
        confidence: 0.85,
        reasoning: 'Support request indicators found',
      };
    }

    return {
      category: categories.find(c => c.id === 'inquiry') || categories[0],
      confidence: 0.7,
      reasoning: 'General inquiry based on context',
    };
  }

  /**
   * Predict priority level
   */
  async predictPriority(
    messages: CallMessage[],
    _priorityRules: string[]
  ): Promise<PriorityPrediction> {
    await this.delay(150);

    const allText = messages.map(m => m.text).join(' ').toLowerCase();

    if (allText.includes('emergency') || allText.includes('critical')) {
      return { priority: 'critical', confidence: 0.95, reasoning: 'Emergency keywords detected' };
    }
    if (allText.includes('urgent') || allText.includes('asap')) {
      return { priority: 'high', confidence: 0.88, reasoning: 'Urgency indicators found' };
    }

    return { priority: 'medium', confidence: 0.75, reasoning: 'Standard priority' };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const aiService = new AIService();

// Initialize on import
aiService.initialize().catch(console.error);

// Export types
export type { AIConfig };
