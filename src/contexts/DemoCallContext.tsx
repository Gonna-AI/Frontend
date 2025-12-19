import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// Types for dynamic context extraction
export interface ExtractedField {
  id: string;
  label: string;
  value: string;
  confidence: number; // 0-1 for AI confidence
  extractedAt: Date;
}

export interface CallCategory {
  id: string;
  name: string;
  color: string;
  description: string;
}

export type PriorityLevel = 'critical' | 'high' | 'medium' | 'low';

export interface ActionItem {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: Date;
}

export interface CallMessage {
  id: string;
  speaker: 'user' | 'agent';
  text: string;
  timestamp: Date;
}

export interface CallSummary {
  mainPoints: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  actionItems: ActionItem[];
  followUpRequired: boolean;
  notes: string;
}

export interface CallSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  status: 'idle' | 'connecting' | 'active' | 'ended';
  messages: CallMessage[];
  extractedFields: ExtractedField[];
  category?: CallCategory;
  priority: PriorityLevel;
}

export interface CallHistoryItem {
  id: string;
  callerName: string;
  date: Date;
  duration: number;
  messages: CallMessage[];
  extractedFields: ExtractedField[];
  category?: CallCategory;
  priority: PriorityLevel;
  summary: CallSummary;
  tags: string[];
}

// Knowledge Base types for prompt engineering
export interface ContextField {
  id: string;
  name: string;
  description: string;
  required: boolean;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean';
  options?: string[]; // For select type
}

export interface KnowledgeBaseConfig {
  systemPrompt: string;
  persona: string;
  greeting: string;
  contextFields: ContextField[];
  categories: CallCategory[];
  priorityRules: string[];
  customInstructions: string[];
  responseGuidelines: string;
}

interface DemoCallContextType {
  // Knowledge Base configuration
  knowledgeBase: KnowledgeBaseConfig;
  updateKnowledgeBase: (config: Partial<KnowledgeBaseConfig>) => void;
  addContextField: (field: ContextField) => void;
  updateContextField: (id: string, field: Partial<ContextField>) => void;
  removeContextField: (id: string) => void;
  addCategory: (category: CallCategory) => void;
  removeCategory: (id: string) => void;
  
  // Current call session
  currentCall: CallSession | null;
  startCall: () => void;
  endCall: () => void;
  addMessage: (speaker: 'user' | 'agent', text: string) => void;
  updateExtractedField: (field: ExtractedField) => void;
  setCallPriority: (priority: PriorityLevel) => void;
  setCallCategory: (category: CallCategory) => void;
  
  // Call history
  callHistory: CallHistoryItem[];
  getCallsByPriority: (priority: PriorityLevel) => CallHistoryItem[];
  getCallsByCategory: (categoryId: string) => CallHistoryItem[];
  
  // Analytics
  getAnalytics: () => {
    totalCalls: number;
    byPriority: Record<PriorityLevel, number>;
    byCategory: Record<string, number>;
    avgDuration: number;
    followUpRequired: number;
  };
}

const DemoCallContext = createContext<DemoCallContextType | undefined>(undefined);

