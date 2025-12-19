/**
 * AI Service Layer - Smart Conversation Handler
 * 
 * This service provides AI operations with a smart mock fallback
 * that properly tracks conversation state and extracts information.
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
   * Generate a response to user input using Gemini or smart mock
   */
  async generateResponse(
    userMessage: string,
    conversationHistory: CallMessage[],
    extractedFields: ExtractedField[]
  ): Promise<AIResponse> {
    const kb = this.knowledgeBase;
    
    if (!kb) {
      console.warn('Knowledge base not set, using default responses');
      return this.smartMockResponse(userMessage, conversationHistory, extractedFields);
    }

    // Try Gemini first
    if (this.config.useGemini && (this.geminiAvailable !== false)) {
      try {
        console.log('Calling Gemini API for response...');
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
        this.geminiAvailable = false; // Mark as unavailable to avoid repeated failures
        if (this.config.fallbackToMock) {
          console.log('Falling back to smart mock response');
          return this.smartMockResponse(userMessage, conversationHistory, extractedFields);
        }
        throw error;
      }
    }

    // Use smart mock response
    return this.smartMockResponse(userMessage, conversationHistory, extractedFields);
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

    if (this.config.useGemini && this.geminiAvailable) {
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
   * Smart mock response generator with conversation state tracking
   */
  private async smartMockResponse(
    userMessage: string,
    conversationHistory: CallMessage[],
    existingFields: ExtractedField[]
  ): Promise<AIResponse> {
    await this.delay(300 + Math.random() * 400);

    const kb = this.knowledgeBase;
    const lowerMessage = userMessage.toLowerCase().trim();
    const state = this.conversationState;
    
    // Update state from existing fields
    const nameField = existingFields.find(f => f.id === 'name');
    const purposeField = existingFields.find(f => f.id === 'purpose');
    
    if (nameField?.value) {
      state.hasName = true;
      state.callerName = nameField.value;
    }
    if (purposeField?.value) {
      state.hasPurpose = true;
      state.purpose = purposeField.value;
    }
    
    state.turnCount++;
    
    let response = '';
    const newFields: ExtractedField[] = [];
    let suggestedPriority: PriorityLevel | undefined;
    let suggestedCategory: CallCategory | undefined;

    // Extract name from various patterns
    const namePatterns = [
      /(?:my name is|i'm|i am|this is|call me)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
      /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)$/i, // Just a name by itself
      /^hi,?\s*(?:i'm|this is)\s+([A-Z][a-z]+)/i,
    ];
    
    for (const pattern of namePatterns) {
      const match = userMessage.match(pattern);
      if (match && !state.hasName) {
        const extractedName = match[1].trim();
        // Validate it's a reasonable name (not common words)
        const commonWords = ['hello', 'hi', 'hey', 'yes', 'no', 'okay', 'sure', 'thanks', 'thank'];
        if (!commonWords.includes(extractedName.toLowerCase()) && extractedName.length > 1) {
          state.hasName = true;
          state.callerName = extractedName;
          newFields.push({
            id: 'name',
            label: 'Caller Name',
            value: extractedName,
            confidence: 0.95,
            extractedAt: new Date(),
          });
        }
      }
    }

    // Detect urgency keywords
    if (lowerMessage.includes('urgent') || lowerMessage.includes('emergency') || 
        lowerMessage.includes('asap') || lowerMessage.includes('immediately') ||
        lowerMessage.includes('critical') || lowerMessage.includes('right now')) {
      state.detectedUrgency = lowerMessage.includes('emergency') ? 'critical' : 'high';
      suggestedPriority = state.detectedUrgency;
      newFields.push({
        id: 'urgency',
        label: 'Urgency Level',
        value: state.detectedUrgency === 'critical' ? 'Emergency' : 'Urgent',
        confidence: 0.92,
        extractedAt: new Date(),
      });
    }

    // Detect category from keywords
    if (!state.detectedCategory) {
      if (lowerMessage.includes('appointment') || lowerMessage.includes('schedule') || 
          lowerMessage.includes('book') || lowerMessage.includes('meeting')) {
        state.detectedCategory = 'appointment';
        suggestedCategory = kb?.categories.find(c => c.id === 'appointment');
      } else if (lowerMessage.includes('complaint') || lowerMessage.includes('frustrated') ||
                 lowerMessage.includes('angry') || lowerMessage.includes('terrible')) {
        state.detectedCategory = 'complaint';
        suggestedCategory = kb?.categories.find(c => c.id === 'complaint');
        suggestedPriority = suggestedPriority || 'high';
      } else if (lowerMessage.includes('help') || lowerMessage.includes('issue') ||
                 lowerMessage.includes('problem') || lowerMessage.includes('not working') ||
                 lowerMessage.includes('broken') || lowerMessage.includes('error')) {
        state.detectedCategory = 'support';
        suggestedCategory = kb?.categories.find(c => c.id === 'support');
      } else if (lowerMessage.includes('price') || lowerMessage.includes('cost') ||
                 lowerMessage.includes('pricing') || lowerMessage.includes('quote')) {
        state.detectedCategory = 'sales';
        suggestedCategory = kb?.categories.find(c => c.id === 'sales');
      } else if (lowerMessage.includes('feedback') || lowerMessage.includes('suggestion') ||
                 lowerMessage.includes('improve')) {
        state.detectedCategory = 'feedback';
        suggestedCategory = kb?.categories.find(c => c.id === 'feedback');
      }
    }

    // Extract purpose from the message
    if (!state.hasPurpose && state.turnCount > 1) {
      // Look for purpose indicators
      const purposePatterns = [
        /(?:i need|i want|i'm calling about|i'm looking for|i have a|can you help with)\s+(.+?)(?:\.|$)/i,
        /(?:problem with|issue with|question about|interested in)\s+(.+?)(?:\.|$)/i,
      ];
      
      for (const pattern of purposePatterns) {
        const match = userMessage.match(pattern);
        if (match) {
          state.hasPurpose = true;
          state.purpose = match[1].trim();
          newFields.push({
            id: 'purpose',
            label: 'Call Purpose',
            value: state.purpose,
            confidence: 0.85,
            extractedAt: new Date(),
          });
          break;
        }
      }
      
      // If we have a category but no explicit purpose, use the message as purpose
      if (!state.hasPurpose && state.detectedCategory && userMessage.length > 10) {
        state.hasPurpose = true;
        state.purpose = userMessage.substring(0, 100);
        newFields.push({
          id: 'purpose',
          label: 'Call Purpose',
          value: state.purpose,
          confidence: 0.75,
          extractedAt: new Date(),
        });
      }
    }

    // Generate contextual response based on conversation state
    const callerName = state.callerName;
    const namePrefix = callerName ? `${callerName}, ` : '';

    // Check for goodbye/end signals
    const endSignals = ['bye', 'goodbye', 'that\'s all', 'that is all', 'nothing else', 
                        'no thanks', 'thank you', 'thanks', 'that\'s it', 'all set', 'i\'m good'];
    const isEndingCall = endSignals.some(signal => lowerMessage.includes(signal));

    // Check for greetings
    const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'];
    const isGreeting = greetings.some(g => lowerMessage.startsWith(g));

    if (isEndingCall && state.turnCount > 2) {
      // User wants to end the call
      state.isWrappingUp = true;
      const closingResponses = [
        `${namePrefix}Thank you for calling ClerkTree today! Is there anything else I can help you with before we end the call?`,
        `Great talking with you${callerName ? `, ${callerName}` : ''}! If you need any further assistance, don't hesitate to call back. Have a wonderful day!`,
        `${namePrefix}I'm glad I could assist you today. Feel free to reach out if you have any more questions. Take care!`,
      ];
      response = state.hasAskedAnythingElse 
        ? closingResponses[1] 
        : closingResponses[0];
      state.hasAskedAnythingElse = true;
    } else if (isGreeting && state.turnCount <= 2) {
      // Responding to greeting - ask for name if we don't have it
      if (!state.hasName) {
        response = "Hello! Thank you for calling ClerkTree. May I have your name please?";
      } else {
        response = `Hello ${callerName}! How can I help you today?`;
      }
      state.hasGreeted = true;
    } else if (!state.hasName && state.turnCount <= 3) {
      // We need the caller's name first
      response = "Before we continue, may I have your name please?";
    } else if (state.hasName && !state.hasPurpose && state.turnCount <= 4) {
      // We have name but need purpose
      response = `${namePrefix}how may I assist you today? What brings you to ClerkTree?`;
    } else if (state.hasPurpose && !state.hasAskedAnythingElse && state.turnCount >= 4) {
      // We have both name and purpose, provide help then ask if anything else
      const helpResponses = [
        `${namePrefix}I understand you're reaching out about ${state.purpose}. I've noted that down and we'll make sure to address this for you. Is there anything else you'd like to add?`,
        `Thank you for explaining that${callerName ? `, ${callerName}` : ''}. I've captured the details about ${state.purpose}. Our team will follow up on this. Is there anything else I can help with?`,
        `${namePrefix}I've documented your concern regarding ${state.purpose}. We take this seriously and will ensure it's addressed. Is there any other information you'd like to share?`,
      ];
      response = helpResponses[Math.floor(Math.random() * helpResponses.length)];
      state.hasAskedAnythingElse = true;
    } else {
      // Continue conversation naturally based on what they said
      if (lowerMessage.includes('yes') || lowerMessage.includes('actually') || 
          lowerMessage.includes('also') || lowerMessage.includes('one more')) {
        response = `${namePrefix}of course! Please go ahead, I'm listening.`;
        state.hasAskedAnythingElse = false; // They have more to say
      } else if (lowerMessage.includes('no') && state.hasAskedAnythingElse) {
        response = `${namePrefix}Perfect! Thank you for calling ClerkTree today. If you have any questions in the future, don't hesitate to reach out. Have a great day!`;
        state.isWrappingUp = true;
      } else if (state.detectedUrgency === 'critical' || state.detectedUrgency === 'high') {
        response = `${namePrefix}I understand this is urgent. I'm marking this as a high priority and our team will address this immediately. Can you provide any additional details that might help us resolve this faster?`;
      } else if (state.detectedCategory === 'appointment') {
        response = `${namePrefix}I'd be happy to help you with scheduling. What date and time works best for you?`;
      } else if (state.detectedCategory === 'complaint') {
        response = `${namePrefix}I sincerely apologize for any inconvenience you've experienced. Your feedback is important to us. Can you tell me more about what happened so we can make it right?`;
      } else if (state.detectedCategory === 'support') {
        response = `${namePrefix}I'm sorry you're experiencing this issue. Let me help you troubleshoot. Can you describe what's happening in more detail?`;
      } else if (userMessage.length > 5) {
        // Generic but varied responses for other messages
        const contextualResponses = [
          `${namePrefix}I see. That's helpful information. Let me make a note of that. Is there anything specific you'd like us to do about this?`,
          `Thank you for sharing that${callerName ? `, ${callerName}` : ''}. I want to make sure I understand correctly - could you elaborate a bit more?`,
          `${namePrefix}Got it. I'm documenting this for our records. What outcome are you hoping for?`,
          `${namePrefix}I appreciate you explaining that. Is there a preferred way you'd like us to follow up with you?`,
        ];
        response = contextualResponses[state.turnCount % contextualResponses.length];
      } else {
        // Very short response - ask for clarification
        response = `${namePrefix}could you tell me more about that?`;
      }
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

    // Get caller name and purpose from extracted fields
    const callerName = extractedFields.find(f => f.id === 'name')?.value;
    const purpose = extractedFields.find(f => f.id === 'purpose')?.value;

    if (callerName) {
      mainPoints.push(`Caller: ${callerName}`);
    }
    if (purpose) {
      mainPoints.push(`Purpose: ${purpose}`);
    }

    // Add key message snippets
    userMessages.slice(0, 3).forEach((msg) => {
      if (msg.text.length > 15) {
        mainPoints.push(msg.text.substring(0, 80) + (msg.text.length > 80 ? '...' : ''));
      }
    });

    // Add any other extracted fields
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

    // Detect sentiment from messages
    const allText = messages.map(m => m.text).join(' ').toLowerCase();
    let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
    
    const positiveWords = ['thank', 'great', 'awesome', 'excellent', 'appreciate', 'helpful', 'wonderful'];
    const negativeWords = ['frustrated', 'angry', 'terrible', 'awful', 'disappointed', 'upset', 'worst'];
    
    const positiveCount = positiveWords.filter(w => allText.includes(w)).length;
    const negativeCount = negativeWords.filter(w => allText.includes(w)).length;
    
    if (positiveCount > negativeCount) sentiment = 'positive';
    else if (negativeCount > positiveCount) sentiment = 'negative';

    // Generate action items based on context
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

    // Generate notes
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
