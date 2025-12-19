import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { supabase } from '../config/supabase';
import { aiService } from '../services/aiService';

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
  selectedVoiceId: string; // Selected AI voice
}

interface DemoCallContextType {
  // Knowledge Base configuration
  knowledgeBase: KnowledgeBaseConfig;
  updateKnowledgeBase: (config: Partial<KnowledgeBaseConfig>) => void;
  saveKnowledgeBase: () => Promise<boolean>;
  loadKnowledgeBase: () => Promise<void>;
  addContextField: (field: ContextField) => void;
  updateContextField: (id: string, field: Partial<ContextField>) => void;
  removeContextField: (id: string) => void;
  addCategory: (category: CallCategory) => void;
  removeCategory: (id: string) => void;
  
  // Current call session
  currentCall: CallSession | null;
  startCall: () => void;
  endCall: () => Promise<void>;
  addMessage: (speaker: 'user' | 'agent', text: string) => void;
  updateExtractedField: (field: ExtractedField) => void;
  setCallPriority: (priority: PriorityLevel) => void;
  setCallCategory: (category: CallCategory) => void;
  
  // Call history
  callHistory: CallHistoryItem[];
  addToCallHistory: (item: CallHistoryItem) => void;
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
  
  // Loading state
  isLoading: boolean;
}

const DemoCallContext = createContext<DemoCallContextType | undefined>(undefined);

// Storage keys
const KNOWLEDGE_BASE_KEY = 'clerktree_knowledge_base';
const CALL_HISTORY_KEY = 'clerktree_call_history';

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
  
  selectedVoiceId: 'af_nova', // Default voice
};

// Helper to serialize dates for storage
function serializeCallHistory(history: CallHistoryItem[]): string {
  return JSON.stringify(history.map(item => ({
    ...item,
    date: item.date.toISOString(),
    messages: item.messages.map(m => ({
      ...m,
      timestamp: m.timestamp.toISOString()
    })),
    extractedFields: item.extractedFields.map(f => ({
      ...f,
      extractedAt: f.extractedAt.toISOString()
    }))
  })));
}

// Types for serialized data (with string dates)
interface SerializedCallMessage {
  id: string;
  speaker: 'user' | 'agent';
  text: string;
  timestamp: string;
}

interface SerializedExtractedField {
  id: string;
  label: string;
  value: string;
  confidence: number;
  extractedAt: string;
}

interface SerializedCallHistoryItem {
  id: string;
  callerName: string;
  date: string;
  duration: number;
  messages: SerializedCallMessage[];
  extractedFields: SerializedExtractedField[];
  category?: CallCategory;
  priority: PriorityLevel;
  summary: CallSummary;
  tags: string[];
}

// Helper to deserialize dates from storage
function deserializeCallHistory(data: string): CallHistoryItem[] {
  try {
    const parsed = JSON.parse(data) as SerializedCallHistoryItem[];
    return parsed.map((item) => ({
      ...item,
      date: new Date(item.date),
      messages: item.messages.map((m) => ({
        ...m,
        timestamp: new Date(m.timestamp)
      })),
      extractedFields: item.extractedFields.map((f) => ({
        ...f,
        extractedAt: new Date(f.extractedAt)
      }))
    }));
  } catch {
    return [];
  }
}

