/**
 * Gemini AI Service for ClerkTree Call Agent
 * 
 * This service provides direct integration with Google's Gemini 2.0 Flash Lite model
 * for conversation analysis, summarization, categorization, and priority tagging.
 */

import { CallMessage, ExtractedField, CallCategory, PriorityLevel, KnowledgeBaseConfig } from '../contexts/DemoCallContext';

// Gemini API configuration
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = 'models/gemini-flash-lite-latest';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

// Types for Gemini API responses
interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
        functionCall?: {
          name: string;
          args: Record<string, unknown>;
        };
      }>;
    };
    finishReason?: string;
  }>;
  error?: {
    message: string;
    code: number;
  };
}

// Tool definitions for Gemini function calling
const GEMINI_TOOLS = {
  tools: [
    {
      functionDeclarations: [
        {
          name: "extract_call_info",
          description: "Extract structured information from the conversation including caller details, purpose, and urgency",
          parameters: {
            type: "object",
            properties: {
              callerName: {
                type: "string",
                description: "The name of the caller if mentioned"
              },
              contactInfo: {
                type: "string",
                description: "Phone number or email if provided"
              },
              callPurpose: {
                type: "string",
                description: "The main reason for the call"
              },
              urgencyLevel: {
                type: "string",
                enum: ["low", "medium", "high", "critical"],
                description: "How urgent is the caller's issue"
              },
              additionalFields: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    fieldName: { type: "string" },
                    fieldValue: { type: "string" },
                    confidence: { type: "number" }
                  }
                },
                description: "Any other relevant information extracted"
              }
            },
            required: ["callPurpose"]
          }
        },
        {
          name: "categorize_call",
          description: "Categorize the call based on its content and purpose",
          parameters: {
            type: "object",
            properties: {
              categoryId: {
                type: "string",
                description: "The ID of the matching category"
              },
              categoryName: {
                type: "string",
                description: "The name of the category"
              },
              confidence: {
                type: "number",
                description: "Confidence score 0-1"
              },
              reasoning: {
                type: "string",
                description: "Brief explanation for the categorization"
              }
            },
            required: ["categoryId", "categoryName", "confidence"]
          }
        },
        {
          name: "set_priority",
          description: "Set the priority level for this call based on urgency and importance",
          parameters: {
            type: "object",
            properties: {
              priority: {
                type: "string",
                enum: ["low", "medium", "high", "critical"],
                description: "Priority level"
              },
              reasoning: {
                type: "string",
                description: "Brief explanation for the priority"
              },
              followUpRequired: {
                type: "boolean",
                description: "Whether a follow-up is needed"
              },
              suggestedActions: {
                type: "array",
                items: { type: "string" },
                description: "Recommended actions to take"
              }
            },
            required: ["priority", "followUpRequired"]
          }
        },
        {
          name: "summarize_call",
          description: "Generate a summary of the call conversation",
          parameters: {
            type: "object",
            properties: {
              summary: {
                type: "string",
                description: "Brief overall summary of the call"
              },
              mainPoints: {
                type: "array",
                items: { type: "string" },
                description: "Key points from the conversation"
              },
              sentiment: {
                type: "string",
                enum: ["positive", "neutral", "negative"],
                description: "Overall sentiment of the caller"
              },
              actionItems: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    task: { type: "string" },
                    priority: { type: "string" }
                  }
                },
                description: "Action items resulting from the call"
              },
              notes: {
                type: "string",
                description: "Additional notes for the agent"
              }
            },
            required: ["summary", "mainPoints", "sentiment"]
          }
        },
        {
          name: "generate_response",
          description: "Generate an appropriate response for the AI agent to say",
          parameters: {
            type: "object",
            properties: {
              response: {
                type: "string",
                description: "The response text for the AI agent"
              },
              intent: {
                type: "string",
                description: "The intent behind the response (greeting, clarification, solution, closing)"
              },
              shouldAskFollowUp: {
                type: "boolean",
                description: "Whether to ask a follow-up question"
              },
              suggestedFollowUp: {
                type: "string",
                description: "A follow-up question if applicable"
              }
            },
            required: ["response"]
          }
        }
      ]
    }
  ]
};

// Helper to format messages for Gemini
function formatMessagesForGemini(messages: CallMessage[]): string {
  return messages.map(m => {
    const speaker = m.speaker === 'agent' ? 'AI Agent' : 'Caller';
    return `${speaker}: ${m.text}`;
  }).join('\n');
}

