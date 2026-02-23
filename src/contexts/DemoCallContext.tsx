import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import { supabase } from '../config/supabase';
import { aiService } from '../services/aiService';
import { useAuth } from './AuthContext';

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
  // Expanded sentiment types for detailed analysis
  sentiment: 'very_positive' | 'positive' | 'slightly_positive' | 'neutral' | 'mixed' | 'slightly_negative' | 'negative' | 'very_negative' | 'anxious' | 'urgent';
  actionItems: ActionItem[];
  followUpRequired: boolean;
  notes: string;
  // Enhanced summary fields
  summaryText?: string; // Clean summary text for preview
  suggestions?: string[];
  callerIntent?: string;
  moodIndicators?: string[]
  topics?: string[];
  resolution?: string;
  riskLevel?: string;
  estimatedPriority?: string;
}

export interface CallSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  status: 'idle' | 'connecting' | 'active' | 'ended';
  type: 'voice' | 'text';
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
  type: 'voice' | 'text'; // Distinguish between voice calls and text chats
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
  startCall: (type?: 'voice' | 'text') => void;
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

  // Session management
  getCurrentUserId: () => string;
  switchSession: (sessionId: string, config?: Record<string, unknown>) => void;

  // Agent ID for attributing calls to a specific dashboard user
  agentId: string | null;

  // Global active sessions (from all devices worldwide)
  globalActiveSessions: { voice: number; text: number };

  // Loading state
  isLoading: boolean;
}

const DemoCallContext = createContext<DemoCallContextType | undefined>(undefined);

// Storage keys - made user-scoped via helper functions
const KNOWLEDGE_BASE_KEY_PREFIX = 'clerktree_knowledge_base_';
const CALL_HISTORY_KEY_PREFIX = 'clerktree_call_history_';
const ACTIVE_CALL_KEY_PREFIX = 'active_call_session_';
const GROQ_SETTINGS_KEY_PREFIX = 'clerktree_groq_settings_';

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

  greeting: 'Hello! How can I help you today?',

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
  type?: 'voice' | 'text'; // Optional for backwards compatibility with old data
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
      type: item.type || 'text', // Default to 'text' for backwards compatibility
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

