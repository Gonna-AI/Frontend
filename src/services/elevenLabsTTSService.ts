/**
 * ElevenLabs TTS Service for ClerkTree
 * 
 * Used for text-to-speech via the ElevenLabs API.
 * Supports German (Chris Norddeutscher) and English (Jessica) voices.
 */

// ElevenLabs API Configuration
import { proxyBlob, ProxyRoutes } from './proxyClient';

// Default voice IDs from the ElevenLabs account
const GERMAN_VOICE_ID = 'j46AY0iVY3oHcnZbgEJg';  // Chris Norddeutscher
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
     * Speak text using ElevenLabs TTS (German) with streaming for low latency
     */
    async speak(text: string, options?: ElevenLabsTTSOptions): Promise<void> {
        if (!text.trim()) {
            return;
        }



        const voiceId = options?.voiceId || DEFAULT_VOICE_ID;

        // Format text for better pronunciation
        const formattedText = this.formatTextForTTS(text);

        // AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        try {
            log.debug('🇩🇪 Synthesizing German speech with ElevenLabs TTS...');
            log.debug('   Text length:', formattedText.length, 'chars');

            // Use streaming endpoint with latency optimization
            // optimize_streaming_latency: 3 = max latency optimization
            // output_format: mp3_22050_32 = smaller file, faster transfer
            // Use streaming endpoint with latency optimization
            // optimize_streaming_latency: 3 = max latency optimization
            // output_format: mp3_22050_32 = smaller file, faster transfer

            /*
            const url = new URL(`${ELEVENLABS_TTS_URL}/${voiceId}/stream`);
            url.searchParams.set('optimize_streaming_latency', '3');
            url.searchParams.set('output_format', 'mp3_22050_32');
            */

            const audioBlob = await proxyBlob(ProxyRoutes.TTS_ALT, {
                text: formattedText,
                voiceId: voiceId,
                model_id: 'eleven_flash_v2_5', // Fastest model with good quality
                optimize_streaming_latency: '3',
                output_format: 'mp3_22050_32',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                    style: 0.0,
                    use_speaker_boost: true
                }
            }, { signal: controller.signal });

            clearTimeout(timeoutId);

            /*
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
            }
            */

            log.debug('🇩🇪 ElevenLabs response received, processing audio...');

            // Audio blob is already returned by proxyBlob
            // const audioBlob = await response.blob(); 
            log.debug('🇩🇪 Audio blob size:', audioBlob.size, 'bytes');

            // Use Web Audio API for playback (more reliable on mobile)
            await this.playWithWebAudio(audioBlob, options);

        } catch (error) {
            clearTimeout(timeoutId);
            if ((error as Error).name === 'AbortError') {
                log.error('ElevenLabs TTS timeout after 30 seconds');
                options?.onError?.(new Error('ElevenLabs TTS request timed out'));
            } else {
                log.error('ElevenLabs TTS error:', error);
                options?.onError?.(error as Error);
            }
            throw error;
        }
    }

    /**
     * Play audio using Web Audio API (more reliable on iOS)
     */
    private async playWithWebAudio(audioBlob: Blob, options?: ElevenLabsTTSOptions): Promise<void> {
        // Ensure AudioContext is initialized
        await this.initAudioContext();

        if (!this.audioContext) {
            throw new Error('AudioContext not available');
        }

        // Decode the audio data
        const arrayBuffer = await audioBlob.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

        log.debug('🔊 ElevenLabs audio decoded, playing...');

        return new Promise((resolve, reject) => {
            if (!this.audioContext) {
                reject(new Error('AudioContext not available'));
                return;
            }

            const source = this.audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(this.audioContext.destination);

            // Store reference so stop() can halt it
            this.currentSource = source;

            source.onended = () => {
                log.debug('✅ ElevenLabs playback complete');
                this.currentSource = null;
                options?.onEnd?.();
                resolve();
            };

            options?.onStart?.();
            source.start(0);

            log.debug('✅ ElevenLabs playback started');
        });
    }
}

// Export singleton instance
export const elevenLabsTTSService = new ElevenLabsTTSService();

export default elevenLabsTTSService;