// Build system prompt from Knowledge Base config
function buildSystemPrompt(config: KnowledgeBaseConfig): string {
  const categoryList = config.categories.map(c => `- ${c.name}: ${c.description}`).join('\n');
  const fieldsList = config.contextFields.map(f => `- ${f.name}${f.required ? ' (required)' : ''}: ${f.description}`).join('\n');
  const rulesList = config.priorityRules.map((r, i) => `${i + 1}. ${r}`).join('\n');
  const instructionsList = config.customInstructions.map((inst, i) => `${i + 1}. ${inst}`).join('\n');

  return `${config.systemPrompt}

PERSONA: ${config.persona}

OPENING GREETING: ${config.greeting}

RESPONSE GUIDELINES:
${config.responseGuidelines}

AVAILABLE CATEGORIES FOR CLASSIFICATION:
${categoryList}

INFORMATION TO EXTRACT FROM CONVERSATIONS:
${fieldsList}

PRIORITY RULES:
${rulesList}

CUSTOM INSTRUCTIONS:
${instructionsList}

When analyzing conversations:
1. Use the extract_call_info function to pull out relevant information
2. Use categorize_call to classify the conversation
3. Use set_priority to determine urgency based on the rules above
4. Use summarize_call to create a summary after the call ends
5. Use generate_response to create appropriate responses during the call`;
}

// Main API call function
async function callGeminiAPI(
  prompt: string,
  systemPrompt: string,
  useFunctionCalling: boolean = true
): Promise<GeminiResponse> {
  const requestBody: Record<string, unknown> = {
    contents: [
      {
        parts: [
          { text: `${systemPrompt}\n\n${prompt}` }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 2048,
    }
  };

  if (useFunctionCalling) {
    requestBody.tools = GEMINI_TOOLS.tools;
    requestBody.toolConfig = {
      functionCallingConfig: {
        mode: "AUTO"
      }
    };
  }

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      throw new Error(errorData.error?.message || 'Gemini API request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
}

// Parse function call responses
function parseFunctionCalls(response: GeminiResponse): Array<{ name: string; args: Record<string, unknown> }> {
  const functionCalls: Array<{ name: string; args: Record<string, unknown> }> = [];
  
  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.functionCall) {
        functionCalls.push({
          name: part.functionCall.name,
          args: part.functionCall.args
        });
      }
    }
  }
  
  return functionCalls;
}

// Get text response
function getTextResponse(response: GeminiResponse): string {
  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.text) {
        return part.text;
      }
    }
  }
  return '';
}

// ============ PUBLIC API ============

export interface AIAnalysisResult {
  response: string;
  extractedFields: ExtractedField[];
  suggestedCategory?: {
    id: string;
    name: string;
    confidence: number;
  };
  suggestedPriority?: PriorityLevel;
  followUpRequired?: boolean;
  actionItems?: string[];
}

export interface CallSummaryResult {
  summary: string;
  mainPoints: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  actionItems: Array<{ task: string; priority: string }>;
  notes: string;
  category?: {
    id: string;
    name: string;
  };
  priority: PriorityLevel;
  followUpRequired: boolean;
}

/**
 * Generate an AI response during a call
 */
