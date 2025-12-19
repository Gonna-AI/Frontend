/**
 * TTS Service for ClerkTree
 * 
 * Provides text-to-speech functionality using either:
 * 1. Kokoro TTS API (higher quality, requires backend)
 * 2. Browser Web Speech API (fallback, works offline)
 */

// TTS API Configuration
const TTS_API_URL = import.meta.env.VITE_TTS_API_URL || 'http://localhost:5001';

// Available voices (matches Kokoro TTS)
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

interface TTSConfig {
  useKokoroTTS: boolean;
  fallbackToBrowser: boolean;
  defaultVoice: KokoroVoiceId;
  speed: number;
}

class TTSService {
  private config: TTSConfig = {
    useKokoroTTS: true,
    fallbackToBrowser: true,
    defaultVoice: 'af_nova',
    speed: 1.0,
  };
  
  private kokoroAvailable: boolean | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private audioContext: AudioContext | null = null;

  /**
   * Initialize TTS service and check Kokoro availability
   */
  async initialize(): Promise<boolean> {
    try {
      const response = await fetch(`${TTS_API_URL}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000),
      });
      
      this.kokoroAvailable = response.ok;
      console.log('Kokoro TTS available:', this.kokoroAvailable);
      return this.kokoroAvailable;
    } catch (error) {
      console.warn('Kokoro TTS not available, will use browser TTS:', error);
      this.kokoroAvailable = false;
      return false;
    }
  }

  /**
   * Set TTS configuration
   */
  setConfig(config: Partial<TTSConfig>) {
    this.config = { ...this.config, ...config };
  }

  /**
   * Set the voice to use
   */
  setVoice(voiceId: KokoroVoiceId) {
    this.config.defaultVoice = voiceId;
  }

  /**
   * Stop any currently playing audio
   */
  stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    window.speechSynthesis?.cancel();
  }

  /**
   * Speak text using Kokoro TTS or browser fallback
   */
  async speak(
    text: string,
    options?: {
      voice?: KokoroVoiceId;
      speed?: number;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (error: Error) => void;
    }
  ): Promise<void> {
    const voice = options?.voice || this.config.defaultVoice;
    const speed = options?.speed || this.config.speed;

    // Stop any current playback
    this.stop();

    // Try Kokoro TTS first
    if (this.config.useKokoroTTS && this.kokoroAvailable !== false) {
      try {
        await this.speakWithKokoro(text, voice, speed, options);
        return;
      } catch (error) {
        console.warn('Kokoro TTS failed, falling back to browser:', error);
        this.kokoroAvailable = false;
        
        if (!this.config.fallbackToBrowser) {
          options?.onError?.(error as Error);
          throw error;
        }
      }
    }

    // Fallback to browser TTS
    await this.speakWithBrowser(text, voice, speed, options);
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
          signal: AbortSignal.timeout(30000), // 30 second timeout
        });

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

        this.currentAudio.onerror = (e) => {
          URL.revokeObjectURL(audioUrl);
          this.currentAudio = null;
          const error = new Error('Audio playback failed');
          options?.onError?.(error);
          reject(error);
        };

        // Play audio
        await this.currentAudio.play();

      } catch (error) {
        options?.onError?.(error as Error);
        reject(error);
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

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = speed;
      utterance.pitch = 1.0;

      // Try to find a matching voice
      const voices = window.speechSynthesis.getVoices();
      const voiceInfo = KOKORO_VOICES[voice];
      
      if (voiceInfo) {
        // Try to find a voice that matches the accent
        const langCode = voiceInfo.accent === 'British' ? 'en-GB' : 'en-US';
        const matchingVoice = voices.find(v => 
          v.lang.startsWith(langCode.substring(0, 2)) && 
          v.name.toLowerCase().includes(voiceInfo.gender === 'female' ? 'female' : 'male')
        ) || voices.find(v => v.lang.startsWith(langCode.substring(0, 2)));
        
        if (matchingVoice) {
          utterance.voice = matchingVoice;
        }
      }

      utterance.onstart = () => {
        options?.onStart?.();
      };

      utterance.onend = () => {
        options?.onEnd?.();
        resolve();
      };

      utterance.onerror = (e) => {
        const error = new Error(`Speech synthesis error: ${e.error}`);
        options?.onError?.(error);
        reject(error);
      };

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    });
  }

  /**
   * Check if Kokoro TTS is available
   */
  isKokoroAvailable(): boolean {
    return this.kokoroAvailable === true;
  }

  /**
   * Get current TTS mode
   */
  getMode(): 'kokoro' | 'browser' {
    return this.kokoroAvailable ? 'kokoro' : 'browser';
  }
}

// Export singleton instance
export const ttsService = new TTSService();

// Initialize on import
ttsService.initialize().catch(console.error);

export default ttsService;

