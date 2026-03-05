/**
 * TTS Service for ClerkTree
 * 
 * Provides text-to-speech functionality with multiple backends:
 * 1. Groq TTS (English - using canopylabs/orpheus-v1-english model)
 * 2. ElevenLabs TTS (German - using multilingual v2 model)
 * 
 * The service automatically routes to the appropriate backend based on language.
 */

import { groqTTSService, OrpheusVoiceId, ORPHEUS_VOICES, VocalDirection } from './groqTTSService';
import { elevenLabsTTSService } from './elevenLabsTTSService';
import { deapiTTSService, DeAPIVoiceId } from './deapiTTSService';
import { normalizeVoiceId } from '../config/voiceConfig';

// Supported languages
export type TTSLanguage = 'en' | 'de';

export const TTS_LANGUAGES = {
  en: { name: 'English', code: 'en-US' },
  de: { name: 'Deutsch', code: 'de-DE' },
} as const;

// Re-export Orpheus types for direct access
export type { OrpheusVoiceId, VocalDirection };
export { ORPHEUS_VOICES };

type TTSBackend = 'groq' | 'elevenlabs' | 'deapi' | 'browser';

// Voice provider for the /call endpoint (selected in dashboard)
export type VoiceProvider = 'deapi' | 'elevenlabs';

interface TTSConfig {
  preferredBackend: TTSBackend;
  useGroqTTS: boolean;
  fallbackToBrowser: boolean;
  defaultOrpheusVoice: OrpheusVoiceId;
  speed: number;
  vocalDirection: VocalDirection;
  voiceProvider: VoiceProvider;
  deapiVoice: DeAPIVoiceId;
}

import log from '../utils/logger';

class TTSService {
  private config: TTSConfig & { language: TTSLanguage } = {
    preferredBackend: 'groq',
    useGroqTTS: true,
    fallbackToBrowser: true,
    defaultOrpheusVoice: 'autumn',
    speed: 1.0,
    vocalDirection: 'professional',
    language: 'en',
    voiceProvider: 'deapi',
    deapiVoice: 'Vivian',
  };

  private groqAvailable: boolean | null = null;
  private currentBackend: TTSBackend | null = null;