export async function generateCallResponse(
  userMessage: string,
  conversationHistory: CallMessage[],
  knowledgeBase: KnowledgeBaseConfig,
  existingExtractedFields?: ExtractedField[]
): Promise<AIAnalysisResult> {
  const systemPrompt = buildSystemPrompt(knowledgeBase);
  const conversationContext = formatMessagesForGemini(conversationHistory);
  
  // Format already extracted information so AI knows what it has
  const extractedInfo = existingExtractedFields && existingExtractedFields.length > 0
    ? existingExtractedFields.map(f => `- ${f.label}: ${f.value}`).join('\n')
    : 'None yet';
  
  // Determine if this is the first message or a continuation
  const isFirstMessage = conversationHistory.length === 0;
  const callerNameKnown = existingExtractedFields?.some(f => f.id === 'name' || f.label.toLowerCase().includes('name'));
  
  const prompt = `
CONVERSATION SO FAR:
${conversationContext || '(This is the start of the call)'}

ALREADY EXTRACTED INFORMATION:
${extractedInfo}

LATEST MESSAGE FROM CALLER:
"${userMessage}"

IMPORTANT RULES:
${isFirstMessage ? '- This is the START of the call. You may use your greeting.' : '- This is NOT the first message. DO NOT repeat your greeting.'}
${callerNameKnown ? '- The caller\'s name is ALREADY KNOWN. DO NOT ask for their name again.' : '- If you don\'t have the caller\'s name yet, you may ask for it naturally.'}
- DO NOT say "Hello" or "How can I help you" repeatedly if the conversation has already started.
- Continue the conversation naturally based on what has been discussed.
- If the caller just provided their name, acknowledge it and move on to help them.
- Reference information you already know about the caller when appropriate.

Analyze this message and:
1. Generate an appropriate, contextual response using generate_response
2. Extract any NEW information using extract_call_info (skip fields already extracted)
3. If you can determine the category, use categorize_call
4. If urgency indicators are present, use set_priority

Respond naturally as a helpful AI agent continuing an existing conversation.`;

  try {
    const response = await callGeminiAPI(prompt, systemPrompt, true);
    const functionCalls = parseFunctionCalls(response);
    const textResponse = getTextResponse(response);
    
    const result: AIAnalysisResult = {
      response: '',
      extractedFields: [],
    };

    // Process function calls
    for (const fc of functionCalls) {
      switch (fc.name) {
        case 'generate_response':
          result.response = (fc.args.response as string) || textResponse;
          break;
          
        case 'extract_call_info':
          if (fc.args.callerName) {
            result.extractedFields.push({
              id: 'name',
              label: 'Caller Name',
              value: fc.args.callerName as string,
              confidence: 0.95,
              extractedAt: new Date()
            });
          }
          if (fc.args.contactInfo) {
            result.extractedFields.push({
              id: 'contact',
              label: 'Contact Info',
              value: fc.args.contactInfo as string,
              confidence: 0.9,
              extractedAt: new Date()
            });
          }
          if (fc.args.callPurpose) {
            result.extractedFields.push({
              id: 'purpose',
              label: 'Call Purpose',
              value: fc.args.callPurpose as string,
              confidence: 0.85,
              extractedAt: new Date()
            });
          }
          if (fc.args.additionalFields) {
            const additionalFields = fc.args.additionalFields as Array<{fieldName: string; fieldValue: string; confidence: number}>;
            for (const field of additionalFields) {
              result.extractedFields.push({
                id: `custom-${Date.now()}-${Math.random()}`,
                label: field.fieldName,
                value: field.fieldValue,
                confidence: field.confidence || 0.8,
                extractedAt: new Date()
              });
            }
          }
          break;
          
        case 'categorize_call':
          result.suggestedCategory = {
            id: fc.args.categoryId as string,
            name: fc.args.categoryName as string,
            confidence: (fc.args.confidence as number) || 0.8
          };
          break;
          
        case 'set_priority':
          result.suggestedPriority = fc.args.priority as PriorityLevel;
          result.followUpRequired = fc.args.followUpRequired as boolean;
          if (fc.args.suggestedActions) {
            result.actionItems = fc.args.suggestedActions as string[];
          }
          break;
      }
    }

    // Fallback to text response if no generate_response function call
    if (!result.response && textResponse) {
      result.response = textResponse;
    }

    // Default response if nothing was generated
    if (!result.response) {
      result.response = "I understand. How can I help you further?";
    }

    return result;
  } catch (error) {
    console.error('Error generating call response:', error);
    // Return a fallback response
    return {
      response: "I apologize, but I'm having trouble processing that. Could you please repeat or rephrase?",
      extractedFields: []
    };
  }
}

/**
 * Summarize a completed call
 */
