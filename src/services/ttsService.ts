/**
 * TTS Service for ClerkTree
 * 
 * Provides text-to-speech functionality with multiple backends:
 * 1. Groq TTS (English - using canopylabs/orpheus-v1-english model)
 * 2. ElevenLabs TTS (German - using multilingual v2 model)
 * 3. Browser Web Speech API (fallback - works offline)
 * 
 * The service automatically routes to the appropriate backend based on language.
 */

import { groqTTSService, OrpheusVoiceId, ORPHEUS_VOICES, VocalDirection } from './groqTTSService';
import { elevenLabsTTSService } from './elevenLabsTTSService';

// Supported languages
export type TTSLanguage = 'en' | 'de';

export const TTS_LANGUAGES = {
  en: { name: 'English', code: 'en-US' },
  de: { name: 'Deutsch', code: 'de-DE' },
} as const;

// Available voices (matches Kokoro TTS - for backward compatibility)
export const KOKORO_VOICES = {
  af_nova: { name: 'Nova', gender: 'female', accent: 'American' },
  af_sky: { name: 'Sky', gender: 'female', accent: 'American' },
  af_bella: { name: 'Bella', gender: 'female', accent: 'American' },
  af_nicole: { name: 'Nicole', gender: 'female', accent: 'American' },
  af_sarah: { name: 'Sarah', gender: 'female', accent: 'American' },
  bf_emma: { name: 'Emma', gender: 'female', accent: 'British' },
  bf_isabella: { name: 'Isabella', gender: 'female', accent: 'British' },
  am_adam: { name: 'Adam', gender: 'male', accent: 'American' },
  am_michael: { name: 'Michael', gender: 'male', accent: 'American' },
  bm_george: { name: 'George', gender: 'male', accent: 'British' },
  bm_lewis: { name: 'Lewis', gender: 'male', accent: 'British' },
} as const;

export type KokoroVoiceId = keyof typeof KOKORO_VOICES;