  resolveOrpheusVoiceId(voiceId?: string | null): OrpheusVoiceId {
    if (!voiceId) {
      return this.config.defaultOrpheusVoice;
    }
    return normalizeVoiceId(voiceId, this.config.defaultOrpheusVoice);
  }

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
  setVoice(voiceId: string) {
    this.config.defaultOrpheusVoice = this.resolveOrpheusVoiceId(voiceId);
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
   * Get/set the voice provider for the /call endpoint
   */
  getVoiceProvider(): VoiceProvider {
    return this.config.voiceProvider;
  }

  setVoiceProvider(provider: VoiceProvider) {
    this.config.voiceProvider = provider;
    log.debug(`🔊 Voice provider set to: ${provider}`);
  }

  setDeAPIVoice(voice: DeAPIVoiceId) {
    this.config.deapiVoice = voice;
  }

  getDeAPIVoice(): DeAPIVoiceId {
    return this.config.deapiVoice;
  }

  // Cancellation flag for sentence-level streaming
  private cancelled = false;

  /**
   * Stop audio playback on all backends (without cancelling streaming loop)
   */
  private stopAudio() {
    groqTTSService.stop();
    deapiTTSService.stop();
    elevenLabsTTSService.stop();
  }

  /**
   * Stop any currently playing audio and cancel queued sentences
   */
  stop() {
    this.cancelled = true;
    this.stopAudio();
  }

  /**
   * Split text into speakable sentence chunks.
   * Splits on sentence-ending punctuation while keeping the punctuation attached.
   */
  private splitIntoSentences(text: string): string[] {
    // Split on sentence boundaries (.!?) followed by space or end of string
    // Keep short fragments together to avoid tiny TTS calls
    const raw = text.match(/[^.!?]+[.!?]+[\s]*/g) || [text];
    const sentences: string[] = [];
    let buffer = '';

    for (const chunk of raw) {
      buffer += chunk;
      // Only split if the buffer is long enough (>20 chars) to avoid tiny fragments
      if (buffer.trim().length >= 20) {
        sentences.push(buffer.trim());
        buffer = '';
      }
    }
    // Push any remaining buffer
    if (buffer.trim()) {
      if (sentences.length > 0) {
        // Attach short trailing fragment to last sentence
        sentences[sentences.length - 1] += ' ' + buffer.trim();
      } else {
        sentences.push(buffer.trim());
      }
    }

    return sentences.filter(s => s.length > 0);
  }

  /**
   * Speak text using sentence-level streaming for low latency.
   * Splits the text into sentences, speaks the first one immediately,
   * and queues the rest to play sequentially.
   * 
   * onStart fires when the first sentence starts playing.
   * onEnd fires when the last sentence finishes.
   */
  async speakStreaming(
    text: string,
    options?: {
      voice?: string;
      orpheusVoice?: OrpheusVoiceId;
      speed?: number;
      vocalDirection?: VocalDirection;
      language?: TTSLanguage;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (error: Error) => void;
    }
  ): Promise<void> {
    const sentences = this.splitIntoSentences(text);

    if (sentences.length === 0) {
      options?.onEnd?.();
      return;
    }

    // If only one sentence, just use normal speak (no overhead)
    if (sentences.length === 1) {
      return this.speak(text, options);
    }

    // Reset cancellation
    this.cancelled = false;

    log.debug(`📝 Sentence streaming: ${sentences.length} chunks`, sentences.map(s => s.substring(0, 40) + '...'));

    let started = false;

    for (let i = 0; i < sentences.length; i++) {
      if (this.cancelled) {
        log.debug('⏹️ Sentence streaming cancelled');
        break;
      }

      const isFirst = i === 0;
      const isLast = i === sentences.length - 1;
      const sentence = sentences[i];

      try {
        await this.speak(sentence, {
          ...options,
          onStart: () => {
            if (!started) {
              started = true;
              options?.onStart?.();
            }
          },
          onEnd: isLast ? options?.onEnd : undefined,
          onError: undefined, // Handle errors below
        });
      } catch (error) {
        log.error(`❌ Sentence ${i + 1}/${sentences.length} failed:`, error);
        // Skip this sentence and continue with the next
        if (isLast) {
          options?.onEnd?.();
        }
      }
    }

    // If cancelled before any sentence played, still fire onEnd
    if (this.cancelled && !started) {
      options?.onEnd?.();
    }
  }

  /**
   * Unlock audio playback - must be called during a user gesture (click/tap)
   * This is required by browser autoplay policies
   */
  async unlockAudio(): Promise<void> {
    await Promise.all([
      groqTTSService.unlockAudio(),
      deapiTTSService.initAudioContext(),
      elevenLabsTTSService.initAudioContext()
    ]);
  }

  /**
   * Speak text using appropriate TTS backend based on language
   * - English: Groq TTS
   * - German: ElevenLabs TTS
   */
  async speak(
    text: string,
    options?: {
      voice?: string;
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
    const orpheusVoice = options?.orpheusVoice || this.resolveOrpheusVoiceId(options?.voice);
    const speed = options?.speed || this.config.speed;
    const vocalDirection = options?.vocalDirection || this.config.vocalDirection;

    // Stop any current playback (but don't cancel streaming loop)
    this.stopAudio();

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
        this.currentBackend = 'elevenlabs';
        return;
      } catch (error) {
        log.error('❌ ElevenLabs TTS failed:', error);
        options?.onError?.(error as Error);
        options?.onEnd?.();
        return;
      }
    }

    // Check if ElevenLabs is the selected voice provider (for all languages)
    if (this.config.voiceProvider === 'elevenlabs') {
      try {
        log.debug('🎤 Using ElevenLabs TTS (selected provider)...');
        await elevenLabsTTSService.speak(text, {
          speed,
          onStart: options?.onStart,
          onEnd: options?.onEnd,
          onError: options?.onError,
        });
        this.currentBackend = 'elevenlabs';
        return;
      } catch (error) {
        log.error('❌ ElevenLabs TTS failed, falling back to Groq:', error);
        // Fall through to Groq TTS as fallback
      }
    }

    // Check if DeAPI is the selected voice provider
    if (this.config.voiceProvider === 'deapi') {
      try {
        log.debug('🎤 Using DeAPI TTS...');
        await deapiTTSService.speak(text, {
          voice: this.config.deapiVoice,
          speed,
          lang: language === 'de' ? 'German' : 'English',
          onStart: options?.onStart,
          onEnd: options?.onEnd,
          onError: options?.onError,
        });
        this.currentBackend = 'deapi';
        return;
      } catch (error) {
        log.error('❌ DeAPI TTS failed, falling back to Groq:', error);
        // Fall through to Groq TTS as fallback
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
}

// Export singleton instance
export const ttsService = new TTSService();

// Initialize on import
ttsService.initialize().catch(console.error);

export default ttsService;
