/**
 * TTS Service for ClerkTree
 * 
 * Provides text-to-speech functionality with multiple backends:
 * 1. Groq TTS (primary - using canopylabs/orpheus-v1-english model)
 * 2. Kokoro TTS API (secondary - higher quality, requires backend)
 * 3. Browser Web Speech API (fallback - works offline)
 * 
 * The service automatically falls back to the next available option.
 */

import { groqTTSService, OrpheusVoiceId, ORPHEUS_VOICES, VocalDirection } from './groqTTSService';

// TTS API Configuration (Kokoro backend)
const TTS_API_URL = import.meta.env.VITE_TTS_API_URL || 'http://localhost:5001';

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

class TTSService {
  private config: TTSConfig = {
    preferredBackend: 'groq',
    useGroqTTS: true,
    useKokoroTTS: true,
    fallbackToBrowser: true,
    defaultVoice: 'af_nova',
    defaultOrpheusVoice: 'autumn',
    speed: 1.0,
    vocalDirection: 'professional',
  };

  private kokoroAvailable: boolean | null = null;
  private groqAvailable: boolean | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private currentBackend: TTSBackend | null = null;

  /**
   * Initialize TTS service and check all backends
   */
  async initialize(): Promise<boolean> {
    console.log('🎤 Initializing TTS Service...');

    // Initialize Groq TTS
    try {
      this.groqAvailable = await groqTTSService.initialize();
      console.log(`   Groq TTS: ${this.groqAvailable ? '✅ Available' : '❌ Not available'}`);
    } catch (error) {
      console.warn('   Groq TTS: ❌ Failed to initialize', error);
      this.groqAvailable = false;
    }

    // Kokoro TTS is disabled - skip initialization
    this.kokoroAvailable = false;

    // Determine current backend
    if (this.groqAvailable && this.config.useGroqTTS) {
      this.currentBackend = 'groq';
    } else {
      this.currentBackend = 'browser';
    }

    console.log(`🔊 TTS Backend: ${this.currentBackend}`);
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
   * Speak text using Groq TTS only (no browser fallback)
   */
  async speak(
    text: string,
    options?: {
      voice?: KokoroVoiceId;
      orpheusVoice?: OrpheusVoiceId;
      speed?: number;
      vocalDirection?: VocalDirection;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (error: Error) => void;
    }
  ): Promise<void> {
    const kokoroVoice = options?.voice || this.config.defaultVoice;
    const orpheusVoice = options?.orpheusVoice || VOICE_MAPPING[kokoroVoice] || this.config.defaultOrpheusVoice;
    const speed = options?.speed || this.config.speed;
    const vocalDirection = options?.vocalDirection || this.config.vocalDirection;

    // Stop any current playback
    this.stop();

    // Use Groq TTS only (no browser fallback)
    if (this.config.useGroqTTS && this.groqAvailable !== false) {
      try {
        console.log('🎤 Using Groq TTS...');
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
        console.error('❌ Groq TTS failed:', error);
        // Don't fallback to browser - just call onEnd to continue the flow
        options?.onEnd?.();
        return;
      }
    }

    // If Groq is not available, just log and call onEnd
    console.warn('⚠️ Groq TTS not available, skipping speech');
    options?.onEnd?.();
  }

  /**
   * Speak using Kokoro TTS API
   */
  private async speakWithKokoro(
    text: string,
    voice: KokoroVoiceId,
    speed: number,
    options?: {
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (error: Error) => void;
    }
  ): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 120000); // 120 second timeout

      try {
        // Call TTS API
        const response = await fetch(`${TTS_API_URL}/speak`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            voice,
            speed,
          }),
          signal: abortController.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'TTS API error');
        }

        // Get audio blob
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        // Create audio element
        this.currentAudio = new Audio(audioUrl);

        this.currentAudio.onloadeddata = () => {
          options?.onStart?.();
        };

        this.currentAudio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          this.currentAudio = null;
          options?.onEnd?.();
          resolve();
        };

        this.currentAudio.onerror = () => {
          URL.revokeObjectURL(audioUrl);
          this.currentAudio = null;
          const error = new Error('Audio playback failed');
          options?.onError?.(error);
          reject(error);
        };

        // Play audio
        await this.currentAudio.play();

      } catch (error) {
        clearTimeout(timeoutId);
        // Check if it's an abort error
        if (error instanceof Error && error.name === 'AbortError') {
          const abortError = new Error('TTS request timed out or was aborted');
          options?.onError?.(abortError);
          reject(abortError);
        } else {
          options?.onError?.(error as Error);
          reject(error);
        }
      }
    });
  }

  /**
   * Speak using browser Web Speech API (fallback)
   */
  private speakWithBrowser(
    text: string,
    voice: KokoroVoiceId,
    speed: number,
    options?: {
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (error: Error) => void;
    }
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!window.speechSynthesis) {
        const error = new Error('Browser does not support speech synthesis');
        options?.onError?.(error);
        reject(error);
        return;
      }

      console.log('🎤 Using Browser TTS for:', text.substring(0, 50) + '...');

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = speed;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Track if speech has actually started
      let speechStarted = false;
      let speechStartTime = 0;

      // Function to set voice and speak
      const speakWithVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        const voiceInfo = KOKORO_VOICES[voice];

        if (voiceInfo && voices.length > 0) {
          // Try to find a voice that matches the accent
          const langCode = voiceInfo.accent === 'British' ? 'en-GB' : 'en-US';
          const matchingVoice = voices.find(v =>
            v.lang.startsWith(langCode.substring(0, 2)) &&
            v.name.toLowerCase().includes(voiceInfo.gender === 'female' ? 'female' : 'male')
          ) || voices.find(v => v.lang.startsWith(langCode.substring(0, 2))) || voices[0];

          if (matchingVoice) {
            utterance.voice = matchingVoice;
            console.log('🔊 Selected voice:', matchingVoice.name);
          }
        }

        utterance.onstart = () => {
          console.log('🔊 Browser TTS started speaking');
          speechStarted = true;
          speechStartTime = Date.now();
          options?.onStart?.();
        };

        utterance.onend = () => {
          const duration = Date.now() - speechStartTime;
          console.log('🔊 Browser TTS ended, duration:', duration, 'ms');

          // Check if speech actually happened (minimum duration check)
          // If it ended too quickly, it might have failed silently
          if (!speechStarted || duration < 200) {
            console.warn('⚠️ Speech may not have played correctly (too short or never started)');
            // Still call onEnd to not block the flow
          }

          options?.onEnd?.();
          resolve();
        };

        utterance.onerror = (e) => {
          console.error('🔊 Browser TTS error:', e.error);
          const error = new Error(`Speech synthesis error: ${e.error}`);
          options?.onError?.(error);
          reject(error);
        };

        // Speak
        window.speechSynthesis.speak(utterance);

        // Mobile Safari workaround: sometimes speech doesn't start
        // Force a resume after a short delay
        setTimeout(() => {
          if (!speechStarted && window.speechSynthesis.paused) {
            console.log('🔊 Resuming paused speech synthesis');
            window.speechSynthesis.resume();
          }
        }, 100);
      };

      // Check if voices are loaded
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) {
        // Voices not loaded yet, wait for them
        console.log('🔊 Waiting for voices to load...');
        window.speechSynthesis.addEventListener('voiceschanged', speakWithVoice, { once: true });
        // Fallback: if voices don't load in 500ms, try anyway
        setTimeout(() => {
          if (!speechStarted) {
            speakWithVoice();
          }
        }, 500);
      } else {
        speakWithVoice();
      }
    });
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