export function DemoCallProvider({ children }: { children: ReactNode }) {
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBaseConfig>(defaultKnowledgeBase);
  const [currentCall, setCurrentCall] = useState<CallSession | null>(null);
  const [callHistory, setCallHistory] = useState<CallHistoryItem[]>([]); // Start with empty - real data only
  const [isLoading, setIsLoading] = useState(true);

  // Load knowledge base and call history on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      // Try to load from Supabase first, fallback to localStorage
      try {
        // Load knowledge base
        const { data: kbData, error: kbError } = await supabase
          .from('knowledge_base_config')
          .select('*')
          .single();
        
        if (!kbError && kbData?.config) {
          setKnowledgeBase(kbData.config as KnowledgeBaseConfig);
        } else {
          // Fallback to localStorage
          const localKB = localStorage.getItem(KNOWLEDGE_BASE_KEY);
          if (localKB) {
            setKnowledgeBase(JSON.parse(localKB));
          }
        }

        // Load call history
        const { data: historyData, error: historyError } = await supabase
          .from('call_history')
          .select('*')
          .order('date', { ascending: false });
        
        if (!historyError && historyData && historyData.length > 0) {
          const formattedHistory = (historyData as SerializedCallHistoryItem[]).map((item) => ({
            ...item,
            date: new Date(item.date),
            messages: (item.messages || []).map((m) => ({
              ...m,
              timestamp: new Date(m.timestamp)
            })),
            extractedFields: (item.extractedFields || []).map((f) => ({
              ...f,
              extractedAt: new Date(f.extractedAt)
            }))
          })) as CallHistoryItem[];
          setCallHistory(formattedHistory);
        } else {
          // Fallback to localStorage
          const localHistory = localStorage.getItem(CALL_HISTORY_KEY);
          if (localHistory) {
            setCallHistory(deserializeCallHistory(localHistory));
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to localStorage
        const localKB = localStorage.getItem(KNOWLEDGE_BASE_KEY);
        if (localKB) {
          try {
            setKnowledgeBase(JSON.parse(localKB));
          } catch (e) {
            console.error('Error parsing local KB:', e);
          }
        }
        const localHistory = localStorage.getItem(CALL_HISTORY_KEY);
        if (localHistory) {
          setCallHistory(deserializeCallHistory(localHistory));
        }
      }
      
      setIsLoading(false);
    };

    loadData();
  }, []);

  // Save call history to localStorage whenever it changes (as backup)
  useEffect(() => {
    if (callHistory.length > 0) {
      localStorage.setItem(CALL_HISTORY_KEY, serializeCallHistory(callHistory));
    }
  }, [callHistory]);

  // Knowledge Base updates
  const updateKnowledgeBase = useCallback((config: Partial<KnowledgeBaseConfig>) => {
    setKnowledgeBase(prev => {
      const updated = { ...prev, ...config };
      // Also save to localStorage immediately for backup
      localStorage.setItem(KNOWLEDGE_BASE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Save knowledge base to Supabase
  const saveKnowledgeBase = useCallback(async (): Promise<boolean> => {
    try {
      // Save to localStorage first (always works)
      localStorage.setItem(KNOWLEDGE_BASE_KEY, JSON.stringify(knowledgeBase));
      
      // Try to save to Supabase
      const { error } = await supabase
        .from('knowledge_base_config')
        .upsert({
          id: 'default',
          config: knowledgeBase,
          updated_at: new Date().toISOString()
        });
      
      if (error) {
        console.warn('Supabase save failed, using localStorage:', error);
        // localStorage save already done, so still return true
      }
      
      return true;
    } catch (error) {
      console.error('Error saving knowledge base:', error);
      // localStorage save already done
      return true;
    }
  }, [knowledgeBase]);

  // Load knowledge base from Supabase
  const loadKnowledgeBase = useCallback(async (): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('knowledge_base_config')
        .select('*')
        .single();
      
      if (!error && data?.config) {
        setKnowledgeBase(data.config as KnowledgeBaseConfig);
      }
    } catch (error) {
      console.error('Error loading knowledge base:', error);
    }
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

  // Helper to find caller name from various sources
  const findCallerName = (call: CallSession): string => {
    // First try extracted fields
    const nameField = call.extractedFields.find(f => 
      f.id === 'name' || 
      f.label.toLowerCase().includes('name') ||
      f.label.toLowerCase().includes('caller')
    );
    if (nameField?.value) return nameField.value;
    
    // Try to find name in messages where user introduced themselves
    const userMessages = call.messages.filter(m => m.speaker === 'user');
    for (const msg of userMessages) {
      // Common patterns: "My name is X", "I'm X", "This is X", "I am X"
      const patterns = [
        /my name is\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
        /i'?m\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
        /this is\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
        /i am\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
        /call me\s+([A-Z][a-z]+)/i
      ];
      
      for (const pattern of patterns) {
        const match = msg.text.match(pattern);
        if (match?.[1]) {
          return match[1];
        }
      }
    }
    
    return 'Unknown Caller';
  };

  const endCall = useCallback(async () => {
    if (currentCall) {
      const endedCall: CallSession = {
        ...currentCall,
        endTime: new Date(),
        status: 'ended',
      };
      
      const duration = Math.floor((endedCall.endTime!.getTime() - endedCall.startTime.getTime()) / 1000);
      
      // Get caller name from various sources
      const callerName = findCallerName(endedCall);
      
      // Default summary while we wait for AI
      let summary: CallSummary = {
        mainPoints: ['Call completed'],
        sentiment: 'neutral',
        actionItems: [],
        followUpRequired: endedCall.priority === 'high' || endedCall.priority === 'critical',
        notes: 'Processing call summary...',
      };
      
      let finalCategory = endedCall.category;
      let finalPriority = endedCall.priority;
      let tags: string[] = [];

      // Try to get AI summary using aiService (which has smart mock fallback)
      try {
        if (endedCall.messages.length > 0) {
          const summaryResponse = await aiService.generateSummary(
            endedCall.messages,
            endedCall.extractedFields,
            endedCall.category,
            endedCall.priority
          );
          
          summary = summaryResponse.summary;
          tags = summaryResponse.tags;
          
          // Update priority if higher than current
          const priorityOrder: PriorityLevel[] = ['low', 'medium', 'high', 'critical'];
          const currentIdx = priorityOrder.indexOf(finalPriority);
          const suggestedIdx = priorityOrder.indexOf(endedCall.priority);
          if (suggestedIdx > currentIdx) {
            finalPriority = endedCall.priority;
          }
        }
      } catch (error) {
        console.error('Error generating AI summary:', error);
        // Create a basic summary from extracted fields
        const purposeField = endedCall.extractedFields.find(f => f.id === 'purpose');
        summary = {
          mainPoints: purposeField ? [purposeField.value] : ['Call completed'],
          sentiment: 'neutral',
          actionItems: [],
          followUpRequired: endedCall.priority === 'high' || endedCall.priority === 'critical',
          notes: `Call from ${callerName}. ${purposeField ? `Regarding: ${purposeField.value}` : ''}`.trim(),
        };
      }
      
      const historyItem: CallHistoryItem = {
        id: `history-${Date.now()}`,
        callerName,
        date: endedCall.startTime,
        duration,
        messages: endedCall.messages,
        extractedFields: endedCall.extractedFields,
        category: finalCategory,
        priority: finalPriority,
        tags,
        summary,
      };
      
      // Add to local state
      setCallHistory(prev => [historyItem, ...prev]);
      
      // Try to save to Supabase
      try {
        const { error } = await supabase.from('call_history').insert({
          id: historyItem.id,
          callerName: historyItem.callerName,
          date: historyItem.date.toISOString(),
          duration: historyItem.duration,
          messages: historyItem.messages.map(m => ({
            ...m,
            timestamp: m.timestamp.toISOString()
          })),
          extractedFields: historyItem.extractedFields.map(f => ({
            ...f,
            extractedAt: f.extractedAt.toISOString()
          })),
          category: historyItem.category,
          priority: historyItem.priority,
          tags: historyItem.tags,
          summary: historyItem.summary
        });
        
        if (error) {
          console.warn('Failed to save call to Supabase:', error);
        }
      } catch (error) {
        console.error('Error saving call to Supabase:', error);
      }
      
      setCurrentCall(null);
    }
  }, [currentCall, knowledgeBase]);

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

  const addToCallHistory = useCallback((item: CallHistoryItem) => {
    setCallHistory(prev => [item, ...prev]);
  }, []);

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
    saveKnowledgeBase,
    loadKnowledgeBase,
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
    addToCallHistory,
    getCallsByPriority,
    getCallsByCategory,
    getAnalytics,
    isLoading,
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
