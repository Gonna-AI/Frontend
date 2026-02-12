/**
 * AI Service Layer - Groq API
 * 
 * Uses Groq API for fast, powerful AI responses.
 * Primary model: configured via server-side proxy
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
import { localLLMService, LocalLLMResponse } from './localLLMService';

// Configuration for AI operations
interface AIConfig {
  useGroq: boolean;
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

// Import function calling types
import type { ConversationAnalysis, SeriousnessResult, IssueTopicsResult } from './localLLMService';
import type { SentimentCard } from './localLLMService';

// Response types for AI operations
export interface AIResponse {
  text: string;
  reasoning?: string; // Model's thinking process (display in chat, don't speak in voice)
  extractedFields?: ExtractedField[];
  suggestedCategory?: CallCategory;
  suggestedPriority?: PriorityLevel;
  confidence: number;
  source?: 'groq' | 'mock';
  // Enhanced function calling analysis
  analysis?: ConversationAnalysis;
}

export interface SummaryResponse {
  summary: CallSummary;
  tags: string[];
  callerName?: string; // Caller name extracted during summary
  // Enhanced function calling results
  analysis?: ConversationAnalysis;
  sentimentCards?: SentimentCard[];
  seriousnessLevel?: SeriousnessResult;
  issueTopics?: IssueTopicsResult;
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
    useGroq: true,
    fallbackToMock: true,
  };
  private knowledgeBase: KnowledgeBaseConfig | null = null;
  private groqAvailable: boolean | null = null;
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
   * Connects to Groq API for AI responses
   */
  async initialize(): Promise<void> {
    console.log('🔄 Initializing Groq AI service...');

    try {
      this.groqAvailable = await localLLMService.initialize();
    } catch (error) {
      console.error('Failed to initialize Groq service:', error);
      this.groqAvailable = false;
    }

    if (this.groqAvailable) {
      console.log('✅ Groq AI service available');
    } else {
      console.error('❌ Groq API not available. Check server configuration.');
    }
  }

  /**
   * Set configuration for AI operations
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
  getStatus(): { groq: boolean; groqUrl?: string } {
    return {
      groq: this.groqAvailable === true,
      groqUrl: this.groqAvailable ? localLLMService.getServiceUrl() : undefined,
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

    // Use Groq API via localLLMService (named for backwards compatibility)
    if (this.config.useGroq) {
      try {
        console.log('🤖 Calling Groq AI Service...');
        console.log('   Service Available:', this.groqAvailable);

        const result: LocalLLMResponse = await localLLMService.generateResponse(
          userMessage,
          conversationHistory,
          kb,
          extractedFields
        );

        // Convert to our format, including enhanced function calling analysis
        const response: AIResponse = {
          text: result.response,
          reasoning: result.reasoning, // Pass through reasoning for display
          extractedFields: result.extractedFields,
          suggestedPriority: result.suggestedPriority,
          confidence: 0.88,
          source: 'groq',
          analysis: result.analysis, // Pass through function calling analysis
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

        console.log('✅ AI response received');
        if (result.analysis) {
          console.log('   📊 Analysis included:', {
            priority: result.analysis.seriousness?.priority_level,
            sentiment: result.analysis.sentiment?.overall_sentiment
          });
        }
        return response;

      } catch (error) {
        console.error('❌ AI Service error:', error);
        // Only mark as unavailable for connection errors, not timeouts or aborts
        if (error instanceof Error) {
          const isTimeoutOrAbort = error.name === 'AbortError' ||
            error.name === 'TimeoutError' ||
            error.message.includes('timeout') ||
            error.message.includes('aborted');
          if (!isTimeoutOrAbort) {
            this.groqAvailable = false; // Only mark unavailable for actual connection failures
          } else {
            console.warn('⏱️ AI request timed out - model may still be processing');
            // Provide a helpful timeout message
            throw new Error('The AI is taking longer than expected. Please try again - your request may have been too complex.');
          }
        }
        // Re-throw other errors
        throw error;
      }
    }

    // No fallback - Groq must be available
    console.error('❌ Groq API not enabled in config');
    throw new Error('Groq API is disabled in config');
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

    // Use Groq API for summary
    if (this.config.useGroq && this.groqAvailable) {
      try {
        console.log('� Calling Groq for summary...');
        const result = await localLLMService.summarizeCall(
          messages,
          extractedFields,
          category,
          priority
        );

        const tags: string[] = [];
        if (category) tags.push(category.id);
        if (result.followUpRequired) tags.push('follow-up');
        // Add tags based on enhanced analysis
        if (result.seriousnessLevel?.priority_level === 'critical') tags.push('critical');
        if (result.seriousnessLevel?.priority_level === 'high') tags.push('high-priority');
        if (result.issueTopics?.issue_category) tags.push(result.issueTopics.issue_category);

        // Include caller name in notes if extracted
        let notes = result.notes;
        if (result.callerName && !notes.toLowerCase().includes(result.callerName.toLowerCase())) {
          notes = `Caller: ${result.callerName}. ${notes}`.trim();
        }

        console.log('✅ Enhanced summary with function calling complete');
        if (result.sentimentCards) {
          console.log(`   📊 Generated ${result.sentimentCards.length} sentiment cards`);
        }

        return {
          summary: {
            mainPoints: result.mainPoints,
            sentiment: result.sentiment as CallSummary['sentiment'],
            actionItems: [],
            followUpRequired: result.followUpRequired,
            notes,
            // Enhanced fields
            summaryText: result.summary, // Clean summary text for preview
            suggestions: result.suggestions,
            callerIntent: result.callerIntent,
            moodIndicators: result.moodIndicators,
            topics: result.topics,
            resolution: result.resolution,
            riskLevel: result.riskLevel,
            estimatedPriority: result.estimatedPriority,
          },
          tags,
          callerName: result.callerName,
          // Enhanced function calling results
          analysis: result.analysis,
          sentimentCards: result.sentimentCards,
          seriousnessLevel: result.seriousnessLevel,
          issueTopics: result.issueTopics,
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
