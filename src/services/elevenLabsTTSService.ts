/**
 * ElevenLabs TTS Service for ClerkTree
 * 
 * Used for German text-to-speech as Groq TTS only supports English.
 * Uses the ElevenLabs API with a German voice.
 */

// ElevenLabs API Configuration
// ElevenLabs API Configuration
import { proxyBlob, ProxyRoutes } from './proxyClient';


// German voice ID from ElevenLabs voice library
const GERMAN_VOICE_ID = 'j46AY0iVY3oHcnZbgEJg';

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
    private isIOS: boolean = false;
    private isMobile: boolean = false;

    constructor() {
        // Detect mobile devices
        if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
            const ua = navigator.userAgent.toLowerCase();
            this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
            this.isMobile = this.isIOS || /android/.test(ua) || /mobile/.test(ua);
        }
    }

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
        // return !!ELEVENLABS_API_KEY;
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



        const voiceId = options?.voiceId || GERMAN_VOICE_ID;

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

            source.onended = () => {
                log.debug('✅ ElevenLabs playback complete');
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
