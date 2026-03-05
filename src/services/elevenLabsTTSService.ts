/**
 * ElevenLabs TTS Service for ClerkTree
 * 
 * Used for text-to-speech via the ElevenLabs API.
 * Supports German (Chris Norddeutscher) and English (Jessica) voices.
 */

// ElevenLabs TTS — uses Netlify streaming proxy at /api/elevenlabs-tts-stream

// Default voice IDs from the ElevenLabs account

const ENGLISH_VOICE_ID = 'cgSgspJ2msm6clMCkdW9'; // Jessica - Playful, Bright, Warm
const DEFAULT_VOICE_ID = ENGLISH_VOICE_ID;

interface ElevenLabsTTSOptions {
    voiceId?: string;
    speed?: number;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (error: Error) => void;
}

import log from '../utils/logger';

class ElevenLabsTTSService {
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
     * Check if ElevenLabs TTS is available
     */
    isAvailable(): boolean {
        return true; // Configured server-side
    }

    /**
     * Stop any currently playing audio
     */
    stop() {
        if (this.currentSource) {
            try {
                this.currentSource.stop();
            } catch (_e) {
                // Ignore errors from already-stopped sources
            }
            this.currentSource = null;
        }
    }

    /**
     * Format text for better TTS pronunciation
     * - Formats phone numbers to be read digit by digit
     * - Formats other number patterns appropriately
     */
    private formatTextForTTS(text: string): string {
        // Format phone numbers: convert sequences of digits to space-separated digits
        // Matches patterns like: 123-456-7890, (123) 456-7890, +1 234 567 8901, etc.
        let formatted = text;

        // Format phone number patterns (7+ consecutive digits with optional separators)
        formatted = formatted.replace(/(\+?\d[\d\s\-()]{6,}\d)/g, (match) => {
            // Extract just the digits
            const digits = match.replace(/\D/g, '');
            // Space-separate each digit for TTS
            return digits.split('').join(' ');
        });

        // Format standalone number sequences (4+ digits that aren't years like 2024)
        formatted = formatted.replace(/\b(\d{4,})\b/g, (match) => {
            const num = parseInt(match);
            // Don't format years (1900-2099)
            if (num >= 1900 && num <= 2099) {
                return match;
            }
            // Space-separate digits
            return match.split('').join(' ');
        });

        return formatted;
    }

    /**
     * Speak text using ElevenLabs TTS with low-latency streaming
     */
    async speak(text: string, options?: ElevenLabsTTSOptions): Promise<void> {
        if (!text.trim()) {
            return;
        }

        const voiceId = options?.voiceId || DEFAULT_VOICE_ID;
        const formattedText = this.formatTextForTTS(text);

        try {
            log.debug('🔊 ElevenLabs TTS: synthesizing', formattedText.length, 'chars...');
            
            // Build the URL for the GET request
            const params = new URLSearchParams({
                text: formattedText,
                voiceId: voiceId
            });
            const streamUrl = `/api/elevenlabs-tts-stream?${params.toString()}`;
            
            // We use direct HTML Audio streaming to get immediate playback
            await this.playStreamingAudio(streamUrl, options);

        } catch (error) {
            log.error('ElevenLabs TTS error:', error);
            options?.onError?.(error as Error);
            throw error;
        }
    }

    /**
     * Play audio directly via an HTMLAudioElement stream for zero latency
     */
    private async playStreamingAudio(streamUrl: string, options?: ElevenLabsTTSOptions): Promise<void> {
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.setAttribute('playsinline', 'true');
            audio.setAttribute('webkit-playsinline', 'true');
            audio.crossOrigin = 'anonymous';
            audio.src = streamUrl;

            // Trigger load to begin buffering the stream immediately
            audio.load();

            audio.onplay = () => {
                log.debug('✅ ElevenLabs streaming playback started');
                options?.onStart?.();
            };

            audio.onended = () => {
                log.debug('✅ ElevenLabs streaming playback complete');
                options?.onEnd?.();
                resolve();
            };

            audio.onerror = (e) => {
                log.error('❌ ElevenLabs streaming audio error:', e);
                options?.onError?.(new Error('Audio streaming failed'));
                reject(new Error('Audio streaming failed'));
            };

            // Play as soon as enough data is buffered
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch(e => {
                    log.error('❌ ElevenLabs audio play() failed:', e);
                    options?.onError?.(e);
                    reject(e);
                });
            }
        });
    }
}

// Export singleton instance
export const elevenLabsTTSService = new ElevenLabsTTSService();

export default elevenLabsTTSService;
