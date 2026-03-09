/**
 * ElevenLabs Conversational AI Service for ClerkTree
 *
 * Uses the @11labs/client SDK (already installed) to create a full
 * conversational AI session via WebSocket. ElevenLabs handles:
 *   - Speech-to-Text (STT)
 *   - AI reasoning (LLM)
 *   - Text-to-Speech (TTS)
 *
 * The API key is kept server-side — the frontend fetches a signed URL
 * from the Netlify serverless function `/api/elevenlabs-signed-url`.
 */

import { Conversation } from '@11labs/client';
import log from '../utils/logger';
import { fetchElevenLabsSignedUrl } from './elevenlabsSignedUrl';

export interface ElevenLabsCallbacks {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onMessage?: (message: { source: string; message: string }) => void;
  onError?: (error: string) => void;
  onStatusChange?: (status: { status: string }) => void;
  onModeChange?: (mode: { mode: string }) => void;
}

class ElevenLabsConversationService {
  private conversation: InstanceType<typeof Conversation> | null = null;

  /**
   * Get a signed URL from the Netlify function
   */
  private async getSignedUrl(): Promise<string> {
    return fetchElevenLabsSignedUrl();
  }

  /**
   * Request microphone access
   */
  private async getMicrophoneStream(): Promise<MediaStream> {
    try {
      return await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (error) {
      log.error('🎤 Microphone access denied:', error);
      throw new Error('Microphone access is required for voice calls');
    }
  }

  /**
   * Start a conversational AI session
   */
  async startSession(callbacks?: ElevenLabsCallbacks): Promise<void> {
    // End any existing session first
    await this.endSession();

    try {
      const signedUrl = await this.getSignedUrl();

      log.debug('📞 Starting ElevenLabs conversation session...');

      this.conversation = await Conversation.startSession({
        signedUrl,
        onConnect: () => {
          log.debug('📞 ElevenLabs connected');
          callbacks?.onConnect?.();
        },
        onDisconnect: () => {
          log.debug('📞 ElevenLabs disconnected');
          this.conversation = null;
          callbacks?.onDisconnect?.();
        },
        onMessage: (message: { source: string; message: string }) => {
          log.debug(`📞 [${message.source}]: ${message.message}`);
          callbacks?.onMessage?.(message);
        },
        onError: (error: string) => {
          log.error('📞 ElevenLabs error:', error);
          callbacks?.onError?.(error);
        },
        onStatusChange: (status: { status: string }) => {
          log.debug('📞 Status:', status.status);
          callbacks?.onStatusChange?.(status);
        },
        onModeChange: (mode: { mode: string }) => {
          log.debug('📞 Mode:', mode.mode);
          callbacks?.onModeChange?.(mode);
        },
      });

      log.debug('📞 ElevenLabs conversation session started');
    } catch (error) {
      log.error('📞 Failed to start ElevenLabs session:', error);
      this.conversation = null;
      throw error;
    }
  }

  /**
   * End the current session
   */
  async endSession(): Promise<void> {
    if (this.conversation) {
      try {
        await this.conversation.endSession();
        log.debug('📞 ElevenLabs session ended');
      } catch (error) {
        log.warn('📞 Error ending ElevenLabs session:', error);
      }
      this.conversation = null;
    }
  }

  /**
   * Check if a session is active
   */
  isActive(): boolean {
    return this.conversation !== null;
  }

  /**
   * Set the volume (0.0 - 1.0)
   */
  setVolume(volume: number): void {
    if (this.conversation) {
      this.conversation.setVolume({ volume: Math.max(0, Math.min(1, volume)) });
    }
  }
}

export const elevenlabsConversationService = new ElevenLabsConversationService();
export default elevenlabsConversationService;