export function DemoCallProvider({ children, initialAgentId }: { children: ReactNode; initialAgentId?: string }) {
  const { user } = useAuth();
  // agentId: the dashboard owner whose knowledge base this call is attributed to
  const agentId = initialAgentId || user?.id || null;
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBaseConfig>(defaultKnowledgeBase);
  const [currentCall, setCurrentCall] = useState<CallSession | null>(null);
  const [callHistory, setCallHistory] = useState<CallHistoryItem[]>([]); // Start with empty - real data only
  const [isLoading, setIsLoading] = useState(true);
  const [globalActiveSessions, setGlobalActiveSessions] = useState<{ voice: number; text: number }>({ voice: 0, text: 0 });

  const ACTIVE_CALL_KEY = user?.id ? `${ACTIVE_CALL_KEY_PREFIX}${user.id}` : 'active_call_session';
  const KNOWLEDGE_BASE_KEY = user?.id ? `${KNOWLEDGE_BASE_KEY_PREFIX}${user.id}` : 'clerktree_knowledge_base';
  const CALL_HISTORY_KEY = user?.id ? `${CALL_HISTORY_KEY_PREFIX}${user.id}` : 'clerktree_call_history';

  // Get the authenticated user's ID for user-specific data
  const getUserId = useCallback(() => {
    return user?.id || 'anonymous';
  }, [user]);

  // Switch to a different session
  const switchSession = useCallback((sessionId: string, config?: Record<string, unknown>) => {
    // Update localStorage with new session ID
    localStorage.setItem('clerktree_user_id', sessionId);

    if (config) {
      // Update knowledge base with new config
      setKnowledgeBase({
        ...defaultKnowledgeBase,  // Start with defaults
        ...config as Partial<KnowledgeBaseConfig>  // Override with session config
      } as KnowledgeBaseConfig);
      localStorage.setItem(KNOWLEDGE_BASE_KEY, JSON.stringify(config));
      console.log('✅ Switched to session:', sessionId);
    }
  }, []);


  // Load knowledge base and call history on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      // LOADING ORDER:
      // 1. Code defaults (already set via useState)
      // 2. Agent's config from Supabase (if agentId is present — user-facing pages)
      // 3. User's own config from Supabase (if authenticated — dashboard)
      // 4. localStorage as fallback

      try {
        // Determine which user's knowledge base to load:
        // - If initialAgentId is set (visitor on /user/chat?agentId=X), load the AGENT's config
        // - Otherwise load the authenticated user's own config
        const configOwnerId = initialAgentId || user?.id;

        if (configOwnerId) {
          // Load from Supabase first (source of truth)
          const { data: kbData, error: kbError } = await supabase
            .from('knowledge_base_config')
            .select('*')
            .eq('user_id', configOwnerId)
            .single();

          if (!kbError && kbData?.config) {
            setKnowledgeBase(prev => ({ ...prev, ...(kbData.config as KnowledgeBaseConfig) }));
            localStorage.setItem(KNOWLEDGE_BASE_KEY, JSON.stringify(kbData.config));
            console.log(`✅ Loaded knowledge base from Supabase for ${initialAgentId ? 'agent' : 'user'}:`, configOwnerId);
          } else if (!initialAgentId) {
            // Only fall back to localStorage for the user's own config (not for agent configs)
            const localKB = localStorage.getItem(KNOWLEDGE_BASE_KEY);
            if (localKB) {
              try {
                const parsed = JSON.parse(localKB);
                setKnowledgeBase(prev => ({ ...prev, ...parsed }));
                console.log('✅ Loaded user knowledge base from localStorage');
              } catch (e) {
                console.warn('Failed to parse localStorage knowledge base:', e);
              }
            }
          }
        }

        // Load active call session if exists
        const storedCall = localStorage.getItem(ACTIVE_CALL_KEY);
        if (storedCall) {
          try {
            const parsedCall = JSON.parse(storedCall);
            // Rehydrate dates
            parsedCall.startTime = new Date(parsedCall.startTime);
            if (parsedCall.endTime) parsedCall.endTime = new Date(parsedCall.endTime);
            parsedCall.messages = parsedCall.messages.map((m: any) => ({
              ...m,
              timestamp: new Date(m.timestamp)
            }));
            parsedCall.extractedFields = parsedCall.extractedFields.map((f: any) => ({
              ...f,
              extractedAt: new Date(f.extractedAt)
            }));
            setCurrentCall(parsedCall);
            console.log('✅ Restored active call session');
          } catch (e) {
            console.error('Failed to restore active call:', e);
            localStorage.removeItem(ACTIVE_CALL_KEY);
          }
        }

        // Load call history
        // Only load data if user is authenticated
        if (!user?.id) {
          setIsLoading(false);
          return;
        }

        const { data: historyData, error: historyError } = await supabase
          .from('call_history')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        if (!historyError && historyData && historyData.length > 0) {
          // Map Supabase snake_case to app camelCase
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const formattedHistory = historyData.map((item: any) => ({
            id: item.id,
            callerName: item.caller_name || 'Unknown Caller',  // snake_case from Supabase
            date: new Date(item.date),
            duration: item.duration,
            type: item.type || 'text', // Default to 'text' if not specified
            messages: (item.messages || []).map((m: SerializedCallMessage) => ({
              ...m,
              timestamp: new Date(m.timestamp)
            })),
            extractedFields: (item.extracted_fields || []).map((f: SerializedExtractedField) => ({  // snake_case
              ...f,
              extractedAt: new Date(f.extractedAt)
            })),
            category: item.category,
            priority: item.priority || 'medium',
            tags: item.tags || [],
            summary: item.summary || { mainPoints: [], sentiment: 'neutral', actionItems: [], followUpRequired: false, notes: '' }
          })) as CallHistoryItem[];
          setCallHistory(formattedHistory);
          console.log('✅ Loaded', formattedHistory.length, 'calls from Supabase');
        } else {
          // No data for this user — start fresh (do NOT fall back to localStorage which may contain other users' data)
          setCallHistory([]);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        // Do NOT fall back to localStorage for user-scoped data
        setCallHistory([]);
      }

      setIsLoading(false);
    };

    loadData();
  }, [user?.id, initialAgentId]);

  // Real-time subscription for user-scoped sync across devices
  useEffect(() => {
    if (!user?.id) return;

    // Subscribe to call_history changes for this user only
    const subscription = supabase
      .channel(`call_history_changes_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for all changes (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'call_history',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('📡 Real-time update received:', payload.eventType);

          if (payload.eventType === 'INSERT' && payload.new) {
            // New call added - add to local state if not already present
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const newItem = payload.new as any;
            const formattedItem: CallHistoryItem = {
              id: newItem.id,
              callerName: newItem.caller_name || 'Unknown Caller',
              date: new Date(newItem.date),
              duration: newItem.duration || 0,
              type: newItem.type || 'text',
              messages: (newItem.messages || []).map((m: SerializedCallMessage) => ({
                ...m,
                timestamp: new Date(m.timestamp)
              })),
              extractedFields: (newItem.extracted_fields || []).map((f: SerializedExtractedField) => ({
                ...f,
                extractedAt: new Date(f.extractedAt)
              })),
              category: newItem.category,
              priority: newItem.priority || 'medium',
              tags: newItem.tags || [],
              summary: newItem.summary || { mainPoints: [], sentiment: 'neutral', actionItems: [], followUpRequired: false, notes: '' }
            };

            setCallHistory(prev => {
              // Check if already exists
              if (prev.some(c => c.id === formattedItem.id)) {
                return prev;
              }
              console.log('📡 Adding new call from real-time sync:', formattedItem.callerName);
              return [formattedItem, ...prev];
            });
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            // Call updated (e.g., summary generated) - update in local state
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const updatedItem = payload.new as any;
            const formattedItem: CallHistoryItem = {
              id: updatedItem.id,
              callerName: updatedItem.caller_name || 'Unknown Caller',
              date: new Date(updatedItem.date),
              duration: updatedItem.duration || 0,
              type: updatedItem.type || 'text',
              messages: (updatedItem.messages || []).map((m: SerializedCallMessage) => ({
                ...m,
                timestamp: new Date(m.timestamp)
              })),
              extractedFields: (updatedItem.extracted_fields || []).map((f: SerializedExtractedField) => ({
                ...f,
                extractedAt: new Date(f.extractedAt)
              })),
              category: updatedItem.category,
              priority: updatedItem.priority || 'medium',
              tags: updatedItem.tags || [],
              summary: updatedItem.summary || { mainPoints: [], sentiment: 'neutral', actionItems: [], followUpRequired: false, notes: '' }
            };

            setCallHistory(prev => prev.map(c =>
              c.id === formattedItem.id ? formattedItem : c
            ));
            console.log('📡 Call updated from real-time sync:', formattedItem.callerName);
          } else if (payload.eventType === 'DELETE' && payload.old) {
            // Call deleted - remove from local state
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const oldItem = payload.old as any;
            setCallHistory(prev => prev.filter(c => c.id !== oldItem.id));
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('📡 Real-time sync enabled for user:', user.id);
        }
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id]);

  // Real-time subscription for global active sessions count
  useEffect(() => {
    // Clean up stale sessions (older than 5 minutes without activity)
    const cleanupStaleSessions = async () => {
      try {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
        const { error, count } = await supabase
          .from('active_sessions')
          .delete()
          .eq('status', 'active')
          .lt('last_activity', fiveMinutesAgo);

        if (!error && count && count > 0) {
          console.log(`🧹 Cleaned up ${count} stale sessions`);
        }
      } catch (e) {
        console.error('🧹 Stale session cleanup error:', e);
      }
    };

    // Fetch initial count (only sessions with recent activity - within last 5 min)
    const fetchActiveSessions = async () => {
      try {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
        const { data, error } = await supabase
          .from('active_sessions')
          .select('session_type')
          .eq('status', 'active')
          .gte('last_activity', fiveMinutesAgo);

        if (error) {
          console.log('📡 Active sessions query error:', error.message);
          return;
        }

        if (data) {
          const voice = data.filter(s => s.session_type === 'voice').length;
          const text = data.filter(s => s.session_type === 'text').length;
          console.log(`📡 Global active sessions: ${voice} calls, ${text} chats`);
          setGlobalActiveSessions({ voice, text });
        }
      } catch (e) {
        console.error('📡 Active sessions fetch error:', e);
      }
    };

    // Initial cleanup then fetch
    cleanupStaleSessions().then(() => fetchActiveSessions());

    // Periodically cleanup stale sessions every minute
    const cleanupInterval = setInterval(() => {
      cleanupStaleSessions();
    }, 60 * 1000);

    // Subscribe to changes (debounced to avoid UI thrashing under high load)
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    const debouncedFetch = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        fetchActiveSessions();
      }, 500); // Batch rapid-fire changes into a single refetch
    };

    const subscription = supabase
      .channel('active_sessions_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'active_sessions' },
        (payload) => {
          console.log('📡 Active sessions change:', payload.eventType);
          debouncedFetch();
        }
      )
      .subscribe((status) => {
        console.log('📡 Active sessions subscription:', status);
      });

    return () => {
      clearInterval(cleanupInterval);
      if (debounceTimer) clearTimeout(debounceTimer);
      subscription.unsubscribe();
    };
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

  // Save knowledge base - user-specific storage
  const saveKnowledgeBase = useCallback(async (): Promise<boolean> => {
    try {
      const userId = getUserId();

      // Save to localStorage first (always works, fast)
      localStorage.setItem(KNOWLEDGE_BASE_KEY, JSON.stringify(knowledgeBase));
      console.log('✅ Saved knowledge base to localStorage');

      if (userId === 'anonymous') {
        return true; // Not logged in, localStorage only
      }

      // Try to save to Supabase with user ID
      const { error } = await supabase
        .from('knowledge_base_config')
        .upsert({
          id: userId,  // User-specific ID
          user_id: userId,
          config: knowledgeBase,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.warn('Supabase save failed (localStorage still saved):', error.message);
      } else {
        console.log('✅ Saved knowledge base to Supabase for user:', userId);
      }

      return true;
    } catch (error) {
      console.error('Error saving knowledge base:', error);
      // localStorage save already done
      return true;
    }
  }, [knowledgeBase, getUserId]);

  // Load knowledge base from Supabase (uses agentId if on user-facing page, else own user)
  const loadKnowledgeBase = useCallback(async (): Promise<void> => {
    try {
      const configOwnerId = initialAgentId || getUserId();
      if (configOwnerId === 'anonymous') return;

      // Load the config for the appropriate owner (agent or self)
      const { data, error } = await supabase
        .from('knowledge_base_config')
        .select('*')
        .eq('user_id', configOwnerId)
        .single();

      if (!error && data?.config) {
        setKnowledgeBase(prev => ({ ...prev, ...(data.config as KnowledgeBaseConfig) }));
        localStorage.setItem(KNOWLEDGE_BASE_KEY, JSON.stringify(data.config));
        console.log(`✅ Loaded knowledge base from Supabase for ${initialAgentId ? 'agent' : 'user'}:`, configOwnerId);
      }
    } catch (error) {
      console.error('Error loading knowledge base:', error);
    }
  }, [getUserId, initialAgentId]);

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
  const startCall = useCallback(async (type: 'voice' | 'text' = 'text') => {
    const newCall: CallSession = {
      id: `call-${Date.now()}`,
      startTime: new Date(),
      status: 'active',
      type,
      messages: [],
      extractedFields: [],
      priority: 'medium',
    };
    console.log('📞 Starting new call/session:', { id: newCall.id, type, requestedType: type });
    setCurrentCall(newCall);
    // Persist active call locally
    localStorage.setItem(ACTIVE_CALL_KEY, JSON.stringify(newCall));

    // Also register via edge function for global visibility
    try {
      const { data: { session: authSession } } = await supabase.auth.getSession();
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/api-sessions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authSession?.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'start',
          id: newCall.id,
          session_type: type,
          started_at: newCall.startTime.toISOString()
        })
      });
      console.log('📡 Session registered for global sync:', newCall.id);
    } catch (e) {
      console.error('📡 Session registration error:', e);
    }
  }, []);

  // Heartbeat: Update last_activity while call is active to prevent stale session cleanup
  useEffect(() => {
    if (!currentCall || currentCall.status !== 'active') return;

    const updateHeartbeat = async () => {
      try {
        const { data: { session: authSession } } = await supabase.auth.getSession();
        await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/api-sessions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authSession?.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'heartbeat',
            id: currentCall.id
          })
        });
        console.log('💓 Session heartbeat updated:', currentCall.id);
      } catch (e) {
        // Silently fail - not critical
      }
    };

    // Update heartbeat every 30 seconds
    const heartbeatInterval = setInterval(updateHeartbeat, 30 * 1000);

    // Initial update
    updateHeartbeat();

    return () => clearInterval(heartbeatInterval);
  }, [currentCall?.id, currentCall?.status]);

  // Cache the session token for use in beforeunload (async APIs don't work there)
  const [cachedToken, setCachedToken] = useState<string | null>(null);
  useEffect(() => {
    const updateToken = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setCachedToken(session?.access_token || null);
      } catch {
        // Silent fail
      }
    };
    updateToken();
    const interval = setInterval(updateToken, 60000); // Refresh every 60s
    return () => clearInterval(interval);
  }, []);

  // Cleanup session when tab/window closes
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentCall?.status === 'active') {
        const token = cachedToken || '';

        try {
          // Mark as ended first via localStorage so other tabs can see
          localStorage.removeItem(ACTIVE_CALL_KEY);

          // Attempt cleanup via edge function
          fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/api-sessions`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              action: 'end',
              id: currentCall.id
            }),
            keepalive: true,
          });
        } catch (e) {
          // Silent fail - cleanup will happen via stale session cleanup
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentCall?.id, currentCall?.status, cachedToken]);

  // Helper to find caller name from various sources
  const findCallerName = (call: CallSession): string => {
    // First try extracted fields (most reliable)
    const nameField = call.extractedFields.find(f =>
      f.id === 'name' ||
      f.label.toLowerCase().includes('name') ||
      f.label.toLowerCase().includes('caller')
    );
    if (nameField?.value && nameField.value.trim() && nameField.value !== 'Unknown Caller') {
      console.log('✅ Found caller name from extracted fields:', nameField.value);
      return nameField.value.trim();
    }

    // Common words to filter out as false positives
    const commonWords = ['hello', 'hi', 'hey', 'yes', 'no', 'okay', 'sure', 'thanks', 'thank', 'you', 'the', 'a', 'an', 'how', 'can', 'help', 'may', 'please', 'need', 'want', 'have', 'for', 'reaching', 'out', 'your', 'this', 'that', 'with', 'about', 'today', 'there', 'got', 'it'];

    // Try to find name in messages where user introduced themselves
    const userMessages = call.messages.filter(m => m.speaker === 'user');
    for (const msg of userMessages) {
      // Common patterns: "My name is X", "I'm X", "This is X", "I am X", "Hi, I'm X", "Hello, this is X"
      const patterns = [
        /(?:my name is|i'?m|this is|i am|call me|hi,?\s*i'?m|hello,?\s*this is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
        /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:here|calling|speaking)/i,
        /(?:hi|hello),?\s*([A-Z][a-z]+)/i,
        // Pattern for just stating name directly like "Animesh Mishra" or "Animesh Mishra 9650848339"
        /^([A-Z][a-z]+\s+[A-Z][a-z]+)(?:\s+\d+)?$/i,
        // Pattern for "im Animesh" or "its Animesh"
        /(?:im|its|it's)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
      ];

      for (const pattern of patterns) {
        const match = msg.text.match(pattern);
        if (match?.[1]) {
          const name = match[1].trim();
          // Filter out common false positives
          if (!commonWords.includes(name.toLowerCase()) && name.length > 2) {
            console.log('✅ Found caller name from message pattern:', name);
            return name;
          }
        }
      }
    }

    // Try agent messages that might reference the caller's name
    const agentMessages = call.messages.filter(m => m.speaker === 'agent');
    for (const msg of agentMessages) {
      const patterns = [
        /(?:hi|hello),?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
        /(?:thanks|thank you),?\s+([A-Z][a-z]+)/i,
        // Pattern for "Mr./Ms./Mrs. X" - common in formal responses
        /(?:Mr\.?|Ms\.?|Mrs\.?)\s+([A-Z][a-z]+)/i,
        // Pattern for "Hello, Mr. Mishra" style
        /(?:hello|hi),?\s+(?:Mr\.?|Ms\.?|Mrs\.?)\s+([A-Z][a-z]+)/i,
      ];
      for (const pattern of patterns) {
        const match = msg.text.match(pattern);
        if (match?.[1]) {
          const name = match[1].trim();
          if (!commonWords.includes(name.toLowerCase()) && name.length > 2) {
            console.log('✅ Found caller name from agent message:', name);
            return name;
          }
        }
      }
    }

    console.log('⚠️ Could not find caller name, using "Unknown Caller"');
    return 'Unknown Caller';
  };

  const endCall = useCallback(async () => {
    if (currentCall) {
      // 1. Capture data
      const endedCall: CallSession = {
        ...currentCall,
        endTime: new Date(),
        status: 'ended',
      };
      const duration = Math.floor((new Date().getTime() - endedCall.startTime.getTime()) / 1000);

      // 2. Clear UI immediately (Optimistic update)
      setCurrentCall(null);
      localStorage.removeItem(ACTIVE_CALL_KEY);

      // Also remove from active_sessions via edge function
      try {
        const { data: { session: authSession } } = await supabase.auth.getSession();
        await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/api-sessions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authSession?.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'end',
            id: endedCall.id
          })
        });
        console.log('📡 Session removed from global sync:', endedCall.id);
      } catch (e) {
        // Silently fail - table might not exist
      }

      // 3. Process summary and save in background
      // We wrap this in a self-executing logic so the main thread is free
      (async () => {
        try {
          // Get initial caller name from various sources
          let callerName = findCallerName(endedCall);

          let finalCategory = endedCall.category;
          let finalPriority = endedCall.priority;

          // Create history item immediately with placeholder summary
          const historyId = `history-${Date.now()}`;
          const placeholderSummary: CallSummary = {
            mainPoints: ['Call completed'],
            sentiment: 'neutral',
            actionItems: [],
            followUpRequired: endedCall.priority === 'high' || endedCall.priority === 'critical',
            notes: '⏳ Generating summary...',
          };

          // Create initial history item with placeholder
          const initialHistoryItem: CallHistoryItem = {
            id: historyId,
            callerName,
            date: endedCall.startTime,
            duration,
            type: endedCall.type,
            messages: endedCall.messages,
            extractedFields: endedCall.extractedFields,
            category: finalCategory,
            priority: finalPriority,
            tags: [],
            summary: placeholderSummary,
          };

          // Add to history IMMEDIATELY so user sees it
          setCallHistory(prev => [initialHistoryItem, ...prev]);
          console.log('📝 Call added to history immediately:', historyId);

          // IMMEDIATELY save to Supabase so real-time sync works across tabs/pages
          try {
            const initialPayload = {
              id: initialHistoryItem.id,
              caller_name: initialHistoryItem.callerName,
              date: initialHistoryItem.date.toISOString(),
              duration: initialHistoryItem.duration,
              type: initialHistoryItem.type,
              messages: initialHistoryItem.messages.map(m => ({ ...m, timestamp: m.timestamp.toISOString() })),
              extracted_fields: initialHistoryItem.extractedFields.map(f => ({ ...f, extractedAt: f.extractedAt.toISOString() })),
              category: initialHistoryItem.category,
              priority: initialHistoryItem.priority,
              tags: initialHistoryItem.tags,
              summary: initialHistoryItem.summary,
              sentiment: 'neutral',
              follow_up_required: initialHistoryItem.summary.followUpRequired,
              user_id: user?.id,
              agent_id: agentId || user?.id || null
            };
            const { data: { session: authSession } } = await supabase.auth.getSession();
            await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/api-history`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${authSession?.access_token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ action: 'create', ...initialPayload })
            });
            console.log('📡 Call synced via edge function for real-time updates');
          } catch (syncError) {
            console.warn('Initial sync to Supabase failed:', syncError);
          }

          // Now generate summary in background and update
          let finalSummary = placeholderSummary;
          let tags: string[] = [];

          try {
            if (endedCall.messages.length > 0) {
              console.log('🤖 Generating AI summary in background...');

              // Wrap in a timeout promise to prevent hanging
              const summaryPromise = aiService.generateSummary(
                endedCall.messages,
                endedCall.extractedFields,
                endedCall.category,
                endedCall.priority
              );

              // Race against a 45-second timeout
              const timeoutPromise = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('Notes generation timed out after 35s')), 35000)
              );

              const summaryResponse = await Promise.race([summaryPromise, timeoutPromise]);

              finalSummary = summaryResponse.summary;
              tags = summaryResponse.tags;

              if (summaryResponse.callerName && callerName === 'Unknown Caller') {
                callerName = summaryResponse.callerName;
              }
              console.log('✅ AI summary generated successfully');
            }
          } catch (error) {
            console.error('❌ Error generating AI summary:', error);
            // Keep placeholder summary but update the note
            finalSummary = {
              ...placeholderSummary,
              notes: `Summary generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            };
          }

          if (callerName === 'Unknown Caller') {
            callerName = findCallerName(endedCall);
          }

          // Create the final history item with real summary
          const finalHistoryItem: CallHistoryItem = {
            id: historyId,
            callerName,
            date: endedCall.startTime,
            duration,
            type: endedCall.type,
            messages: endedCall.messages,
            extractedFields: endedCall.extractedFields,
            category: finalCategory,
            priority: finalPriority,
            tags,
            summary: finalSummary,
          };

          // Update history with the final summary
          setCallHistory(prev => prev.map(item =>
            item.id === historyId ? finalHistoryItem : item
          ));
          console.log('📝 Call history updated with summary:', historyId);

          // Save to Supabase
          try {
            // Build base payload
            const basePayload = {
              id: finalHistoryItem.id,
              caller_name: finalHistoryItem.callerName,
              date: finalHistoryItem.date.toISOString(),
              duration: finalHistoryItem.duration,
              messages: finalHistoryItem.messages.map(m => ({ ...m, timestamp: m.timestamp.toISOString() })),
              extracted_fields: finalHistoryItem.extractedFields.map(f => ({ ...f, extractedAt: f.extractedAt.toISOString() })),
              category: finalHistoryItem.category,
              priority: finalHistoryItem.priority,
              tags: finalHistoryItem.tags,
              summary: finalHistoryItem.summary,
              sentiment: finalHistoryItem.summary.sentiment || 'neutral',
              follow_up_required: finalHistoryItem.summary.followUpRequired || false,
              user_id: user?.id
            };

            console.log('💾 Saving final call history via edge function:', { id: finalHistoryItem.id, type: finalHistoryItem.type });

            const { data: { session: authSession } } = await supabase.auth.getSession();
            const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/api-history`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${authSession?.access_token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                action: 'upsert',
                ...basePayload,
                type: finalHistoryItem.type
              })
            });

            if (!res.ok) {
              const errData = await res.json().catch(() => ({}));
              console.error('Error updating call with summary:', errData);
            } else {
              console.log('📡 Call updated with summary via edge function');
            }
          } catch (error) {
            console.error('Error saving call to Supabase:', error);
          }
          console.log('✅ Background call processing complete for:', historyId);
        } catch (bgError) {
          console.error('❌ Background processing error:', bgError);
        }
      })();
    }
  }, [currentCall, knowledgeBase, getUserId]); // Ensure check dependencies

  const addMessage = useCallback((speaker: 'user' | 'agent', text: string) => {
    // Use functional update to avoid stale closure issues
    // The message will be added if there's an active call in the current state
    setCurrentCall(prev => {
      if (!prev) {
        console.warn('⚠️ addMessage called but no active call session. Message:', text.substring(0, 50));
        return null;
      }
      const message: CallMessage = {
        id: `msg-${Date.now()}`,
        speaker,
        text,
        timestamp: new Date(),
      };
      console.log(`📨 Adding ${speaker} message to call:`, text.substring(0, 50) + '...');
      const updated = {
        ...prev,
        messages: [...prev.messages, message],
      };
      // Persist to localStorage
      localStorage.setItem(ACTIVE_CALL_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

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
    let validCalls = 0;

    callHistory.forEach(call => {
      byPriority[call.priority]++;
      if (call.category) {
        byCategory[call.category.id] = (byCategory[call.category.id] || 0) + 1;
      }

      // Per call check logic: handle old db values recorded in ms (e.g. 500000 = 8 mins)
      let parsedDuration = call.duration || 0;
      if (parsedDuration > 10000) {
        parsedDuration = Math.floor(parsedDuration / 1000);
      }

      totalDuration += parsedDuration;
      validCalls++;

      if (call.summary.followUpRequired) followUpCount++;
    });

    return {
      totalCalls: callHistory.length,
      byPriority,
      byCategory,
      avgDuration: validCalls > 0 ? totalDuration / validCalls : 0,
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
    getCurrentUserId: getUserId,
    switchSession,
    agentId,
    globalActiveSessions,
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
