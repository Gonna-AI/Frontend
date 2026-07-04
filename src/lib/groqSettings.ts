import { supabase } from '../config/supabase';

type VoiceProviderType = 'deapi' | 'elevenlabs';

export interface GroqSettings {
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  systemPromptEnabled: boolean;
  voiceProvider: VoiceProviderType;
}

const DEFAULT_SETTINGS: GroqSettings = {
  model: 'llama-3.3-70b-versatile',
  temperature: 0.7,
  maxTokens: 2048,
  topP: 1.0,
  frequencyPenalty: 0,
  presencePenalty: 0,
  systemPromptEnabled: true,
  voiceProvider: 'deapi',
};

const STORAGE_KEY_PREFIX = 'clerktree_groq_settings_';
let cachedUserId: string | null = null;

supabase.auth.getSession().then(({ data: { session } }) => {
  cachedUserId = session?.user?.id ?? null;
});

supabase.auth.onAuthStateChange((_event, session) => {
  cachedUserId = session?.user?.id ?? null;
});

function getStorageKey(userId?: string): string {
  const id = userId || cachedUserId;
  return id ? `${STORAGE_KEY_PREFIX}${id}` : 'clerktree_groq_settings';
}

export function getGroqSettings(): GroqSettings {
  try {
    const stored = localStorage.getItem(getStorageKey());
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch {
    // Keep the copilot usable even if storage is unavailable or malformed.
  }

  return DEFAULT_SETTINGS;
}