// Map Kokoro voices to Orpheus voices for backward compatibility
const VOICE_MAPPING: Record<KokoroVoiceId, OrpheusVoiceId> = {
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

// Re-export Orpheus types for direct access
export type { OrpheusVoiceId, VocalDirection };
export { ORPHEUS_VOICES };

type TTSBackend = 'groq' | 'kokoro' | 'browser';

interface TTSConfig {
  preferredBackend: TTSBackend;
  useGroqTTS: boolean;
  useKokoroTTS: boolean;
  fallbackToBrowser: boolean;
  defaultVoice: KokoroVoiceId;
  defaultOrpheusVoice: OrpheusVoiceId;
  speed: number;
  vocalDirection: VocalDirection;
}

import log from '../utils/logger';

class TTSService {
  private config: TTSConfig & { language: TTSLanguage } = {
    preferredBackend: 'groq',
    useGroqTTS: true,
    useKokoroTTS: true,
    fallbackToBrowser: true,
    defaultVoice: 'af_nova',
    defaultOrpheusVoice: 'autumn',
    speed: 1.0,
    vocalDirection: 'professional',
    language: 'en',
  };

  private kokoroAvailable: boolean | null = null;
  private groqAvailable: boolean | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private currentBackend: TTSBackend | null = null;

  /**
   * Initialize TTS service and check all backends
   */
  async initialize(): Promise<boolean> {
    log.debug('🎤 Initializing TTS Service...');

    // Initialize Groq TTS
    try {
      this.groqAvailable = await groqTTSService.initialize();
      log.debug(`   Groq TTS: ${this.groqAvailable ? '✅ Available' : '❌ Not available'}`);
    } catch (error) {
      log.warn('   Groq TTS: ❌ Failed to initialize', error);
      this.groqAvailable = false;
    }

    // Check ElevenLabs availability (for German TTS)
    const elevenLabsAvailable = elevenLabsTTSService.isAvailable();
    log.debug(`   ElevenLabs TTS: ${elevenLabsAvailable ? '✅ Available (German)' : '❌ Not available (No API Key)'}`);

    // Kokoro TTS is disabled - skip initialization
    this.kokoroAvailable = false;

    // Determine current backend
    if (this.groqAvailable && this.config.useGroqTTS) {
      this.currentBackend = 'groq';
    } else {
      this.currentBackend = 'browser';
    }

    log.debug(`🔊 TTS Backend: ${this.currentBackend}`);
    return this.groqAvailable || true; // Browser is always available
  }

  /**
   * Set TTS configuration
   */
  setConfig(config: Partial<TTSConfig>) {
    this.config = { ...this.config, ...config };

    // Update Groq TTS config if relevant
    if (config.vocalDirection) {
      groqTTSService.setVocalDirection(config.vocalDirection);
    }
    if (config.defaultOrpheusVoice) {
      groqTTSService.setVoice(config.defaultOrpheusVoice);
    }
  }

  /**
   * Set the voice to use
   */
  setVoice(voiceId: KokoroVoiceId) {
    this.config.defaultVoice = voiceId;
    // Also update Orpheus voice mapping
    this.config.defaultOrpheusVoice = VOICE_MAPPING[voiceId];
    groqTTSService.setVoice(this.config.defaultOrpheusVoice);
  }

  /**
   * Set Orpheus voice directly
   */
  setOrpheusVoice(voiceId: OrpheusVoiceId) {
    this.config.defaultOrpheusVoice = voiceId;
    groqTTSService.setVoice(voiceId);
  }

  /**
   * Set vocal direction for expressive speech (Groq TTS only)
   */
  setVocalDirection(direction: VocalDirection) {
    this.config.vocalDirection = direction;
    groqTTSService.setVocalDirection(direction);
  }

  /**
   * Set the TTS language
   * - 'en': English (uses Groq TTS)
   * - 'de': German (uses ElevenLabs TTS)
   */
  setLanguage(language: TTSLanguage) {
    this.config.language = language;
    log.debug(`🌍 TTS language set to: ${TTS_LANGUAGES[language].name}`);
  }

  /**
   * Get the current TTS language
   */
  getLanguage(): TTSLanguage {
    return this.config.language;
  }

  /**
   * Stop any currently playing audio
   */
  stop() {
    // Stop Groq TTS
    groqTTSService.stop();

    // Stop any lingering Kokoro audio element
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
  }

  /**
   * Unlock audio playback - must be called during a user gesture (click/tap)
   * This is required by browser autoplay policies
   */
  async unlockAudio(): Promise<void> {
    await groqTTSService.unlockAudio();
  }

  /**
   * Speak text using appropriate TTS backend based on language
   * - English: Groq TTS
   * - German: ElevenLabs TTS
   */
  async speak(
    text: string,
    options?: {
      voice?: KokoroVoiceId;
      orpheusVoice?: OrpheusVoiceId;
      speed?: number;
      vocalDirection?: VocalDirection;
      language?: TTSLanguage;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (error: Error) => void;
    }
  ): Promise<void> {
    const language = options?.language || this.config.language;
    const kokoroVoice = options?.voice || this.config.defaultVoice;
    const orpheusVoice = options?.orpheusVoice || VOICE_MAPPING[kokoroVoice] || this.config.defaultOrpheusVoice;
    const speed = options?.speed || this.config.speed;
    const vocalDirection = options?.vocalDirection || this.config.vocalDirection;

    // Stop any current playback
    this.stop();

    // Route to appropriate TTS backend based on language
    if (language === 'de') {
      // German: Use ElevenLabs TTS
      try {
        log.debug('🇩🇪 Using ElevenLabs TTS for German...');
        await elevenLabsTTSService.speak(text, {
          speed,
          onStart: options?.onStart,
          onEnd: options?.onEnd,
          onError: options?.onError,
        });
        this.currentBackend = 'groq'; // Reuse enum, represents ElevenLabs
        return;
      } catch (error) {
        log.error('❌ ElevenLabs TTS failed:', error);
        options?.onError?.(error as Error);
        options?.onEnd?.();
        return;
      }
    }

    // English: Use Groq TTS
    if (this.config.useGroqTTS && this.groqAvailable !== false) {
      try {
        log.debug('🎤 Using Groq TTS for English...');
        await groqTTSService.speak(text, {
          voice: orpheusVoice,
          speed,
          vocalDirection,
          onStart: options?.onStart,
          onEnd: options?.onEnd,
          onError: options?.onError,
        });
        this.currentBackend = 'groq';
        return;
      } catch (error) {
        log.error('❌ Groq TTS failed:', error);
        options?.onError?.(error as Error);
        options?.onEnd?.();
        return;
      }
    }

    // If TTS is not available, just log and call onEnd.
    log.warn('⚠️ TTS not available, skipping speech');
    options?.onError?.(new Error('TTS not available'));
    options?.onEnd?.();
  }

  /**
   * Check if Groq TTS is available
   */
  isGroqTTSAvailable(): boolean {
    return this.groqAvailable === true;
  }

  /**
   * Check if Kokoro TTS is available
   */
  isKokoroAvailable(): boolean {
    return this.kokoroAvailable === true;
  }

  /**
   * Check if ElevenLabs TTS is available
   */
  isElevenLabsAvailable(): boolean {
    return elevenLabsTTSService.isAvailable();
  }

  /**
   * Get current TTS backend
   */
  getMode(): TTSBackend {
    return this.currentBackend || 'browser';
  }

  /**
   * Get available Orpheus voices (for Groq TTS)
   */
  getOrpheusVoices() {
    return ORPHEUS_VOICES;
  }

  /**
   * Get available Kokoro voices
   */
  getKokoroVoices() {
    return KOKORO_VOICES;
  }
}

// Export singleton instance
export const ttsService = new TTSService();

// Initialize on import
ttsService.initialize().catch(console.error);

export default ttsService;
