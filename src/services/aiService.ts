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
} from '../contexts/DemoCallContext';
import { localLLMService, LocalLLMResponse } from './localLLMService';

// Configuration for AI operations
interface AIConfig {
  useGroq: boolean;
  fallbackToMock: boolean;
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


  /**
   * Reset conversation state for new call
   */
  resetState() {
    // Currently no-op as localLLMService handles state through conversation history directly
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
    // Always use Groq via localLLMService — it manages its own availability.
    // No knowledge-base guard, no groqAvailable flag, no mock fallback.
    console.log('🤖 Calling Groq for summary...');
    const result = await localLLMService.summarizeCall(
      messages,
      extractedFields,
      category,
      priority
    );

    const tags: string[] = [];
    if (category) tags.push(category.id);
    if (result.followUpRequired) tags.push('follow-up');
    if (result.seriousnessLevel?.priority_level === 'critical') tags.push('critical');
    if (result.seriousnessLevel?.priority_level === 'high') tags.push('high-priority');
    if (result.issueTopics?.issue_category) tags.push(result.issueTopics.issue_category);

    console.log('✅ Groq summary complete');
    return {
      summary: {
        mainPoints: result.mainPoints,
        sentiment: result.sentiment as CallSummary['sentiment'],
        actionItems: [],
        followUpRequired: result.followUpRequired,
        notes: result.notes,
        summaryText: result.summary,
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
      analysis: result.analysis,
      sentimentCards: result.sentimentCards,
      seriousnessLevel: result.seriousnessLevel,
      issueTopics: result.issueTopics,
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
// Initialize on import - REMOVED for performance
// aiService.initialize().catch(console.error);

// Export types
export type { AIConfig };
