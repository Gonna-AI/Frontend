export const GROQ_VOICE_DEFINITIONS = {
  autumn: { name: 'Autumn', gender: 'female', description: 'Professional female voice' },
  diana: { name: 'Diana', gender: 'female', description: 'Warm female voice' },
  hannah: { name: 'Hannah', gender: 'female', description: 'Friendly female voice' },
  austin: { name: 'Austin', gender: 'male', description: 'Professional male voice' },
  daniel: { name: 'Daniel', gender: 'male', description: 'Friendly male voice' },
  troy: { name: 'Troy', gender: 'male', description: 'Deep male voice' },
} as const;

export type OrpheusVoiceId = keyof typeof GROQ_VOICE_DEFINITIONS;

type LegacyVoiceId =
  | 'af_nova'
  | 'af_sky'
  | 'af_bella'
  | 'af_nicole'
  | 'af_sarah'
  | 'bf_emma'
  | 'bf_isabella'
  | 'am_adam'
  | 'am_michael'
  | 'bm_george'
  | 'bm_lewis';

export interface VoiceConfig {
  id: OrpheusVoiceId;
  name: string;
  gender: 'male' | 'female';
  description: string;
}

const LEGACY_TO_ORPHEUS_VOICE_MAP: Record<LegacyVoiceId, OrpheusVoiceId> = {
  af_nova: 'autumn',
  af_sky: 'diana',
  af_bella: 'hannah',
  af_nicole: 'autumn',
  af_sarah: 'diana',
  bf_emma: 'hannah',
  bf_isabella: 'diana',
  am_adam: 'austin',
  am_michael: 'daniel',
  bm_george: 'troy',
  bm_lewis: 'austin',
};

const ORPHEUS_VOICE_IDS = Object.keys(GROQ_VOICE_DEFINITIONS) as OrpheusVoiceId[];
const ORPHEUS_VOICE_ID_SET = new Set<string>(ORPHEUS_VOICE_IDS);

export const DEFAULT_VOICE_ID: OrpheusVoiceId = 'autumn';
export const DEFAULT_VOICE = DEFAULT_VOICE_ID;

export const AVAILABLE_VOICES: VoiceConfig[] = ORPHEUS_VOICE_IDS.map((id) => ({
  id,
  name: GROQ_VOICE_DEFINITIONS[id].name,
  gender: GROQ_VOICE_DEFINITIONS[id].gender,
  description: GROQ_VOICE_DEFINITIONS[id].description,
}));

export const toOrpheusVoiceId = (voiceId?: string | null): OrpheusVoiceId | null => {
  if (!voiceId) {
    return null;
  }
  if (ORPHEUS_VOICE_ID_SET.has(voiceId)) {
    return voiceId as OrpheusVoiceId;
  }
  return LEGACY_TO_ORPHEUS_VOICE_MAP[voiceId as LegacyVoiceId] || null;
};

export const normalizeVoiceId = (
  voiceId?: string | null,
  fallback: OrpheusVoiceId = DEFAULT_VOICE_ID,
): OrpheusVoiceId => {
  return toOrpheusVoiceId(voiceId) || fallback;
};

export const getVoiceById = (id: string): VoiceConfig | undefined => {
  const normalized = normalizeVoiceId(id);
  return AVAILABLE_VOICES.find((voice) => voice.id === normalized);
};

export const getVoicesByGender = (gender: 'male' | 'female'): VoiceConfig[] => {
  return AVAILABLE_VOICES.filter((voice) => voice.gender === gender);
};
