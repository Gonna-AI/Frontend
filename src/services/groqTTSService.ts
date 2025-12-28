/**
 * Groq TTS Service for ClerkTree
 * 
 * Uses the Groq API with canopylabs/orpheus-v1-english model
 * for high-quality, real-time text-to-speech synthesis.
 * 
 * Features:
 * - Ultra-fast inference via Groq
 * - Expressive speech with vocal directions
 * - Multiple voice options
 * - Real-time streaming support
 */

// Groq API Configuration
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_TTS_URL = 'https://api.groq.com/openai/v1/audio/speech';
const GROQ_TTS_MODEL = 'canopylabs/orpheus-v1-english'; // Orpheus TTS model

// Orpheus TTS Voice options (from Groq API)
export const ORPHEUS_VOICES = {
    // Female voices
    'autumn': { name: 'Autumn', gender: 'female', description: 'Professional female voice' },
    'diana': { name: 'Diana', gender: 'female', description: 'Warm female voice' },
    'hannah': { name: 'Hannah', gender: 'female', description: 'Friendly female voice' },
    // Male voices
    'austin': { name: 'Austin', gender: 'male', description: 'Professional male voice' },
    'daniel': { name: 'Daniel', gender: 'male', description: 'Friendly male voice' },
    'troy': { name: 'Troy', gender: 'male', description: 'Deep male voice' },
} as const;

export type OrpheusVoiceId = keyof typeof ORPHEUS_VOICES;

// Vocal direction presets for expressive speech
export const VOCAL_DIRECTIONS = {
    neutral: '',
    cheerful: '[cheerful]',
    whisper: '[whisper]',
    dramatic: '[dramatic]',
    calm: '[calm]',
    excited: '[excited]',
    sad: '[sad]',
    professional: '[professional]',
    friendly: '[friendly]',
    serious: '[serious]',
} as const;

export type VocalDirection = keyof typeof VOCAL_DIRECTIONS;

interface GroqTTSConfig {
    enabled: boolean;
    defaultVoice: OrpheusVoiceId;
    speed: number;
    vocalDirection: VocalDirection;
}

interface TTSOptions {
    voice?: OrpheusVoiceId;
    speed?: number;
    vocalDirection?: VocalDirection;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (error: Error) => void;
}

class GroqTTSService {
    private config: GroqTTSConfig = {
        enabled: true,
        defaultVoice: 'autumn',
        speed: 1.0,
        vocalDirection: 'professional',
    };

    private isAvailable: boolean | null = null;
    private currentAudio: HTMLAudioElement | null = null;
    private audioUnlocked: boolean = false;
    private audioContext: AudioContext | null = null;
    private unlockedAudioPool: HTMLAudioElement[] = [];
    private isIOS: boolean = false;

    /**
     * Initialize the Groq TTS service
     */
    async initialize(): Promise<boolean> {
        // Detect iOS
        if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
            this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

            if (this.isIOS) {
                console.log('📱 iOS device detected, using iOS-specific audio handling');
            }
        }

        // Add global click listener to unlock audio on first interaction
        if (typeof window !== 'undefined') {
            const unlockHandler = async () => {
                await this.unlockAudio();
                window.removeEventListener('click', unlockHandler);
                window.removeEventListener('touchstart', unlockHandler);
                window.removeEventListener('touchend', unlockHandler);
                window.removeEventListener('keydown', unlockHandler);
            };
            window.addEventListener('click', unlockHandler);
            window.addEventListener('touchstart', unlockHandler);
            window.addEventListener('touchend', unlockHandler);
            window.addEventListener('keydown', unlockHandler);
        }

        if (!GROQ_API_KEY) {
            console.warn('⚠️ Groq API key not configured for TTS');
            this.isAvailable = false;
            return false;
        }