// Default Knowledge Base configuration
const defaultKnowledgeBase: KnowledgeBaseConfig = {
  systemPrompt: `You are an intelligent call agent for ClerkTree. Your role is to:
1. Greet callers professionally and warmly
2. Identify and collect relevant information from the conversation
3. Categorize the call based on the caller's needs
4. Prioritize based on urgency and importance
5. Provide helpful responses while gathering context

Always be empathetic, clear, and efficient in your communication.`,
  
  persona: 'Professional, empathetic, and efficient AI assistant',
  
  greeting: "Hello! Thank you for calling ClerkTree. How may I assist you today?",
  
  contextFields: [
    { id: 'name', name: 'Caller Name', description: 'Full name of the caller', required: true, type: 'text' },
    { id: 'contact', name: 'Contact Info', description: 'Phone or email for follow-up', required: false, type: 'text' },
    { id: 'purpose', name: 'Call Purpose', description: 'Main reason for calling', required: true, type: 'text' },
    { id: 'urgency', name: 'Urgency Level', description: 'How urgent is the matter', required: false, type: 'select', options: ['Not Urgent', 'Somewhat Urgent', 'Very Urgent', 'Emergency'] },
    { id: 'previousContact', name: 'Previous Contact', description: 'Have they contacted before', required: false, type: 'boolean' },
  ],
  
  categories: [
    { id: 'inquiry', name: 'General Inquiry', color: 'blue', description: 'General questions and information requests' },
    { id: 'support', name: 'Support Request', color: 'orange', description: 'Technical or service support needed' },
    { id: 'complaint', name: 'Complaint', color: 'red', description: 'Issues or complaints to address' },
    { id: 'appointment', name: 'Appointment', color: 'green', description: 'Scheduling or appointment related' },
    { id: 'feedback', name: 'Feedback', color: 'purple', description: 'Customer feedback and suggestions' },
    { id: 'sales', name: 'Sales Inquiry', color: 'emerald', description: 'Sales and pricing questions' },
  ],
  
  priorityRules: [
    'Mark as CRITICAL if caller mentions emergency, urgent medical issue, or safety concern',
    'Mark as HIGH if caller is frustrated, has waited long, or has time-sensitive request',
    'Mark as MEDIUM for standard requests that need follow-up',
    'Mark as LOW for general inquiries with no time pressure',
  ],
  
  customInstructions: [
    'Always confirm the caller\'s name early in the conversation',
    'Ask clarifying questions if the purpose is unclear',
    'Offer to schedule follow-up if needed',
    'Summarize the conversation before ending the call',
  ],
  
  responseGuidelines: `Guidelines for responses:
- Keep responses concise but complete
- Use the caller's name when appropriate
- Acknowledge concerns before providing solutions
- Avoid technical jargon unless the caller uses it
- Offer alternatives when the primary solution isn't available`,
};

// Demo call history with varied data
const demoCallHistory: CallHistoryItem[] = [
  {
    id: 'history-1',
    callerName: 'Sarah Johnson',
    date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    duration: 245,
    priority: 'high',
    category: { id: 'support', name: 'Support Request', color: 'orange', description: '' },
    tags: ['technical-issue', 'follow-up-needed'],
    extractedFields: [
      { id: 'name', label: 'Caller Name', value: 'Sarah Johnson', confidence: 0.98, extractedAt: new Date() },
      { id: 'purpose', label: 'Call Purpose', value: 'Account access issues', confidence: 0.95, extractedAt: new Date() },
    ],
    summary: {
      mainPoints: [
        'Unable to access account for 2 days',
        'Reset password didn\'t work',
        'Needs access for urgent project deadline',
      ],
      sentiment: 'negative',
      actionItems: [
        { id: 'a1', text: 'Reset account credentials manually', completed: false },
        { id: 'a2', text: 'Call back to confirm access restored', completed: false },
      ],
      followUpRequired: true,
      notes: 'Customer was frustrated but understood we would help. Urgent - project deadline tomorrow.',
    },
    messages: [
      { id: 'm1', speaker: 'agent', text: 'Hello! Thank you for calling ClerkTree. How may I assist you today?', timestamp: new Date() },
      { id: 'm2', speaker: 'user', text: 'Hi, I\'ve been locked out of my account for two days now.', timestamp: new Date() },
      { id: 'm3', speaker: 'agent', text: 'I\'m sorry to hear that. Let me help you regain access. Can I have your name please?', timestamp: new Date() },
    ],
  },
  {
    id: 'history-2',
    callerName: 'Michael Chen',
    date: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    duration: 180,
    priority: 'medium',
    category: { id: 'appointment', name: 'Appointment', color: 'green', description: '' },
    tags: ['scheduling', 'new-customer'],
    extractedFields: [
      { id: 'name', label: 'Caller Name', value: 'Michael Chen', confidence: 0.99, extractedAt: new Date() },
      { id: 'purpose', label: 'Call Purpose', value: 'Schedule consultation', confidence: 0.92, extractedAt: new Date() },
    ],
    summary: {
      mainPoints: [
        'New customer interested in services',
        'Wants to schedule initial consultation',
        'Available next week afternoons',
      ],
      sentiment: 'positive',
      actionItems: [
        { id: 'a3', text: 'Schedule consultation for Tuesday 2pm', completed: true },
        { id: 'a4', text: 'Send confirmation email', completed: true },
      ],
      followUpRequired: false,
      notes: 'Enthusiastic new prospect. Scheduled for Tuesday.',
    },
    messages: [],
  },
  {
    id: 'history-3',
    callerName: 'Anonymous',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    duration: 95,
    priority: 'low',
    category: { id: 'inquiry', name: 'General Inquiry', color: 'blue', description: '' },
    tags: ['pricing', 'quick-call'],
    extractedFields: [
      { id: 'purpose', label: 'Call Purpose', value: 'Pricing information', confidence: 0.88, extractedAt: new Date() },
    ],
    summary: {
      mainPoints: [
        'Asked about pricing tiers',
        'Comparing with competitors',
        'May call back later',
      ],
      sentiment: 'neutral',
      actionItems: [],
      followUpRequired: false,
      notes: 'Quick inquiry about pricing. No commitment.',
    },
    messages: [],
  },
  {
    id: 'history-4',
    callerName: 'Dr. Emily Watson',
    date: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    duration: 420,
    priority: 'critical',
    category: { id: 'complaint', name: 'Complaint', color: 'red', description: '' },
    tags: ['escalation', 'service-issue', 'vip'],
    extractedFields: [
      { id: 'name', label: 'Caller Name', value: 'Dr. Emily Watson', confidence: 0.99, extractedAt: new Date() },
      { id: 'purpose', label: 'Call Purpose', value: 'Service outage affecting patients', confidence: 0.97, extractedAt: new Date() },
    ],
    summary: {
      mainPoints: [
        'Critical service outage affecting medical practice',
        'Patients cannot access records',
        'Impacting patient care',
        'Requesting immediate escalation',
      ],
      sentiment: 'negative',
      actionItems: [
        { id: 'a5', text: 'Escalate to engineering team immediately', completed: true },
        { id: 'a6', text: 'Provide hourly updates to Dr. Watson', completed: false },
        { id: 'a7', text: 'Document incident for post-mortem', completed: false },
      ],
      followUpRequired: true,
      notes: 'CRITICAL: Medical practice affected. Engineering team notified. CEO should be informed.',
    },
    messages: [],
  },
];

