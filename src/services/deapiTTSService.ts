/**
 * DeAPI TTS Service for ClerkTree
 * 
 * Uses the DeAPI API (api.deapi.ai) with Qwen3 TTS model for text-to-speech.
 * Calls are proxied through a Netlify serverless function to keep API keys secure.
 */

import log from '../utils/logger';

// DeAPI voice options
export const DEAPI_VOICES = {
  'Vivian': { name: 'Vivian', gender: 'female', description: 'Natural female voice' },
  'Alex': { name: 'Alex', gender: 'male', description: 'Natural male voice' },
  'Emma': { name: 'Emma', gender: 'female', description: 'Warm female voice' },
  'James': { name: 'James', gender: 'male', description: 'Professional male voice' },
} as const;

export type DeAPIVoiceId = keyof typeof DEAPI_VOICES;

interface DeAPITTSOptions {
  voice?: DeAPIVoiceId;
  speed?: number;
  lang?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
}

class DeAPITTSService {
  private audioContext: AudioContext | null = null;
  private currentSource: AudioBufferSourceNode | null = null;

  /**
   * Initialize AudioContext (should be called during user gesture)
   */
  async initAudioContext(): Promise<void> {
    if (!this.audioContext) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioContext = new AudioContextClass();
      }
    }

    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  /**
   * Stop any currently playing audio
   */
  stop() {
    if (this.currentSource) {
      try {
        this.currentSource.stop();
      } catch {
        // Already stopped
      }
      this.currentSource = null;
    }
  }

  /**
   * Format text for better TTS pronunciation
   */
  private formatTextForTTS(text: string): string {
    let formatted = text;

    // Format phone number patterns (7+ consecutive digits with optional separators)
    formatted = formatted.replace(/(\+?\d[\d\s\-()]{6,}\d)/g, (match) => {
      const digits = match.replace(/\D/g, '');
      return digits.split('').join(' ');
    });

    return formatted;
  }

  /**
   * Speak text using DeAPI TTS
   */
  async speak(text: string, options?: DeAPITTSOptions): Promise<void> {
    if (!text.trim()) return;

    const voice = options?.voice || 'Vivian';
    const speed = options?.speed || 1;
    const lang = options?.lang || 'English';
    const formattedText = this.formatTextForTTS(text);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      log.debug('🎤 Synthesizing speech with DeAPI TTS...');
      log.debug('   Text length:', formattedText.length, 'chars');
      log.debug('   Voice:', voice);

      const response = await fetch('/api/deapi-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: formattedText,
          voice,
          speed,
          lang,
          format: 'mp3',
          sample_rate: 24000,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(`DeAPI TTS error: ${errorData.error || response.status}`);
      }

      const contentType = response.headers.get('Content-Type') || '';

      let audioBlob: Blob;

      if (contentType.includes('audio/')) {
        // Direct audio response
        audioBlob = await response.blob();
      } else {
        // JSON response - might contain audio_url or base64
        const data = await response.json();
        if (data.audio_url) {
          const audioResponse = await fetch(data.audio_url);
          audioBlob = await audioResponse.blob();
        } else if (data.audio_base64 || data.data) {
          const base64Data = data.audio_base64 || data.data;
          const binaryStr = atob(base64Data);
          const bytes = new Uint8Array(binaryStr.length);
          for (let i = 0; i < binaryStr.length; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
          }
          audioBlob = new Blob([bytes], { type: 'audio/mp3' });
        } else {
          throw new Error('DeAPI returned unexpected response format');
        }
      }

      log.debug('🎤 DeAPI audio blob size:', audioBlob.size, 'bytes');

      await this.playWithWebAudio(audioBlob, options);
    } catch (error) {
      clearTimeout(timeoutId);
      if ((error as Error).name === 'AbortError') {
        log.error('DeAPI TTS timeout after 30 seconds');
        options?.onError?.(new Error('DeAPI TTS request timed out'));
      } else {
        log.error('DeAPI TTS error:', error);
        options?.onError?.(error as Error);
      }
      throw error;
    }
  }

  /**
   * Play audio using Web Audio API
   */
  private async playWithWebAudio(audioBlob: Blob, options?: DeAPITTSOptions): Promise<void> {
    await this.initAudioContext();
    if (!this.audioContext) throw new Error('AudioContext not available');

    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

    log.debug('🔊 DeAPI audio decoded, playing...');

    return new Promise((resolve, reject) => {
      if (!this.audioContext) {
        reject(new Error('AudioContext not available'));
        return;
      }

      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);
      this.currentSource = source;

      source.onended = () => {
        log.debug('✅ DeAPI playback complete');
        this.currentSource = null;
        options?.onEnd?.();
        resolve();
      };

      options?.onStart?.();
      source.start(0);
      log.debug('✅ DeAPI playback started');
    });
  }
}

export const deapiTTSService = new DeAPITTSService();
export default deapiTTSService;