export async function summarizeCall(
  messages: CallMessage[],
  knowledgeBase: KnowledgeBaseConfig,
  existingExtractedFields: ExtractedField[]
): Promise<CallSummaryResult> {
  const systemPrompt = buildSystemPrompt(knowledgeBase);
  const conversationContext = formatMessagesForGemini(messages);
  const existingInfo = existingExtractedFields.map(f => `${f.label}: ${f.value}`).join('\n');
  
  const prompt = `
COMPLETE CALL TRANSCRIPT:
${conversationContext}

ALREADY EXTRACTED INFORMATION:
${existingInfo || 'None yet'}

The call has ended. Please:
1. Use extract_call_info FIRST to extract the caller's name and any missing information (this is critical!)
2. Use summarize_call to create a comprehensive summary
3. Use categorize_call to finalize the category
4. Use set_priority to finalize the priority level

IMPORTANT: If the caller's name was mentioned in the conversation but not yet extracted, you MUST extract it using extract_call_info. The caller name is essential for the call history.

Provide a complete analysis of this call.`;

  try {
    const response = await callGeminiAPI(prompt, systemPrompt, true);
    const functionCalls = parseFunctionCalls(response);
    
    const result: CallSummaryResult = {
      summary: '',
      mainPoints: [],
      sentiment: 'neutral',
      actionItems: [],
      notes: '',
      priority: 'medium',
      followUpRequired: false
    };

    // Process function calls - extract_call_info first to get caller name
    let extractedCallerName: string | null = null;
    
    for (const fc of functionCalls) {
      switch (fc.name) {
        case 'extract_call_info':
          // Extract caller name if provided
          if (fc.args.callerName) {
            extractedCallerName = fc.args.callerName as string;
            console.log('✅ Gemini extracted caller name in summary:', extractedCallerName);
          }
          break;
          
        case 'summarize_call':
          result.summary = (fc.args.summary as string) || '';
          result.mainPoints = (fc.args.mainPoints as string[]) || [];
          result.sentiment = (fc.args.sentiment as 'positive' | 'neutral' | 'negative') || 'neutral';
          result.notes = (fc.args.notes as string) || '';
          // Include caller name in notes if extracted
          if (extractedCallerName && !result.notes.toLowerCase().includes(extractedCallerName.toLowerCase())) {
            result.notes = `Caller: ${extractedCallerName}. ${result.notes}`.trim();
          }
          if (fc.args.actionItems) {
            result.actionItems = (fc.args.actionItems as Array<{task: string; priority: string}>) || [];
          }
          break;
          
        case 'categorize_call':
          result.category = {
            id: fc.args.categoryId as string,
            name: fc.args.categoryName as string
          };
          break;
          
        case 'set_priority':
          result.priority = (fc.args.priority as PriorityLevel) || 'medium';
          result.followUpRequired = (fc.args.followUpRequired as boolean) || false;
          break;
      }
    }

    // Generate default summary if none provided
    if (!result.summary && messages.length > 0) {
      result.summary = `Call with ${messages.length} exchanges. `;
      result.mainPoints = ['Call completed'];
    }

    return result;
  } catch (error) {
    console.error('Error summarizing call:', error);
    return {
      summary: 'Unable to generate summary',
      mainPoints: ['Error during summarization'],
      sentiment: 'neutral',
      actionItems: [],
      notes: 'Automatic summarization failed',
      priority: 'medium',
      followUpRequired: true
    };
  }
}

/**
 * Analyze a single message in real-time
 */
export async function analyzeMessage(
  message: string,
  knowledgeBase: KnowledgeBaseConfig
): Promise<{
  category?: string;
  priority?: PriorityLevel;
  extractedInfo?: Record<string, string>;
}> {
  const systemPrompt = buildSystemPrompt(knowledgeBase);
  
  const prompt = `
Analyze this single message from a caller:
"${message}"

Use the appropriate functions to extract information, determine category, and assess priority.`;

  try {
    const response = await callGeminiAPI(prompt, systemPrompt, true);
    const functionCalls = parseFunctionCalls(response);
    
    const result: {
      category?: string;
      priority?: PriorityLevel;
      extractedInfo?: Record<string, string>;
    } = {};

    for (const fc of functionCalls) {
      if (fc.name === 'categorize_call') {
        result.category = fc.args.categoryName as string;
      }
      if (fc.name === 'set_priority') {
        result.priority = fc.args.priority as PriorityLevel;
      }
      if (fc.name === 'extract_call_info') {
        result.extractedInfo = {};
        if (fc.args.callerName) result.extractedInfo['Caller Name'] = fc.args.callerName as string;
        if (fc.args.callPurpose) result.extractedInfo['Purpose'] = fc.args.callPurpose as string;
        if (fc.args.urgencyLevel) result.extractedInfo['Urgency'] = fc.args.urgencyLevel as string;
      }
    }

    return result;
  } catch (error) {
    console.error('Error analyzing message:', error);
    return {};
  }
}

/**
 * Test the Gemini connection
 */
export async function testGeminiConnection(): Promise<boolean> {
  try {
    const response = await callGeminiAPI(
      'Say "Connection successful" in exactly those words.',
      'You are a test assistant.',
      false
    );
    const text = getTextResponse(response);
    return text.toLowerCase().includes('connection successful') || text.length > 0;
  } catch (error) {
    console.error('Gemini connection test failed:', error);
    return false;
  }
}

// Export for external use
export const geminiService = {
  generateCallResponse,
  summarizeCall,
  analyzeMessage,
  testGeminiConnection,
};

export default geminiService;

