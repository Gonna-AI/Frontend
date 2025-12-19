/**
 * AI Service Layer - Integrated with Gemini API
 * 
 * This service provides AI operations using Google's Gemini 2.0 Flash Lite model.
 * Includes function calling for summarization, categorization, and priority tagging.
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

// Configuration for AI operations
interface AIConfig {
  useGemini: boolean;
  fallbackToMock: boolean;
}

// Response types for AI operations
export interface AIResponse {
  text: string;
  extractedFields?: ExtractedField[];
  suggestedCategory?: CallCategory;
  suggestedPriority?: PriorityLevel;
  confidence: number;
}

export interface SummaryResponse {
  summary: CallSummary;
  tags: string[];
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
    fallbackToMock: true,
  };
  private knowledgeBase: KnowledgeBaseConfig | null = null;
  private geminiAvailable: boolean | null = null;

  /**
   * Initialize the AI service
   */
  async initialize(): Promise<boolean> {
    // Test Gemini connection
    this.geminiAvailable = await testGeminiConnection();
    console.log('Gemini API available:', this.geminiAvailable);
    return this.geminiAvailable;
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
    console.log('Knowledge base updated:', kb.persona);
  }

  /**
   * Generate a response to user input using Gemini
   */
  async generateResponse(
    userMessage: string,
    conversationHistory: CallMessage[],
    extractedFields: ExtractedField[]
  ): Promise<AIResponse> {
    const kb = this.knowledgeBase;
    
    if (!kb) {
      console.warn('Knowledge base not set, using default responses');
      return this.mockGenerateResponse(userMessage, conversationHistory, extractedFields);
    }

    // Try Gemini first
    if (this.config.useGemini && (this.geminiAvailable !== false)) {
      try {
        console.log('Calling Gemini API for response...');
        const result: AIAnalysisResult = await generateCallResponse(
          userMessage,
          conversationHistory,
          kb
        );

        // Convert Gemini response to our format
        const response: AIResponse = {
          text: result.response,
          extractedFields: result.extractedFields,
          suggestedPriority: result.suggestedPriority,
          confidence: 0.9,
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

        console.log('Gemini response received:', response.text.substring(0, 50) + '...');
        return response;

      } catch (error) {
        console.error('Gemini API error:', error);
        if (this.config.fallbackToMock) {
          console.log('Falling back to mock response');
          return this.mockGenerateResponse(userMessage, conversationHistory, extractedFields);
        }
        throw error;
      }
    }

    // Use mock response
    return this.mockGenerateResponse(userMessage, conversationHistory, extractedFields);
  }

  /**
   * Generate call summary using Gemini
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

    if (this.config.useGemini && (this.geminiAvailable !== false)) {
      try {
        console.log('Calling Gemini API for summary...');
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

        return {
          summary: {
            mainPoints: result.mainPoints,
            sentiment: result.sentiment,
            actionItems,
            followUpRequired: result.followUpRequired,
            notes: result.notes,
          },
          tags,
        };

      } catch (error) {
        console.error('Gemini summary error:', error);
        if (this.config.fallbackToMock) {
          return this.mockGenerateSummary(messages, extractedFields, category, priority);
        }
        throw error;
      }
    }

    return this.mockGenerateSummary(messages, extractedFields, category, priority);
  }

  /**
   * Mock response generator (fallback)
   */
  private async mockGenerateResponse(
    userMessage: string,
    conversationHistory: CallMessage[],
    extractedFields: ExtractedField[]
  ): Promise<AIResponse> {
    await this.delay(300 + Math.random() * 400);

    const kb = this.knowledgeBase;
    const lowerMessage = userMessage.toLowerCase();

    let response = '';
    const newFields: ExtractedField[] = [];
    let suggestedPriority: PriorityLevel | undefined;
    let suggestedCategory: CallCategory | undefined;

    // Extract name if mentioned
    const nameMatch = userMessage.match(/(?:my name is|i'm|i am|this is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
    if (nameMatch && !extractedFields.find(f => f.id === 'name')) {
      newFields.push({
        id: 'name',
        label: 'Caller Name',
        value: nameMatch[1],
        confidence: 0.95,
        extractedAt: new Date(),
      });
      response = `Nice to meet you, ${nameMatch[1]}! How can I assist you today?`;
    }
    else if (conversationHistory.length <= 1 && (lowerMessage.includes('hello') || lowerMessage.includes('hi'))) {
      response = kb?.greeting || "Hello! Thank you for calling. How may I assist you today?";
    }
    else if (lowerMessage.includes('urgent') || lowerMessage.includes('emergency')) {
      suggestedPriority = lowerMessage.includes('emergency') ? 'critical' : 'high';
      newFields.push({
        id: 'urgency',
        label: 'Urgency Level',
        value: suggestedPriority === 'critical' ? 'Emergency' : 'Very Urgent',
        confidence: 0.92,
        extractedAt: new Date(),
      });
      response = "I understand this is urgent. Let me prioritize your request. Can you tell me more?";
    }
    else if (lowerMessage.includes('help') || lowerMessage.includes('issue') || lowerMessage.includes('problem')) {
      suggestedCategory = kb?.categories.find(c => c.id === 'support');
      newFields.push({
        id: 'purpose',
        label: 'Call Purpose',
        value: 'Technical Support Request',
        confidence: 0.88,
        extractedAt: new Date(),
      });
      response = "I'm sorry to hear you're experiencing issues. Could you describe the problem in more detail?";
    }
    else if (lowerMessage.includes('appointment') || lowerMessage.includes('schedule')) {
      suggestedCategory = kb?.categories.find(c => c.id === 'appointment');
      response = "I'd be happy to help you schedule an appointment. What date and time works for you?";
    }
    else if (lowerMessage.includes('bye') || lowerMessage.includes('thank')) {
      response = "Thank you for calling ClerkTree! Is there anything else I can help you with?";
    }
    else {
      const responses = [
        "I understand. Could you tell me more about that?",
        "Thank you for sharing that. How can I best assist you?",
        "I see. Let me make sure I understand - could you elaborate?",
        "Got it. Is there anything specific you'd like help with?",
      ];
      response = responses[Math.floor(Math.random() * responses.length)];
    }

    return {
      text: response,
      extractedFields: newFields.length > 0 ? newFields : undefined,
      suggestedCategory,
      suggestedPriority,
      confidence: 0.85,
    };
  }

  /**
   * Mock summary generator (fallback)
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

    userMessages.forEach((msg, index) => {
      if (msg.text.length > 20 && index < 5) {
        mainPoints.push(msg.text.substring(0, 100) + (msg.text.length > 100 ? '...' : ''));
      }
    });

    extractedFields.forEach(field => {
      if (field.value) {
        mainPoints.push(`${field.label}: ${field.value}`);
      }
    });

    if (category) tags.push(category.id);
    if (priority === 'critical' || priority === 'high') tags.push('follow-up-needed');

    const allText = messages.map(m => m.text).join(' ').toLowerCase();
    let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
    if (allText.includes('thank') || allText.includes('great')) {
      sentiment = 'positive';
    } else if (allText.includes('frustrated') || allText.includes('angry')) {
      sentiment = 'negative';
    }

    if (priority === 'critical' || priority === 'high') {
      actionItems.push({
        id: `action-${Date.now()}`,
        text: 'Follow up with caller',
        completed: false,
      });
    }

    return {
      summary: {
        mainPoints: mainPoints.length > 0 ? mainPoints : ['Call completed'],
        sentiment,
        actionItems,
        followUpRequired: priority === 'critical' || priority === 'high',
        notes: 'Summary auto-generated.',
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
    priorityRules: string[]
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
