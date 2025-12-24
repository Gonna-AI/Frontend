/**
 * Function Calling Tools Definition
 * 
 * Based on Mistral AI Function Calling specification:
 * https://docs.mistral.ai/capabilities/function_calling
 * 
 * These tools help extract structured data from conversations:
 * - Seriousness/Priority Level
 * - Conversation Summary
 * - Sentiment & Topic Cards
 * - Caller Information
 * - Issue Categories
 */

import { ExtractedField, PriorityLevel, CallCategory } from '../contexts/DemoCallContext';

// ============================================================================
// TOOL DEFINITIONS (JSON Schema format for function calling)
// ============================================================================

export interface FunctionTool {
    type: 'function';
    function: {
        name: string;
        description: string;
        parameters: {
            type: 'object';
            properties: Record<string, {
                type: string;
                description: string;
                enum?: string[];
                items?: { type: string };
            }>;
            required: string[];
        };
    };
}

/**
 * All available tools for the AI to use during conversations
 */
export const conversationTools: FunctionTool[] = [
    {
        type: 'function',
        function: {
            name: 'extract_caller_info',
            description: 'Extract caller information from the conversation including name, contact details, and any identifying information',
            parameters: {
                type: 'object',
                properties: {
                    caller_name: {
                        type: 'string',
                        description: 'Full name of the caller (first name and optionally last name)'
                    },
                    contact_phone: {
                        type: 'string',
                        description: 'Phone number if mentioned'
                    },
                    contact_email: {
                        type: 'string',
                        description: 'Email address if mentioned'
                    },
                    company_organization: {
                        type: 'string',
                        description: 'Company or organization name if mentioned'
                    },
                    caller_role: {
                        type: 'string',
                        description: 'Role or job title if mentioned (e.g., manager, patient, customer)'
                    },
                    reference_number: {
                        type: 'string',
                        description: 'Any reference, case, or account number mentioned'
                    }
                },
                required: ['caller_name']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'assess_seriousness',
            description: 'Assess the seriousness and urgency level of the conversation based on keywords, tone, and context',
            parameters: {
                type: 'object',
                properties: {
                    priority_level: {
                        type: 'string',
                        description: 'The urgency/seriousness level of the conversation',
                        enum: ['critical', 'high', 'medium', 'low']
                    },
                    urgency_indicators: {
                        type: 'array',
                        description: 'List of phrases or indicators that suggest the urgency level',
                        items: { type: 'string' }
                    },
                    reasoning: {
                        type: 'string',
                        description: 'Brief explanation of why this priority level was assigned'
                    },
                    escalation_needed: {
                        type: 'string',
                        description: 'Whether this needs immediate escalation to a human',
                        enum: ['yes', 'no', 'maybe']
                    },
                    time_sensitivity: {
                        type: 'string',
                        description: 'How time-sensitive is this issue',
                        enum: ['immediate', 'today', 'this_week', 'no_rush']
                    }
                },
                required: ['priority_level', 'reasoning']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'analyze_sentiment',
            description: 'Analyze the emotional sentiment and tone of the conversation',
            parameters: {
                type: 'object',
                properties: {
                    overall_sentiment: {
                        type: 'string',
                        description: 'The overall emotional tone of the conversation',
                        enum: ['very_positive', 'positive', 'neutral', 'negative', 'very_negative', 'mixed']
                    },
                    caller_emotion: {
                        type: 'string',
                        description: 'Primary emotion detected from the caller',
                        enum: ['happy', 'satisfied', 'neutral', 'confused', 'frustrated', 'angry', 'anxious', 'sad', 'relieved']
                    },
                    emotion_intensity: {
                        type: 'string',
                        description: 'How strongly the emotion is expressed',
                        enum: ['mild', 'moderate', 'strong', 'extreme']
                    },
                    sentiment_shift: {
                        type: 'string',
                        description: 'If the sentiment changed during the conversation',
                        enum: ['improved', 'worsened', 'stable', 'fluctuating']
                    },
                    key_emotional_phrases: {
                        type: 'array',
                        description: 'Notable phrases that indicate the sentiment',
                        items: { type: 'string' }
                    }
                },
                required: ['overall_sentiment', 'caller_emotion']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'identify_issue_topics',
            description: 'Identify the main topics and issues discussed in the conversation',
            parameters: {
                type: 'object',
                properties: {
                    primary_topic: {
                        type: 'string',
                        description: 'The main topic or issue of the call'
                    },
                    secondary_topics: {
                        type: 'array',
                        description: 'Other topics mentioned during the call',
                        items: { type: 'string' }
                    },
                    issue_category: {
                        type: 'string',
                        description: 'The category this issue falls into',
                        enum: ['inquiry', 'support', 'complaint', 'appointment', 'feedback', 'sales', 'billing', 'technical', 'other']
                    },
                    issue_description: {
                        type: 'string',
                        description: 'A brief description of the main issue or request'
                    },
                    resolution_status: {
                        type: 'string',
                        description: 'Whether the issue was resolved during the call',
                        enum: ['resolved', 'partially_resolved', 'unresolved', 'needs_followup', 'escalated']
                    },
                    keywords: {
                        type: 'array',
                        description: 'Key terms and keywords from the conversation',
                        items: { type: 'string' }
                    }
                },
                required: ['primary_topic', 'issue_category', 'issue_description']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'generate_summary',
            description: 'Generate a comprehensive summary of the entire conversation',
            parameters: {
                type: 'object',
                properties: {
                    brief_summary: {
                        type: 'string',
                        description: 'A 1-2 sentence summary of the call'
                    },
                    detailed_summary: {
                        type: 'string',
                        description: 'A detailed summary including all key points discussed'
                    },
                    main_points: {
                        type: 'array',
                        description: 'List of main points discussed',
                        items: { type: 'string' }
                    },
                    action_items: {
                        type: 'array',
                        description: 'List of action items or follow-up tasks',
                        items: { type: 'string' }
                    },
                    outcome: {
                        type: 'string',
                        description: 'The outcome or result of the conversation'
                    },
                    follow_up_required: {
                        type: 'string',
                        description: 'Whether follow-up is needed',
                        enum: ['yes', 'no', 'maybe']
                    },
                    follow_up_notes: {
                        type: 'string',
                        description: 'Notes about what follow-up is needed if any'
                    }
                },
                required: ['brief_summary', 'main_points', 'outcome']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'extract_requirements',
            description: 'Extract specific requirements, requests, or needs expressed by the caller',
            parameters: {
                type: 'object',
                properties: {
                    explicit_requests: {
                        type: 'array',
                        description: 'Direct requests made by the caller',
                        items: { type: 'string' }
                    },
                    implicit_needs: {
                        type: 'array',
                        description: 'Implied needs that weren\'t directly stated',
                        items: { type: 'string' }
                    },
                    preferences: {
                        type: 'array',
                        description: 'Preferences expressed by the caller',
                        items: { type: 'string' }
                    },
                    constraints: {
                        type: 'array',
                        description: 'Limitations or constraints mentioned (time, budget, etc.)',
                        items: { type: 'string' }
                    },
                    deadline: {
                        type: 'string',
                        description: 'Any deadline or timeframe mentioned'
                    }
                },
                required: ['explicit_requests']
            }
        }
    }
];

// ============================================================================
// TOOL RESULT TYPES
// ============================================================================

export interface CallerInfoResult {
    caller_name?: string;
    contact_phone?: string;
    contact_email?: string;
    company_organization?: string;
    caller_role?: string;
    reference_number?: string;
}

export interface SeriousnessResult {
    priority_level: PriorityLevel;
    urgency_indicators: string[];
    reasoning: string;
    escalation_needed: 'yes' | 'no' | 'maybe';
    time_sensitivity: 'immediate' | 'today' | 'this_week' | 'no_rush';
}

export interface SentimentResult {
    overall_sentiment: 'very_positive' | 'positive' | 'neutral' | 'negative' | 'very_negative' | 'mixed';
    caller_emotion: 'happy' | 'satisfied' | 'neutral' | 'confused' | 'frustrated' | 'angry' | 'anxious' | 'sad' | 'relieved';
    emotion_intensity: 'mild' | 'moderate' | 'strong' | 'extreme';
    sentiment_shift?: 'improved' | 'worsened' | 'stable' | 'fluctuating';
    key_emotional_phrases?: string[];
}

export interface IssueTopicsResult {
    primary_topic: string;
    secondary_topics?: string[];
    issue_category: string;
    issue_description: string;
    resolution_status?: 'resolved' | 'partially_resolved' | 'unresolved' | 'needs_followup' | 'escalated';
    keywords?: string[];
}

export interface SummaryResult {
    brief_summary: string;
    detailed_summary?: string;
    main_points: string[];
    action_items?: string[];
    outcome: string;
    follow_up_required: 'yes' | 'no' | 'maybe';
    follow_up_notes?: string;
}

export interface RequirementsResult {
    explicit_requests: string[];
    implicit_needs?: string[];
    preferences?: string[];
    constraints?: string[];
    deadline?: string;
}

// Appointment-specific details
export interface AppointmentDetails {
    requested: boolean;
    date?: string; // ISO format: YYYY-MM-DD
    time?: string; // 24h format: HH:MM
    duration?: string; // e.g., "30 minutes", "1 hour"
    purpose?: string; // What the appointment is for
    preferred_contact?: string; // How they want to be contacted
    notes?: string;
    confirmed?: boolean;
}

// Contact information status
export interface ContactInfoStatus {
    has_phone: boolean;
    has_email: boolean;
    has_any_contact: boolean;
    needs_followup_contact: boolean;
    preferred_method?: 'phone' | 'email' | 'text' | 'other';
    alternative_contact?: string;
}

// Combined analysis result
export interface ConversationAnalysis {
    callerInfo?: CallerInfoResult;
    seriousness?: SeriousnessResult;
    sentiment?: SentimentResult;
    issueTopics?: IssueTopicsResult;
    summary?: SummaryResult;
    requirements?: RequirementsResult;
    appointment?: AppointmentDetails;
    contactStatus?: ContactInfoStatus;
}

// ============================================================================
// TOOL EXECUTION HELPERS
// ============================================================================

/**
 * Map function call results to ExtractedField array
 */
export function mapToExtractedFields(analysis: ConversationAnalysis): ExtractedField[] {
    const fields: ExtractedField[] = [];
    const now = new Date();

    // Caller Info
    if (analysis.callerInfo) {
        if (analysis.callerInfo.caller_name) {
            fields.push({
                id: 'name',
                label: 'Caller Name',
                value: analysis.callerInfo.caller_name,
                confidence: 0.95,
                extractedAt: now
            });
        }
        if (analysis.callerInfo.contact_phone) {
            fields.push({
                id: 'phone',
                label: 'Phone Number',
                value: analysis.callerInfo.contact_phone,
                confidence: 0.9,
                extractedAt: now
            });
        }
        if (analysis.callerInfo.contact_email) {
            fields.push({
                id: 'email',
                label: 'Email',
                value: analysis.callerInfo.contact_email,
                confidence: 0.9,
                extractedAt: now
            });
        }
        if (analysis.callerInfo.company_organization) {
            fields.push({
                id: 'company',
                label: 'Company/Organization',
                value: analysis.callerInfo.company_organization,
                confidence: 0.85,
                extractedAt: now
            });
        }
        if (analysis.callerInfo.reference_number) {
            fields.push({
                id: 'reference',
                label: 'Reference Number',
                value: analysis.callerInfo.reference_number,
                confidence: 0.95,
                extractedAt: now
            });
        }
    }

    // Issue Topics
    if (analysis.issueTopics) {
        fields.push({
            id: 'purpose',
            label: 'Call Purpose',
            value: analysis.issueTopics.primary_topic,
            confidence: 0.9,
            extractedAt: now
        });
        fields.push({
            id: 'issue_category',
            label: 'Issue Category',
            value: analysis.issueTopics.issue_category,
            confidence: 0.85,
            extractedAt: now
        });
        if (analysis.issueTopics.resolution_status) {
            fields.push({
                id: 'status',
                label: 'Resolution Status',
                value: analysis.issueTopics.resolution_status.replace('_', ' '),
                confidence: 0.8,
                extractedAt: now
            });
        }
    }

    // Sentiment
    if (analysis.sentiment) {
        fields.push({
            id: 'sentiment',
            label: 'Caller Sentiment',
            value: `${analysis.sentiment.caller_emotion} (${analysis.sentiment.emotion_intensity})`,
            confidence: 0.85,
            extractedAt: now
        });
    }

    // Seriousness
    if (analysis.seriousness) {
        fields.push({
            id: 'urgency',
            label: 'Urgency Level',
            value: analysis.seriousness.priority_level.toUpperCase(),
            confidence: 0.9,
            extractedAt: now
        });
        if (analysis.seriousness.escalation_needed === 'yes') {
            fields.push({
                id: 'escalation',
                label: 'Escalation Needed',
                value: 'Yes - Immediate attention required',
                confidence: 0.95,
                extractedAt: now
            });
        }
    }

    return fields;
}

/**
 * Get the suggested category from analysis
 */
export function getSuggestedCategory(analysis: ConversationAnalysis, categories: CallCategory[]): CallCategory | undefined {
    if (!analysis.issueTopics?.issue_category) return undefined;

    return categories.find(c =>
        c.id === analysis.issueTopics!.issue_category ||
        c.name.toLowerCase().includes(analysis.issueTopics!.issue_category.toLowerCase())
    );
}

/**
 * Get the suggested priority from analysis
 */
export function getSuggestedPriority(analysis: ConversationAnalysis): PriorityLevel | undefined {
    return analysis.seriousness?.priority_level;
}

// ============================================================================
// ENHANCED SYSTEM PROMPT FOR FUNCTION CALLING
// ============================================================================

/**
 * Generate an optimized system prompt for function calling conversations
 * Includes instructions for contact collection and appointment handling
 */
export function generateFunctionCallingSystemPrompt(
    persona: string,
    knownInfo: string,
    availableTools: string[],
    missingContactInfo?: { hasPhone: boolean; hasEmail: boolean }
): string {
    // Build contact collection instruction based on what's missing
    let contactInstruction = '';
    if (missingContactInfo && !missingContactInfo.hasPhone && !missingContactInfo.hasEmail) {
        contactInstruction = `
## IMPORTANT: Contact Information Collection
The caller has NOT provided any contact information yet. You MUST:
1. Politely ask for their phone number OR email to follow up
2. If they prefer not to give phone, ask for email or alternative contact
3. Phrase it naturally: "May I have a phone number or email where we can reach you?"
4. Note down whatever contact method they prefer
`;
    } else if (missingContactInfo && !missingContactInfo.hasPhone) {
        contactInstruction = `
## Contact Note
We have the caller's email but no phone number. If appropriate, you may ask for a phone number for faster contact.
`;
    }

    return `You are ${persona}. You are a professional, empathetic AI receptionist for ClerkTree.

## Core Responsibilities
1. GREET callers warmly and professionally
2. LISTEN actively and acknowledge their concerns
3. EXTRACT key information naturally through conversation
4. COLLECT contact information for follow-up (phone or email)
5. PROVIDE helpful, concise responses (1-2 sentences max)
6. CATEGORIZE and prioritize based on context
${contactInstruction}
## Available Analysis Tools
You have access to these tools to analyze the conversation:
${availableTools.map(t => `- ${t}`).join('\n')}

## Response Guidelines
- Keep responses SHORT (1-2 sentences)
- Be WARM but PROFESSIONAL
- ACKNOWLEDGE concerns before asking questions
- Use the caller's NAME when known
- Ask ONE question at a time
- ALWAYS collect contact info if not provided yet
- Match the caller's energy level appropriately

## Contact Collection Rules (IMPORTANT!)
- If no phone/email is known, politely ask for contact information
- Ask: "What's the best number or email to reach you at?"
- If they decline phone, ask for email: "No problem! Can I get an email instead?"
- If they decline both, ask: "Is there any way we can follow up with you?"
- Accept alternative contacts (WhatsApp, text preference, callback times)

## Appointment Handling Rules
When caller requests an appointment:
1. Ask for SPECIFIC DATE: "What date works best for you?"
2. Ask for SPECIFIC TIME: "What time would you prefer?"
3. Ask for PURPOSE: "What is this appointment regarding?"
4. CONFIRM contact for reminder: "We'll send a reminder. What's the best number to reach you?"
5. ALWAYS format dates as: December 25, 2024 (not "next week")
6. ALWAYS format times as: 2:30 PM (not "afternoon")

## Priority Assessment Rules
- CRITICAL: Emergency, safety issues, immediate threats, medical emergencies
- HIGH: Frustrated callers, time-sensitive requests, escalated issues, VIP customers
- MEDIUM: Standard requests, general inquiries, routine matters
- LOW: Information requests, feedback, no time pressure

## Sentiment Detection Cues
- POSITIVE: Thanks, great, appreciate, wonderful, happy
- NEUTRAL: Standard questions, factual requests
- NEGATIVE: Frustrated, angry, disappointed, upset, problem words
- CRITICAL: Emergency, urgent, immediately, life-threatening

## Information to Extract
- Caller name (ask early if not provided)
- Phone number OR email (REQUIRED for follow-up)
- Purpose of call
- For appointments: exact date, time, and purpose
- Reference numbers or account IDs
- Any deadlines or time constraints

${knownInfo ? `## Already Known Information\n${knownInfo}` : ''}

## Response Format
Respond naturally and conversationally. After each exchange, internally analyze:
1. What new information was shared?
2. Do we have contact information? If not, ask for it!
3. Is this an appointment request? Get date, time, and purpose!
4. What should be the next step?

Remember: ALWAYS collect contact info. Be helpful, efficient, and human.`;
}

/**
 * Generate the analysis prompt for end-of-call processing
 */
export function generateAnalysisPrompt(conversationTranscript: string): string {
    return `Analyze this conversation and extract all relevant information using the available tools.

## Conversation Transcript
${conversationTranscript}

## Required Analysis
1. Extract all caller information mentioned
2. Assess the seriousness and urgency level
3. Analyze the overall sentiment and emotional tone
4. Identify all topics and issues discussed
5. Generate a comprehensive summary
6. List any requirements or action items

Respond with a structured analysis using the tool functions.`;
}