export function DemoCallProvider({ children }: { children: ReactNode }) {
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBaseConfig>(defaultKnowledgeBase);
  const [currentCall, setCurrentCall] = useState<CallSession | null>(null);
  const [callHistory, setCallHistory] = useState<CallHistoryItem[]>(demoCallHistory);

  // Knowledge Base updates
  const updateKnowledgeBase = useCallback((config: Partial<KnowledgeBaseConfig>) => {
    setKnowledgeBase(prev => ({ ...prev, ...config }));
  }, []);

  const addContextField = useCallback((field: ContextField) => {
    setKnowledgeBase(prev => ({
      ...prev,
      contextFields: [...prev.contextFields, field],
    }));
  }, []);

  const updateContextField = useCallback((id: string, updates: Partial<ContextField>) => {
    setKnowledgeBase(prev => ({
      ...prev,
      contextFields: prev.contextFields.map(f => f.id === id ? { ...f, ...updates } : f),
    }));
  }, []);

  const removeContextField = useCallback((id: string) => {
    setKnowledgeBase(prev => ({
      ...prev,
      contextFields: prev.contextFields.filter(f => f.id !== id),
    }));
  }, []);

  const addCategory = useCallback((category: CallCategory) => {
    setKnowledgeBase(prev => ({
      ...prev,
      categories: [...prev.categories, category],
    }));
  }, []);

  const removeCategory = useCallback((id: string) => {
    setKnowledgeBase(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c.id !== id),
    }));
  }, []);

  // Call session management
  const startCall = useCallback(() => {
    const newCall: CallSession = {
      id: `call-${Date.now()}`,
      startTime: new Date(),
      status: 'active',
      messages: [],
      extractedFields: [],
      priority: 'medium',
    };
    setCurrentCall(newCall);
  }, []);

  const endCall = useCallback(() => {
    if (currentCall) {
      const endedCall: CallSession = {
        ...currentCall,
        endTime: new Date(),
        status: 'ended',
      };
      
      // Generate summary (placeholder - will be AI-generated)
      const callerNameField = endedCall.extractedFields.find(f => f.id === 'name');
      const purposeField = endedCall.extractedFields.find(f => f.id === 'purpose');
      
      const historyItem: CallHistoryItem = {
        id: `history-${Date.now()}`,
        callerName: callerNameField?.value || 'Unknown Caller',
        date: endedCall.startTime,
        duration: Math.floor((endedCall.endTime!.getTime() - endedCall.startTime.getTime()) / 1000),
        messages: endedCall.messages,
        extractedFields: endedCall.extractedFields,
        category: endedCall.category,
        priority: endedCall.priority,
        tags: [],
        summary: {
          mainPoints: purposeField ? [purposeField.value] : ['Call completed'],
          sentiment: 'neutral',
          actionItems: [],
          followUpRequired: endedCall.priority === 'high' || endedCall.priority === 'critical',
          notes: 'Call summary will be generated by AI.',
        },
      };
      
      setCallHistory(prev => [historyItem, ...prev]);
      setCurrentCall(null);
    }
  }, [currentCall]);

  const addMessage = useCallback((speaker: 'user' | 'agent', text: string) => {
    if (currentCall) {
      const message: CallMessage = {
        id: `msg-${Date.now()}`,
        speaker,
        text,
        timestamp: new Date(),
      };
      setCurrentCall(prev => prev ? {
        ...prev,
        messages: [...prev.messages, message],
      } : null);
    }
  }, [currentCall]);

  const updateExtractedField = useCallback((field: ExtractedField) => {
    if (currentCall) {
      setCurrentCall(prev => {
        if (!prev) return null;
        const existingIndex = prev.extractedFields.findIndex(f => f.id === field.id);
        if (existingIndex >= 0) {
          const updated = [...prev.extractedFields];
          updated[existingIndex] = field;
          return { ...prev, extractedFields: updated };
        }
        return { ...prev, extractedFields: [...prev.extractedFields, field] };
      });
    }
  }, [currentCall]);

  const setCallPriority = useCallback((priority: PriorityLevel) => {
    if (currentCall) {
      setCurrentCall(prev => prev ? { ...prev, priority } : null);
    }
  }, [currentCall]);

  const setCallCategory = useCallback((category: CallCategory) => {
    if (currentCall) {
      setCurrentCall(prev => prev ? { ...prev, category } : null);
    }
  }, [currentCall]);

  // Query helpers
  const getCallsByPriority = useCallback((priority: PriorityLevel) => {
    return callHistory.filter(c => c.priority === priority);
  }, [callHistory]);

  const getCallsByCategory = useCallback((categoryId: string) => {
    return callHistory.filter(c => c.category?.id === categoryId);
  }, [callHistory]);

  const getAnalytics = useCallback(() => {
    const byPriority: Record<PriorityLevel, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };
    
    const byCategory: Record<string, number> = {};
    let totalDuration = 0;
    let followUpCount = 0;

    callHistory.forEach(call => {
      byPriority[call.priority]++;
      if (call.category) {
        byCategory[call.category.id] = (byCategory[call.category.id] || 0) + 1;
      }
      totalDuration += call.duration;
      if (call.summary.followUpRequired) followUpCount++;
    });

    return {
      totalCalls: callHistory.length,
      byPriority,
      byCategory,
      avgDuration: callHistory.length > 0 ? totalDuration / callHistory.length : 0,
      followUpRequired: followUpCount,
    };
  }, [callHistory]);

  const value: DemoCallContextType = {
    knowledgeBase,
    updateKnowledgeBase,
    addContextField,
    updateContextField,
    removeContextField,
    addCategory,
    removeCategory,
    currentCall,
    startCall,
    endCall,
    addMessage,
    updateExtractedField,
    setCallPriority,
    setCallCategory,
    callHistory,
    getCallsByPriority,
    getCallsByCategory,
    getAnalytics,
  };

  return (
    <DemoCallContext.Provider value={value}>
      {children}
    </DemoCallContext.Provider>
  );
}

export function useDemoCall() {
  const context = useContext(DemoCallContext);
  if (context === undefined) {
    throw new Error('useDemoCall must be used within a DemoCallProvider');
  }
  return context;
}
