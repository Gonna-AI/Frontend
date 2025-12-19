/**
 * AI Service Layer - Prepared for Gemini API Integration
 * 
 * This service provides a clean interface for AI operations.
 * Currently uses mock responses, but structured for easy Gemini integration.
 * 
 * To integrate with Gemini:
 * 1. Add your Gemini API key to environment variables
 * 2. Install @google/generative-ai package
 * 3. Replace mock implementations with actual API calls
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

// Configuration for Gemini API (to be filled when integrating)
interface AIConfig {
  apiKey?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
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
  private config: AIConfig = {};
  private knowledgeBase: KnowledgeBaseConfig | null = null;

  /**
   * Initialize the AI service with configuration
   */
  initialize(config: AIConfig) {
    this.config = config;
    // TODO: Initialize Gemini client when API key is provided
    // const genAI = new GoogleGenerativeAI(config.apiKey);
    // this.model = genAI.getGenerativeModel({ model: config.model || 'gemini-pro' });
  }

  /**
   * Set the knowledge base configuration for context
   */
  setKnowledgeBase(kb: KnowledgeBaseConfig) {
    this.knowledgeBase = kb;
  }

  /**
   * Generate a response to user input
   * 
   * TODO: Replace with Gemini API call:
   * const prompt = this.buildPrompt(userMessage, conversationHistory);
   * const result = await this.model.generateContent(prompt);
   * return this.parseResponse(result);
   */
  async generateResponse(
    userMessage: string,
    conversationHistory: CallMessage[],
    extractedFields: ExtractedField[]
  ): Promise<AIResponse> {
    // Simulate API delay
    await this.delay(300 + Math.random() * 400);

    const kb = this.knowledgeBase;
    const lowerMessage = userMessage.toLowerCase();

    // Mock intelligent responses based on context
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
    // Handle greetings
    else if (conversationHistory.length <= 1 && (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey'))) {
      response = kb?.greeting || "Hello! Thank you for calling. How may I assist you today?";
    }
    // Detect urgency
    else if (lowerMessage.includes('urgent') || lowerMessage.includes('emergency') || lowerMessage.includes('critical') || lowerMessage.includes('asap')) {
      suggestedPriority = lowerMessage.includes('emergency') ? 'critical' : 'high';
      newFields.push({
        id: 'urgency',
        label: 'Urgency Level',
        value: suggestedPriority === 'critical' ? 'Emergency' : 'Very Urgent',
        confidence: 0.92,
        extractedAt: new Date(),
      });
      response = "I understand this is urgent. Let me prioritize your request. Can you tell me more about the situation?";
    }
    // Detect support needs
    else if (lowerMessage.includes('help') || lowerMessage.includes('issue') || lowerMessage.includes('problem') || lowerMessage.includes('not working')) {
      suggestedCategory = kb?.categories.find(c => c.id === 'support');
      newFields.push({
        id: 'purpose',
        label: 'Call Purpose',
        value: 'Technical Support Request',
        confidence: 0.88,
        extractedAt: new Date(),
      });
      response = "I'm sorry to hear you're experiencing issues. Could you describe the problem in more detail so I can assist you better?";
    }
    // Detect appointment requests
    else if (lowerMessage.includes('appointment') || lowerMessage.includes('schedule') || lowerMessage.includes('book') || lowerMessage.includes('meeting')) {
      suggestedCategory = kb?.categories.find(c => c.id === 'appointment');
      newFields.push({
        id: 'purpose',
        label: 'Call Purpose',
        value: 'Appointment Scheduling',
        confidence: 0.94,
        extractedAt: new Date(),
      });
      response = "I'd be happy to help you schedule an appointment. What date and time would work best for you?";
    }
    // Detect complaints
    else if (lowerMessage.includes('complaint') || lowerMessage.includes('frustrated') || lowerMessage.includes('unacceptable') || lowerMessage.includes('terrible')) {
      suggestedCategory = kb?.categories.find(c => c.id === 'complaint');
      suggestedPriority = 'high';
      response = "I sincerely apologize for the frustration you're experiencing. Your feedback is important to us. Please tell me what happened so I can help resolve this.";
    }
    // Detect pricing/sales inquiries
    else if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('pricing') || lowerMessage.includes('how much')) {
      suggestedCategory = kb?.categories.find(c => c.id === 'sales');
      newFields.push({
        id: 'purpose',
        label: 'Call Purpose',
        value: 'Pricing Inquiry',
        confidence: 0.91,
        extractedAt: new Date(),
      });
      response = "I'd be happy to provide pricing information. Could you tell me a bit more about what you're looking for so I can give you the most relevant options?";
    }
    // Handle goodbye
    else if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye') || lowerMessage.includes('thank')) {
      response = "Thank you for calling ClerkTree! Is there anything else I can help you with before we end the call?";
    }
    // Default intelligent response
    else {
      const responses = [
        "I understand. Could you tell me more about that?",
        "Thank you for sharing that information. How can I best assist you with this?",
        "I see. Let me make sure I understand correctly - could you elaborate on that?",
        "Got it. Is there anything specific you'd like me to help you with regarding this?",
        "I appreciate you explaining that. What would be the ideal outcome for you?",
      ];
      response = responses[Math.floor(Math.random() * responses.length)];
    }

    return {
      text: response,
      extractedFields: newFields.length > 0 ? newFields : undefined,
      suggestedCategory,
      suggestedPriority,
      confidence: 0.85 + Math.random() * 0.1,
    };
  }

  /**
   * Extract fields from conversation
   */
  async extractFields(
    messages: CallMessage[],
    fieldDefinitions: KnowledgeBaseConfig['contextFields']
  ): Promise<FieldExtractionResponse> {
    await this.delay(200);

    const fields: ExtractedField[] = [];
    const allText = messages.map(m => m.text).join(' ');

    // Extract name
    const nameMatch = allText.match(/(?:my name is|i'm|i am|this is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
    if (nameMatch) {
      fields.push({
        id: 'name',
        label: 'Caller Name',
        value: nameMatch[1],
        confidence: 0.95,
        extractedAt: new Date(),
      });
    }

    // Extract email
    const emailMatch = allText.match(/[\w.-]+@[\w.-]+\.\w+/);
    if (emailMatch) {
      fields.push({
        id: 'contact',
        label: 'Contact Info',
        value: emailMatch[0],
        confidence: 0.99,
        extractedAt: new Date(),
      });
    }

    // Extract phone
    const phoneMatch = allText.match(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/);
    if (phoneMatch) {
      fields.push({
        id: 'contact',
        label: 'Contact Info',
        value: phoneMatch[0],
        confidence: 0.98,
        extractedAt: new Date(),
      });
    }

    return {
      fields,
      confidence: fields.length > 0 ? 0.9 : 0.5,
    };
  }

  /**
   * Predict call category based on conversation
   */
  async predictCategory(
    messages: CallMessage[],
    categories: CallCategory[]
  ): Promise<CategoryPrediction> {
    await this.delay(150);

    const allText = messages.map(m => m.text).join(' ').toLowerCase();

    // Simple keyword-based prediction (to be replaced with Gemini)
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
    if (allText.includes('price') || allText.includes('cost')) {
      return {
        category: categories.find(c => c.id === 'sales') || categories[0],
        confidence: 0.87,
        reasoning: 'Pricing inquiry detected',
      };
    }

    return {
      category: categories.find(c => c.id === 'inquiry') || categories[0],
      confidence: 0.7,
      reasoning: 'General inquiry based on context',
    };
  }

  /**
   * Predict priority level based on conversation
   */
  async predictPriority(
    messages: CallMessage[],
    priorityRules: string[]
  ): Promise<PriorityPrediction> {
    await this.delay(150);

    const allText = messages.map(m => m.text).join(' ').toLowerCase();

    if (allText.includes('emergency') || allText.includes('critical') || allText.includes('life')) {
      return {
        priority: 'critical',
        confidence: 0.95,
        reasoning: 'Emergency keywords detected',
      };
    }
    if (allText.includes('urgent') || allText.includes('asap') || allText.includes('frustrated')) {
      return {
        priority: 'high',
        confidence: 0.88,
        reasoning: 'Urgency indicators found',
      };
    }
    if (allText.includes('when you can') || allText.includes('no rush')) {
      return {
        priority: 'low',
        confidence: 0.82,
        reasoning: 'Low urgency indicators',
      };
    }

    return {
      priority: 'medium',
      confidence: 0.75,
      reasoning: 'Standard priority based on context',
    };
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
    await this.delay(400);

    const userMessages = messages.filter(m => m.speaker === 'user');
    const mainPoints: string[] = [];
    const tags: string[] = [];
    const actionItems: ActionItem[] = [];

    // Extract main points from user messages
    userMessages.forEach((msg, index) => {
      if (msg.text.length > 20 && index < 5) {
        mainPoints.push(msg.text.substring(0, 100) + (msg.text.length > 100 ? '...' : ''));
      }
    });

    // Add extracted field info to points
    extractedFields.forEach(field => {
      if (field.value) {
        mainPoints.push(`${field.label}: ${field.value}`);
      }
    });

    // Generate tags
    if (category) tags.push(category.id);
    if (priority === 'critical' || priority === 'high') tags.push('follow-up-needed');

    // Determine sentiment
    const allText = messages.map(m => m.text).join(' ').toLowerCase();
    let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
    if (allText.includes('thank') || allText.includes('great') || allText.includes('appreciate')) {
      sentiment = 'positive';
    } else if (allText.includes('frustrated') || allText.includes('angry') || allText.includes('terrible')) {
      sentiment = 'negative';
    }

    // Generate action items
    if (priority === 'critical' || priority === 'high') {
      actionItems.push({
        id: `action-${Date.now()}`,
        text: 'Follow up with caller',
        completed: false,
      });
    }
    if (allText.includes('appointment') || allText.includes('schedule')) {
      actionItems.push({
        id: `action-${Date.now()}-1`,
        text: 'Schedule appointment as discussed',
        completed: false,
      });
    }

    return {
      summary: {
        mainPoints: mainPoints.length > 0 ? mainPoints : ['Call completed'],
        sentiment,
        actionItems,
        followUpRequired: priority === 'critical' || priority === 'high',
        notes: 'Summary auto-generated. Review and edit as needed.',
      },
      tags,
    };
  }

  /**
   * Build prompt for Gemini (prepared for future use)
   */
  private buildPrompt(
    userMessage: string,
    conversationHistory: CallMessage[],
    extractedFields: ExtractedField[]
  ): string {
    const kb = this.knowledgeBase;
    if (!kb) return userMessage;

    return `
${kb.systemPrompt}

PERSONA: ${kb.persona}

CONTEXT FIELDS TO COLLECT:
${kb.contextFields.map(f => `- ${f.name}: ${f.description}${f.required ? ' (Required)' : ''}`).join('\n')}

AVAILABLE CATEGORIES:
${kb.categories.map(c => `- ${c.name}: ${c.description}`).join('\n')}

PRIORITY RULES:
${kb.priorityRules.join('\n')}

CUSTOM INSTRUCTIONS:
${kb.customInstructions.join('\n')}

${kb.responseGuidelines}

ALREADY EXTRACTED INFORMATION:
${extractedFields.map(f => `- ${f.label}: ${f.value}`).join('\n') || 'None yet'}

CONVERSATION HISTORY:
${conversationHistory.map(m => `${m.speaker.toUpperCase()}: ${m.text}`).join('\n')}

USER: ${userMessage}

Respond appropriately while following the guidelines above. Also identify any new information that can be extracted and suggest category/priority if clear.
    `.trim();
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const aiService = new AIService();

// Export types for components
export type { AIConfig };