        try {
            // Test with a minimal request to verify API access
            console.log('🔍 Checking Groq TTS availability...');

            // We'll verify by attempting a small synthesis
            // Instead of a health check, we'll just verify the API key is present
            // The actual availability will be confirmed on first use
            this.isAvailable = true;
            console.log('✅ Groq TTS service initialized');
            return true;
        } catch (error) {
            console.warn('⚠️ Groq TTS initialization failed:', error);
            this.isAvailable = false;
            return false;
        }
    }

    /**
     * Unlock audio playback - must be called during a user gesture (click/tap)
     * This is required by browser autoplay policies, especially strict on iOS Safari
     */
    async unlockAudio(): Promise<void> {
        if (this.audioUnlocked) return;

        try {
            console.log('🔊 Attempting to unlock audio (iOS-compatible)...');

            // Create and resume AudioContext
            const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
            if (AudioContextClass) {
                if (!this.audioContext) {
                    this.audioContext = new AudioContextClass();
                }

                // Resume if suspended (common on iOS)
                if (this.audioContext.state === 'suspended') {
                    await this.audioContext.resume();
                    console.log('🔊 AudioContext resumed from suspended state');
                }

                // Create a short silent buffer and play it
                const buffer = this.audioContext.createBuffer(1, 1, 22050);
                const source = this.audioContext.createBufferSource();
                source.buffer = buffer;
                source.connect(this.audioContext.destination);
                source.start(0);
            }

            // Create a pool of pre-unlocked audio elements for iOS
            // iOS requires audio elements to be "unlocked" by playing during user gesture
            for (let i = 0; i < 3; i++) {
                const audio = new Audio();
                audio.setAttribute('playsinline', 'true');
                audio.setAttribute('webkit-playsinline', 'true');
                audio.preload = 'auto';
                audio.volume = 0.01;

                // Use a tiny silent MP3 (more compatible with iOS than WAV)
                audio.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAAwAAABQAqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr/8zLEAyQAekAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//MyxAYjKAJQAYd4AVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+M4xAAAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zMsQGAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/8zLEBgAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=';

                try {
                    await audio.play();
                    audio.pause();
                    audio.currentTime = 0;
                    this.unlockedAudioPool.push(audio);
                    console.log(`🔊 Pre-unlocked audio element ${i + 1}`);
                } catch (e) {
                    console.warn(`⚠️ Failed to pre-unlock audio element ${i + 1}:`, e);
                }
            }

            this.audioUnlocked = true;
            console.log('🔊 Audio playback unlocked successfully');
        } catch (e) {
            console.warn('⚠️ Could not unlock audio:', e);
        }
    }

    /**
     * Get a pre-unlocked audio element from the pool, or create a new one
     */
    private getAudioElement(): HTMLAudioElement {
        // Try to get a pre-unlocked element from the pool
        const pooledAudio = this.unlockedAudioPool.pop();
        if (pooledAudio) {
            console.log('🔊 Using pre-unlocked audio element from pool');
            return pooledAudio;
        }

        // Create a new audio element with iOS-compatible attributes
        const audio = new Audio();
        audio.setAttribute('playsinline', 'true');
        audio.setAttribute('webkit-playsinline', 'true');
        audio.preload = 'auto';
        return audio;
    }

    /**
     * Check if audio is unlocked
     */
    isAudioUnlocked(): boolean {
        return this.audioUnlocked;
    }

    /**
     * Set configuration
     */
    setConfig(config: Partial<GroqTTSConfig>) {
        this.config = { ...this.config, ...config };
    }

    /**
     * Get current configuration
     */
    getConfig(): GroqTTSConfig {
        return { ...this.config };
    }

    /**
     * Set the default voice
     */
    setVoice(voiceId: OrpheusVoiceId) {
        this.config.defaultVoice = voiceId;
    }

    /**
     * Set the vocal direction for expressive speech
     */
    setVocalDirection(direction: VocalDirection) {
        this.config.vocalDirection = direction;
    }

    /**
     * Stop any currently playing audio
     */
    stop() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.src = '';
            this.currentAudio = null;
        }
    }

    /**
     * Speak text using Groq TTS
     * Automatically chunks long text to stay under 200 character limit
     */
    async speak(text: string, options?: TTSOptions): Promise<void> {
        if (!text.trim()) {
            return;
        }

        const voice = options?.voice || this.config.defaultVoice;
        const speed = options?.speed || this.config.speed;
        const vocalDirection = options?.vocalDirection || this.config.vocalDirection;

        // Stop any current playback
        this.stop();

        // Check if Groq TTS is available
        if (!GROQ_API_KEY) {
            const error = new Error('Groq API key not configured');
            options?.onError?.(error);
            throw error;
        }

        try {
            // Chunk text if it exceeds 200 characters
            const chunks = this.chunkText(text, 180); // Use 180 to leave room for vocal directions

            if (chunks.length === 1) {
                // Single chunk - play directly
                await this.synthesizeAndPlay(chunks[0], voice, speed, vocalDirection, options);
            } else {
                // Multiple chunks - play sequentially
                console.log(`📝 Text chunked into ${chunks.length} parts for TTS`);
                let isFirstChunk = true;

                for (let i = 0; i < chunks.length; i++) {
                    const chunk = chunks[i];
                    const isLastChunk = i === chunks.length - 1;

                    await this.synthesizeAndPlay(chunk, voice, speed, vocalDirection, {
                        ...options,
                        onStart: isFirstChunk ? options?.onStart : undefined,
                        onEnd: isLastChunk ? options?.onEnd : undefined,
                    });

                    isFirstChunk = false;
                }
            }
        } catch (error) {
            console.error('Groq TTS error:', error);
            options?.onError?.(error as Error);
            throw error;
        }
    }

    /**
     * Chunk text into smaller pieces that fit within the character limit
     * Smart chunking that respects sentence and word boundaries
     */
    private chunkText(text: string, maxLength: number): string[] {
        if (text.length <= maxLength) {
            return [text];
        }

        const chunks: string[] = [];
        let remaining = text;

        while (remaining.length > 0) {
            if (remaining.length <= maxLength) {
                chunks.push(remaining.trim());
                break;
            }

            // Find the best break point within the limit
            let breakPoint = maxLength;

            // Try to break at sentence end (. ! ?)
            const sentenceEnd = remaining.substring(0, maxLength).search(/[.!?][^.!?]*$/);
            if (sentenceEnd > maxLength * 0.5) {
                breakPoint = sentenceEnd + 1;
            } else {
                // Try to break at comma or semicolon
                const clauseEnd = remaining.substring(0, maxLength).search(/[,;][^,;]*$/);
                if (clauseEnd > maxLength * 0.5) {
                    breakPoint = clauseEnd + 1;
                } else {
                    // Break at last space
                    const lastSpace = remaining.substring(0, maxLength).lastIndexOf(' ');
                    if (lastSpace > maxLength * 0.3) {
                        breakPoint = lastSpace;
                    }
                }
            }

            chunks.push(remaining.substring(0, breakPoint).trim());
            remaining = remaining.substring(breakPoint).trim();
        }

        return chunks.filter(chunk => chunk.length > 0);
    }

    /**
     * Synthesize speech using Groq API and play it
     */
    private async synthesizeAndPlay(
        text: string,
        voice: OrpheusVoiceId,
        speed: number,
        vocalDirection: VocalDirection,
        options?: TTSOptions
    ): Promise<void> {
        return new Promise(async (resolve, reject) => {
            const abortController = new AbortController();
            const timeoutId = setTimeout(() => abortController.abort(), 60000); // 60 second timeout

            try {
                // Ensure AudioContext is resumed (important for iOS)
                if (this.audioContext && this.audioContext.state === 'suspended') {
                    console.log('🔊 Resuming suspended AudioContext before playback...');
                    await this.audioContext.resume();
                }

                // Prepend vocal direction if specified
                const directionPrefix = VOCAL_DIRECTIONS[vocalDirection];
                const processedText = directionPrefix ? `${directionPrefix} ${text}` : text;

                console.log(`🎤 Synthesizing speech with Groq TTS (voice: ${voice}, direction: ${vocalDirection}, iOS: ${this.isIOS})`);

                // Use MP3 format for better iOS Safari compatibility
                const response = await fetch(GROQ_TTS_URL, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${GROQ_API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        model: GROQ_TTS_MODEL,
                        input: processedText,
                        voice: voice,
                        response_format: 'mp3', // Changed from 'wav' to 'mp3' for iOS Safari compatibility
                        speed: speed,
                    }),
                    signal: abortController.signal,
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    const errorMessage = errorData.error?.message || `HTTP ${response.status}`;
                    throw new Error(`Groq TTS API error: ${errorMessage}`);
                }

                // Get audio blob
                const audioBlob = await response.blob();
                const audioUrl = URL.createObjectURL(audioBlob);

                // Use pre-unlocked audio element from pool (important for iOS)
                this.currentAudio = this.getAudioElement();
                this.currentAudio.src = audioUrl;
                this.currentAudio.volume = 1.0;

                this.currentAudio.onloadeddata = () => {
                    console.log('🔊 Audio loaded and ready to play');
                    // onStart will be called after play() succeeds
                };

                this.currentAudio.onended = () => {
                    console.log('✅ Audio playback complete');
                    URL.revokeObjectURL(audioUrl);
                    this.currentAudio = null;
                    options?.onEnd?.();
                    resolve();
                };

                this.currentAudio.onerror = (e) => {
                    console.error('Audio playback error:', e);
                    URL.revokeObjectURL(audioUrl);
                    this.currentAudio = null;
                    const error = new Error('Audio playback failed');
                    options?.onError?.(error);
                    reject(error);
                };

                // Play the audio with explicit error handling for mobile
                try {
                    // Load the audio first
                    await this.currentAudio.load();
                    console.log('🔊 Audio loaded, calling play()...');

                    // Then play
                    const playPromise = this.currentAudio.play();
                    if (playPromise !== undefined) {
                        await playPromise;
                        console.log('✅ Audio play() promise resolved');
                        // Call onStart after play succeeds
                        options?.onStart?.();
                    } else {
                        console.log('✅ Audio play() called (no promise)');
                        // Call onStart even if no promise
                        options?.onStart?.();
                    }
                } catch (playError) {
                    console.error('❌ Audio play() failed:', playError);
                    URL.revokeObjectURL(audioUrl);
                    this.currentAudio = null;

                    // On NotAllowedError, the audio isn't unlocked
                    if (playError instanceof Error && playError.name === 'NotAllowedError') {
                        console.warn('⚠️ Audio not unlocked - user gesture required. iOS may require explicit user interaction.');
                        // Try to unlock audio and retry
                        try {
                            await this.unlockAudio();
                            console.log('🔓 Audio unlocked, retrying playback...');
                            // Create new audio element and try again
                            const retryAudio = this.getAudioElement();
                            retryAudio.src = audioUrl;
                            retryAudio.volume = 1.0;
                            await retryAudio.play();
                            this.currentAudio = retryAudio;
                            retryAudio.onended = () => {
                                console.log('✅ Retry audio playback complete');
                                URL.revokeObjectURL(audioUrl);
                                this.currentAudio = null;
                                options?.onEnd?.();
                                resolve();
                            };
                            retryAudio.onerror = (e) => {
                                console.error('Retry audio playback error:', e);
                                URL.revokeObjectURL(audioUrl);
                                this.currentAudio = null;
                                const error = new Error('Audio playback failed after retry');
                                options?.onError?.(error);
                                reject(error);
                            };
                            options?.onStart?.();
                            return; // Success, exit early
                        } catch (retryError) {
                            console.error('❌ Retry also failed:', retryError);
                        }
                    }

                    options?.onError?.(playError as Error);
                    reject(playError);
                }

            } catch (error) {
                clearTimeout(timeoutId);

                if (error instanceof Error && error.name === 'AbortError') {
                    const abortError = new Error('TTS request timed out');
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
     * Speak with streaming (for real-time applications)
     * Note: This uses chunked text for faster perceived response
     */
    async speakStreaming(text: string, options?: TTSOptions): Promise<void> {
        // For very long texts, split into sentences and queue them
        const sentences = this.splitIntoSentences(text);

        if (sentences.length <= 1) {
            return this.speak(text, options);
        }

        // Queue up sentences for sequential playback
        let isFirstChunk = true;

        for (const sentence of sentences) {
            if (!sentence.trim()) continue;

            await this.speak(sentence, {
                ...options,
                onStart: isFirstChunk ? options?.onStart : undefined,
                onEnd: undefined, // Don't call onEnd until the last chunk
            });

            isFirstChunk = false;
        }

        // Call onEnd when all chunks are done
        options?.onEnd?.();
    }

    /**
     * Split text into sentences for streaming
     */
    private splitIntoSentences(text: string): string[] {
        // Split on sentence-ending punctuation while preserving the punctuation
        return text
            .split(/(?<=[.!?])\s+/)
            .filter(s => s.trim().length > 0);
    }

    /**
     * Check if Groq TTS is available
     */
    isGroqTTSAvailable(): boolean {
        return this.isAvailable === true && !!GROQ_API_KEY;
    }

    /**
     * Get available voices
     */
    getAvailableVoices(): typeof ORPHEUS_VOICES {
        return ORPHEUS_VOICES;
    }

    /**
     * Get available vocal directions
     */
    getVocalDirections(): typeof VOCAL_DIRECTIONS {
        return VOCAL_DIRECTIONS;
    }
}

// Export singleton instance
export const groqTTSService = new GroqTTSService();

// Initialize on import
groqTTSService.initialize().catch(console.error);

export default groqTTSService;
