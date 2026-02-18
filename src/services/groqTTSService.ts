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
// Groq API Configuration
import { proxyBlob, ProxyRoutes } from './proxyClient';


// const GROQ_TTS_URL = 'https://api.groq.com/openai/v1/audio/speech';
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
    private isAndroid: boolean = false;
    private isMobile: boolean = false;
    private unlockHandler: (() => void) | null = null;
    private isUnlocking: boolean = false;
    // Persistent audio element for mobile - reused across playbacks to maintain unlock state
    private persistentMobileAudio: HTMLAudioElement | null = null;

    private removeUnlockListeners() {
        if (typeof window !== 'undefined' && this.unlockHandler) {
            window.removeEventListener('click', this.unlockHandler);
            window.removeEventListener('touchstart', this.unlockHandler);
            window.removeEventListener('touchend', this.unlockHandler);
            window.removeEventListener('keydown', this.unlockHandler);
            this.unlockHandler = null;
        }
    }

    /**
     * Initialize the Groq TTS service
     */
    async initialize(): Promise<boolean> {
        // Detect mobile devices
        if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
            const ua = navigator.userAgent.toLowerCase();
            this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
            this.isAndroid = /android/.test(ua);
            this.isMobile = this.isIOS || this.isAndroid || /mobile/.test(ua);

            if (this.isMobile) {
                console.log(`📱 Mobile device detected (iOS: ${this.isIOS}, Android: ${this.isAndroid}), using mobile-specific audio handling`);
            }
        }

        // Add global click listener to unlock audio on first interaction
        if (typeof window !== 'undefined' && !this.audioUnlocked) {
            // Remove any existing listeners first to prevent duplicates
            this.removeUnlockListeners();

            this.unlockHandler = async () => {
                // Remove immediately to prevent multiple triggers
                this.removeUnlockListeners();
                await this.unlockAudio();
            };

            window.addEventListener('click', this.unlockHandler);
            window.addEventListener('touchstart', this.unlockHandler);
            window.addEventListener('touchend', this.unlockHandler);
            window.addEventListener('keydown', this.unlockHandler);
        }

        // Check if Groq TTS is available (always true via proxy if server configured)


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
     * CRITICAL: For iOS Safari, the audio.play() must happen SYNCHRONOUSLY within the user gesture
     */
    async unlockAudio(): Promise<void> {
        if (this.audioUnlocked || this.isUnlocking) return;

        this.isUnlocking = true;

        try {
            console.log('🔊 Attempting to unlock audio (iOS-compatible)...');

            // Create and resume AudioContext SYNCHRONOUSLY
            const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
            if (AudioContextClass) {
                if (!this.audioContext) {
                    this.audioContext = new AudioContextClass();
                }

                // Resume AudioContext - this is allowed to be async
                if (this.audioContext.state === 'suspended') {
                    // Don't await - just start the resume
                    this.audioContext.resume().then(() => {
                        console.log('🔊 AudioContext resumed from suspended state');
                    });
                }

                // Play silent buffer through AudioContext
                try {
                    const buffer = this.audioContext.createBuffer(1, 1, 22050);
                    const source = this.audioContext.createBufferSource();
                    source.buffer = buffer;
                    source.connect(this.audioContext.destination);
                    source.start(0);
                } catch (e) {
                    console.warn('⚠️ Could not play silent buffer:', e);
                }
            }

            // CRITICAL FOR iOS: Create and play audio element SYNCHRONOUSLY
            // Do NOT use await in this section - it breaks the user gesture context
            if (this.isMobile && !this.persistentMobileAudio) {
                console.log('📱 Creating persistent mobile audio element SYNCHRONOUSLY...');

                const audio = new Audio();
                audio.setAttribute('playsinline', 'true');
                audio.setAttribute('webkit-playsinline', 'true');
                audio.preload = 'auto';
                audio.volume = 0.01;

                // Use inline silent WAV (tiny, works on iOS)
                audio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

                // SYNCHRONOUS play - do not await!
                const playPromise = audio.play();

                // Store immediately - even before play resolves
                this.persistentMobileAudio = audio;

                if (playPromise !== undefined) {
                    playPromise
                        .then(() => {
                            console.log('📱 Persistent mobile audio unlocked successfully');
                            audio.pause();
                            audio.currentTime = 0;
                            audio.volume = 1.0;
                        })
                        .catch((e) => {
                            console.warn('⚠️ Mobile audio unlock play failed:', e);
                            // Still keep the element - it might work for src swap
                        });
                }
            }

            // For desktop or as backup, create pool elements (these can be async)
            if (!this.isMobile) {
                for (let i = 0; i < 2; i++) {
                    const audio = new Audio();
                    audio.setAttribute('playsinline', 'true');
                    audio.setAttribute('webkit-playsinline', 'true');
                    audio.preload = 'auto';
                    audio.volume = 0.01;
                    audio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

                    audio.play()
                        .then(() => {
                            audio.pause();
                            audio.currentTime = 0;
                            audio.volume = 1.0;
                            this.unlockedAudioPool.push(audio);
                            console.log(`🔊 Pre-unlocked desktop audio element ${i + 1}`);
                        })
                        .catch((e) => {
                            console.warn(`⚠️ Failed to pre-unlock desktop audio ${i + 1}:`, e);
                        });
                }
            }

            this.audioUnlocked = true;
            console.log('🔊 Audio unlock initiated');
        } catch (e) {
            console.warn('⚠️ Could not unlock audio:', e);
        } finally {
            this.isUnlocking = false;
        }
    }

    /**
     * Get a pre-unlocked audio element from the pool, or create a new one
     * On mobile, reuse persistent element to maintain unlock state
     */
    private getAudioElement(): HTMLAudioElement {
        // On mobile, reuse the persistent pre-unlocked audio element
        // This is critical because mobile browsers require audio to be unlocked during user gesture
        // and new elements lose that unlock state
        if (this.isMobile) {
            if (this.persistentMobileAudio) {
                console.log('📱 Reusing persistent mobile audio element (maintains unlock state)');
                // Reset the element for new playback
                this.persistentMobileAudio.pause();
                this.persistentMobileAudio.currentTime = 0;
                this.persistentMobileAudio.src = '';
                return this.persistentMobileAudio;
            }
            // Fallback: try to get from pool
            const pooled = this.unlockedAudioPool.pop();
            if (pooled) {
                console.log('📱 Using pooled audio element for mobile');
                this.persistentMobileAudio = pooled; // Save for reuse
                return pooled;
            }
            // Last resort: create new element (may not play on some mobile browsers)
            console.warn('⚠️ Creating fresh audio element for mobile - may not play without user gesture');
            const audio = new Audio();
            audio.setAttribute('playsinline', 'true');
            audio.setAttribute('webkit-playsinline', 'true');
            audio.setAttribute('x-webkit-airplay', 'allow');
            audio.preload = 'auto';
            audio.volume = 1.0;
            // Note: DO NOT set crossOrigin for blob URLs - it causes issues on some mobile browsers
            this.persistentMobileAudio = audio; // Save for future reuse
            return audio;
        }

        // On desktop, try to get a pre-unlocked element from the pool
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
        // Check if Groq TTS is available
        /*
        if (!GROQ_API_KEY) {
            const error = new Error('Groq API key not configured');
            options?.onError?.(error);
            throw error;
        }
        */

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
     * Format text for better TTS pronunciation
     * - Formats phone numbers to be read digit by digit
     * - Formats other number patterns appropriately
     */
    private formatTextForTTS(text: string): string {
        let formatted = text;

        // Format phone number patterns (7+ consecutive digits with optional separators)
        // Matches patterns like: 123-456-7890, (123) 456-7890, +1 234 567 8901, etc.
        formatted = formatted.replace(/(\+?\d[\d\s\-\(\)]{6,}\d)/g, (match) => {
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
                // Format text for better pronunciation (phone numbers, etc.)
                const formattedText = this.formatTextForTTS(text);
                const processedText = directionPrefix ? `${directionPrefix} ${formattedText}` : formattedText;

                console.log(`🎤 Synthesizing speech with Groq TTS (voice: ${voice}, direction: ${vocalDirection}, iOS: ${this.isIOS})`);

                // Use MP3 format for better iOS Safari compatibility
                const audioBlob = await proxyBlob(ProxyRoutes.TTS, {
                    model: GROQ_TTS_MODEL,
                    input: processedText,
                    voice: voice,
                    response_format: 'wav', // Orpheus TTS only supports WAV format
                    speed: speed,
                }, { signal: abortController.signal });

                clearTimeout(timeoutId);

                /* 
                // Error handling is done inside proxyBlob
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    const errorMessage = errorData.error?.message || `HTTP ${response.status}`;
                    throw new Error(`Groq TTS API error: ${errorMessage}`);
                }

                // Get audio blob
                const audioBlob = await response.blob(); 
                */
                const audioUrl = URL.createObjectURL(audioBlob);

                // On mobile, ensure audio is unlocked before creating element
                if (this.isMobile && !this.audioUnlocked) {
                    console.log('📱 Mobile detected - ensuring audio is unlocked...');
                    await this.unlockAudio();
                }

                // Create fresh audio element (especially important for mobile)
                this.currentAudio = this.getAudioElement();
                this.currentAudio.src = audioUrl;
                this.currentAudio.volume = 1.0;

                // Set up event handlers before loading
                this.currentAudio.onloadeddata = () => {
                    console.log('🔊 Audio loaded and ready to play');
                };

                this.currentAudio.oncanplay = () => {
                    console.log('🔊 Audio can play');
                };

                this.currentAudio.oncanplaythrough = () => {
                    console.log('🔊 Audio can play through');
                };

                this.currentAudio.onplay = () => {
                    console.log('✅ Audio playback started');
                    options?.onStart?.();
                };

                this.currentAudio.onended = () => {
                    console.log('✅ Audio playback complete');
                    URL.revokeObjectURL(audioUrl);
                    this.currentAudio = null;
                    options?.onEnd?.();
                    resolve();
                };

                this.currentAudio.onerror = (e) => {
                    console.error('❌ Audio playback error:', e);
                    URL.revokeObjectURL(audioUrl);
                    this.currentAudio = null;
                    const error = new Error('Audio playback failed');
                    options?.onError?.(error);
                    reject(error);
                };

                // Play the audio with explicit error handling for mobile
                try {
                    // For iOS, try Web Audio API FIRST - it's more reliable than HTMLAudioElement
                    if (this.isIOS && this.audioContext) {
                        console.log('📱 iOS: Using Web Audio API for playback (more reliable)...');

                        try {
                            // Ensure context is resumed
                            if (this.audioContext.state === 'suspended') {
                                await this.audioContext.resume();
                            }

                            // Get the audio data as ArrayBuffer
                            const arrayBuffer = await audioBlob.arrayBuffer();

                            // Decode the audio data
                            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

                            console.log('🔊 Audio decoded successfully, playing...');

                            // Create buffer source and play
                            const source = this.audioContext.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(this.audioContext.destination);

                            source.onended = () => {
                                console.log('✅ iOS Web Audio playback complete');
                                URL.revokeObjectURL(audioUrl);
                                this.currentAudio = null;
                                options?.onEnd?.();
                                resolve();
                            };

                            options?.onStart?.();
                            source.start(0);

                            console.log('✅ iOS Web Audio playback started');
                            return; // Success with Web Audio, exit early
                        } catch (webAudioError) {
                            console.warn('⚠️ iOS Web Audio failed, falling back to HTMLAudioElement:', webAudioError);
                            // Fall through to HTMLAudioElement attempt
                        }
                    }

                    // For Android mobile or as iOS fallback
                    if (this.isMobile) {
                        console.log('📱 Mobile: Setting src and playing with HTMLAudioElement...');
                        // Set src (this triggers loading)
                        this.currentAudio.src = audioUrl;

                        // Wait a tiny bit for src to be set
                        await new Promise(resolve => setTimeout(resolve, 50));

                        // Play immediately
                        const playPromise = this.currentAudio.play();
                        if (playPromise !== undefined) {
                            await playPromise;
                            console.log('✅ Mobile audio play() promise resolved');
                        } else {
                            console.log('✅ Mobile audio play() called (no promise)');
                        }
                    } else {
                        // Desktop: load first, then play
                        await this.currentAudio.load();
                        console.log('🔊 Desktop: Audio loaded, calling play()...');

                        const playPromise = this.currentAudio.play();
                        if (playPromise !== undefined) {
                            await playPromise;
                            console.log('✅ Desktop audio play() promise resolved');
                            options?.onStart?.();
                        } else {
                            console.log('✅ Desktop audio play() called (no promise)');
                            options?.onStart?.();
                        }
                    }
                } catch (playError) {
                    console.error('❌ Audio play() failed:', playError);

                    // On NotAllowedError, try Web Audio API fallback
                    // Web Audio API is more permissive once AudioContext is resumed
                    if (playError instanceof Error && playError.name === 'NotAllowedError') {
                        console.warn('⚠️ HTMLAudioElement blocked - trying Web Audio API fallback...');

                        try {
                            // Use Web Audio API instead of HTMLAudioElement
                            if (this.audioContext) {
                                // Ensure context is resumed
                                if (this.audioContext.state === 'suspended') {
                                    await this.audioContext.resume();
                                }

                                console.log('🔊 Decoding audio with Web Audio API...');

                                // Get the audio data as ArrayBuffer
                                const arrayBuffer = await audioBlob.arrayBuffer();

                                // Decode the audio data
                                const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

                                console.log('🔊 Audio decoded, playing via Web Audio API...');

                                // Create buffer source and play
                                const source = this.audioContext.createBufferSource();
                                source.buffer = audioBuffer;
                                source.connect(this.audioContext.destination);

                                source.onended = () => {
                                    console.log('✅ Web Audio API playback complete');
                                    URL.revokeObjectURL(audioUrl);
                                    options?.onEnd?.();
                                    resolve();
                                };

                                options?.onStart?.();
                                source.start(0);

                                console.log('✅ Web Audio API playback started');
                                return; // Success, exit early
                            }
                        } catch (webAudioError) {
                            console.error('❌ Web Audio API fallback also failed:', webAudioError);
                        }
                    }

                    URL.revokeObjectURL(audioUrl);
                    this.currentAudio = null;
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
        return this.isAvailable === true;
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
