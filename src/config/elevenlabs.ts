// ElevenLabs Configuration
// API keys are loaded from environment variables for security
export const ELEVENLABS_CONFIG = {
  API_KEY: import.meta.env.VITE_ELEVENLABS_API_KEY || '',
  AGENT_ID: import.meta.env.VITE_ELEVENLABS_AGENT_ID || '',
  // Add any other configuration options
};

// Validation helper
export const isElevenLabsConfigured = (): boolean => {
  return !!ELEVENLABS_CONFIG.API_KEY && !!ELEVENLABS_CONFIG.AGENT_ID;
}; 