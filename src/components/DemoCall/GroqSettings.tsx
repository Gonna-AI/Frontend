/**
 * Groq API Settings Page
 * 
 * Allows users to configure Groq API parameters:
 * - Model selection (from available free models)
 * - Temperature
 * - Max tokens
 * - Top P
 * - Other API parameters
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles,
    Cpu,
    Thermometer,
    Hash,
    Zap,
    RefreshCw,
    Check,
    AlertCircle,
    Info,
    ChevronDown,
    ExternalLink,
    Loader2
} from 'lucide-react';
import { cn } from '@/utils/cn';

// Available Groq models (free tier)
export const GROQ_MODELS = [
    // Llama 3.3 Models
    {
        id: 'llama-3.3-70b-versatile',
        name: 'Llama 3.3 70B Versatile',
        provider: 'Meta',
        description: 'Latest Llama 3.3 model, versatile for various tasks',
        contextWindow: 128000,
        speed: 'fast',
        recommended: true
    },
    // Llama 3.1 Models
    {
        id: 'llama-3.1-8b-instant',
        name: 'Llama 3.1 8B Instant',
        provider: 'Meta',
        description: 'Fast, lightweight model for quick responses',
        contextWindow: 128000,
        speed: 'fastest',
        recommended: false
    },
    {
        id: 'llama-3.1-70b-versatile',
        name: 'Llama 3.1 70B Versatile',
        provider: 'Meta',
        description: 'Large model for complex reasoning tasks',
        contextWindow: 128000,
        speed: 'fast',
        recommended: false
    },
    // Mixtral Models
    {
        id: 'mixtral-8x7b-32768',
        name: 'Mixtral 8x7B',
        provider: 'Mistral AI',
        description: 'Mixture of experts model, great for coding & multilingual',
        contextWindow: 32768,
        speed: 'fast',
        recommended: false
    },
    // Gemma Models
    {
        id: 'gemma2-9b-it',
        name: 'Gemma 2 9B',
        provider: 'Google',
        description: 'Efficient model with strong instruction following',
        contextWindow: 8192,
        speed: 'fastest',
        recommended: false
    },
    // OpenAI Compatible Models
    {
        id: 'openai/gpt-oss-20b',
        name: 'GPT-OSS 20B',
        provider: 'OpenAI OSS',
        description: 'Open source GPT model, good balance of speed and quality',
        contextWindow: 8192,
        speed: 'fast',
        recommended: false
    },
    // Qwen Models
    {
        id: 'qwen/qwen3-32b',
        name: 'Qwen3 32B',
        provider: 'Alibaba',
        description: 'Strong multilingual model with reasoning capabilities',
        contextWindow: 32768,
        speed: 'fast',
        recommended: false
    },
    // Compound Beta Models
    {
        id: 'compound-beta',
        name: 'Compound Beta',
        provider: 'Groq',
        description: 'Experimental compound AI model',
        contextWindow: 8192,
        speed: 'medium',
        recommended: false
    }
];

export interface GroqSettings {
    model: string;
    temperature: number;
    maxTokens: number;
    topP: number;
    frequencyPenalty: number;
    presencePenalty: number;
    systemPromptEnabled: boolean;
}

const DEFAULT_SETTINGS: GroqSettings = {
    model: 'llama-3.3-70b-versatile',
    temperature: 0.7,
    maxTokens: 2048,
    topP: 1.0,
    frequencyPenalty: 0,
    presencePenalty: 0,
    systemPromptEnabled: true
};

// Storage key for persisting settings
const STORAGE_KEY = 'clerktree_groq_settings';

// Export function to get current settings (for use by other services)
export function getGroqSettings(): GroqSettings {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
        }
    } catch (e) {
        console.warn('Failed to load Groq settings:', e);
    }
    return DEFAULT_SETTINGS;
}

// Export function to update settings programmatically
export function updateGroqSettings(settings: Partial<GroqSettings>): GroqSettings {
    const current = getGroqSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('groq-settings-updated', { detail: updated }));
    return updated;
}

interface GroqSettingsProps {
    isDark?: boolean;
    onSettingsChange?: (settings: GroqSettings) => void;
}

export default function GroqSettingsPage({ isDark = true, onSettingsChange }: GroqSettingsProps) {
    const [settings, setSettings] = useState<GroqSettings>(getGroqSettings);
    const [isTestingConnection, setIsTestingConnection] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [testError, setTestError] = useState<string | null>(null);
    const [expandedModel, setExpandedModel] = useState<string | null>(null);
    const [hasChanges, setHasChanges] = useState(false);

    // Load settings on mount
    useEffect(() => {
        const stored = getGroqSettings();
        setSettings(stored);
    }, []);

    // Save settings when they change
    const saveSettings = (newSettings: GroqSettings) => {
        // Log the changes to console
        console.log('⚙️ Groq Settings Updated:', {
            model: newSettings.model,
            temperature: newSettings.temperature,
            maxTokens: newSettings.maxTokens,
            topP: newSettings.topP
        });

        setSettings(newSettings);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
        setHasChanges(true);

        // Dispatch event for other components to listen to
        window.dispatchEvent(new CustomEvent('groq-settings-updated', { detail: newSettings }));

        if (onSettingsChange) {
            onSettingsChange(newSettings);
        }
    };

    // Test connection with current settings
    const testConnection = async () => {
        setIsTestingConnection(true);
        setConnectionStatus('idle');
        setTestError(null);

        const apiKey = import.meta.env.VITE_GROQ_API_KEY;

        if (!apiKey) {
            console.error('❌ No Groq API key found in VITE_GROQ_API_KEY');
            setConnectionStatus('error');
            setTestError('No API key configured. Set VITE_GROQ_API_KEY in your .env file.');
            setIsTestingConnection(false);
            return;
        }

        try {
            console.log(`🧪 Testing Groq API with model: ${settings.model}`);
            console.log(`   Temperature: ${settings.temperature}, Max Tokens: ${settings.maxTokens}`);

            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: settings.model,
                    messages: [{ role: 'user', content: 'Say "Connection successful!" in exactly 3 words.' }],
                    max_tokens: 20,
                    temperature: settings.temperature
                }),
                signal: AbortSignal.timeout(15000)
            });

            if (response.ok) {
                const data = await response.json();
                const testResponse = data.choices?.[0]?.message?.content || 'No response';
                console.log('✅ Groq API test successful:', testResponse);
                setConnectionStatus('success');
                setTestError(`Model responded: "${testResponse.substring(0, 50)}..."`);
            } else {
                const errorText = await response.text();
                console.error('❌ Groq API error:', response.status, errorText);
                setConnectionStatus('error');

                // Parse error for user-friendly message
                try {
                    const errorData = JSON.parse(errorText);
                    if (errorData.error?.message) {
                        setTestError(errorData.error.message);
                    } else {
                        setTestError(`API Error: ${response.status}`);
                    }
                } catch {
                    setTestError(`API Error: ${response.status} - ${errorText.substring(0, 100)}`);
                }
            }
        } catch (error) {
            console.error('❌ Connection test failed:', error);
            setConnectionStatus('error');
            if (error instanceof Error) {
                if (error.name === 'AbortError' || error.message.includes('timeout')) {
                    setTestError('Request timed out. Check your internet connection.');
                } else {
                    setTestError(error.message);
                }
            } else {
                setTestError('Unknown error occurred');
            }
        } finally {
            setIsTestingConnection(false);

            // Reset status after 5 seconds
            setTimeout(() => {
                setConnectionStatus('idle');
                setTestError(null);
            }, 5000);
        }
    };

    const selectedModel = GROQ_MODELS.find(m => m.id === settings.model) || GROQ_MODELS[0];

    return (
        <div className={cn(
            "h-full overflow-y-auto p-4 md:p-6",
            isDark ? "bg-black/40" : "bg-white"
        )}>
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center",
                            isDark ? "bg-purple-500/20" : "bg-purple-100"
                        )}>
                            <Sparkles className={cn(
                                "w-5 h-5",
                                isDark ? "text-purple-400" : "text-purple-600"
                            )} />
                        </div>
                        <div>
                            <h1 className={cn(
                                "text-lg font-semibold",
                                isDark ? "text-white" : "text-black"
                            )}>
                                Groq AI Settings
                            </h1>
                            <p className={cn(
                                "text-sm",
                                isDark ? "text-white/60" : "text-black/60"
                            )}>
                                Configure your AI model and parameters
                            </p>
                        </div>
                    </div>

                    {/* Test Connection Button */}
                    <button
                        onClick={testConnection}
                        disabled={isTestingConnection}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                            isTestingConnection
                                ? isDark ? "bg-white/10 text-white/50" : "bg-black/10 text-black/50"
                                : connectionStatus === 'success'
                                    ? "bg-green-500/20 text-green-400"
                                    : connectionStatus === 'error'
                                        ? "bg-red-500/20 text-red-400"
                                        : isDark
                                            ? "bg-white/10 hover:bg-white/20 text-white"
                                            : "bg-black/5 hover:bg-black/10 text-black"
                        )}
                    >
                        {isTestingConnection ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : connectionStatus === 'success' ? (
                            <Check className="w-4 h-4" />
                        ) : connectionStatus === 'error' ? (
                            <AlertCircle className="w-4 h-4" />
                        ) : (
                            <RefreshCw className="w-4 h-4" />
                        )}
                        {isTestingConnection ? 'Testing...' : connectionStatus === 'success' ? 'Connected!' : connectionStatus === 'error' ? 'Error' : 'Test Connection'}
                    </button>
                </div>

                {/* Test Connection Result */}
                <AnimatePresence>
                    {testError && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={cn(
                                "flex items-center gap-2 px-4 py-3 rounded-lg text-sm",
                                connectionStatus === 'success'
                                    ? isDark ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-700"
                                    : isDark ? "bg-red-500/20 text-red-400" : "bg-red-100 text-red-700"
                            )}
                        >
                            {connectionStatus === 'success' ? (
                                <Check className="w-4 h-4 shrink-0" />
                            ) : (
                                <AlertCircle className="w-4 h-4 shrink-0" />
                            )}
                            <span className="break-all">{testError}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Changes indicator */}
                <AnimatePresence>
                    {hasChanges && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm",
                                isDark ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-700"
                            )}
                        >
                            <Check className="w-4 h-4" />
                            Settings saved! Changes will apply to the next AI call.
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Model Selection */}
                <div className={cn(
                    "rounded-xl border overflow-hidden",
                    isDark ? "bg-white/5 border-white/10" : "bg-white border-black/10"
                )}>
                    <div className={cn(
                        "px-4 py-3 border-b flex items-center gap-2",
                        isDark ? "border-white/10" : "border-black/10"
                    )}>
                        <Cpu className={cn("w-4 h-4", isDark ? "text-purple-400" : "text-purple-600")} />
                        <span className={cn("font-medium", isDark ? "text-white" : "text-black")}>
                            Model Selection
                        </span>
                    </div>

                    <div className="p-4 space-y-2">
                        {GROQ_MODELS.map((model) => (
                            <button
                                key={model.id}
                                onClick={() => {
                                    saveSettings({ ...settings, model: model.id });
                                    setExpandedModel(expandedModel === model.id ? null : model.id);
                                }}
                                className={cn(
                                    "w-full text-left rounded-lg border transition-all",
                                    settings.model === model.id
                                        ? isDark
                                            ? "bg-purple-500/20 border-purple-500/50"
                                            : "bg-purple-100 border-purple-300"
                                        : isDark
                                            ? "bg-white/5 border-white/10 hover:bg-white/10"
                                            : "bg-black/5 border-black/10 hover:bg-black/10"
                                )}
                            >
                                <div className="p-3 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold",
                                            settings.model === model.id
                                                ? isDark ? "bg-purple-500/30 text-purple-300" : "bg-purple-200 text-purple-700"
                                                : isDark ? "bg-white/10 text-white/60" : "bg-black/10 text-black/60"
                                        )}>
                                            {model.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className={cn(
                                                    "font-medium text-sm",
                                                    isDark ? "text-white" : "text-black"
                                                )}>
                                                    {model.name}
                                                </span>
                                                {model.recommended && (
                                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-500/20 text-green-400">
                                                        Recommended
                                                    </span>
                                                )}
                                                <span className={cn(
                                                    "px-1.5 py-0.5 rounded text-[10px]",
                                                    model.speed === 'fastest'
                                                        ? "bg-yellow-500/20 text-yellow-400"
                                                        : model.speed === 'fast'
                                                            ? "bg-blue-500/20 text-blue-400"
                                                            : "bg-orange-500/20 text-orange-400"
                                                )}>
                                                    {model.speed}
                                                </span>
                                            </div>
                                            <p className={cn(
                                                "text-xs mt-0.5",
                                                isDark ? "text-white/50" : "text-black/50"
                                            )}>
                                                {model.provider} • {(model.contextWindow / 1000).toFixed(0)}K context
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {settings.model === model.id && (
                                            <Check className={cn(
                                                "w-4 h-4",
                                                isDark ? "text-purple-400" : "text-purple-600"
                                            )} />
                                        )}
                                        <ChevronDown className={cn(
                                            "w-4 h-4 transition-transform",
                                            expandedModel === model.id && "rotate-180",
                                            isDark ? "text-white/40" : "text-black/40"
                                        )} />
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {expandedModel === model.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className={cn(
                                                "px-3 pb-3 text-xs",
                                                isDark ? "text-white/60" : "text-black/60"
                                            )}>
                                                {model.description}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Parameters */}
                <div className={cn(
                    "rounded-xl border overflow-hidden",
                    isDark ? "bg-white/5 border-white/10" : "bg-white border-black/10"
                )}>
                    <div className={cn(
                        "px-4 py-3 border-b flex items-center gap-2",
                        isDark ? "border-white/10" : "border-black/10"
                    )}>
                        <Zap className={cn("w-4 h-4", isDark ? "text-yellow-400" : "text-yellow-600")} />
                        <span className={cn("font-medium", isDark ? "text-white" : "text-black")}>
                            Parameters
                        </span>
                    </div>

                    <div className="p-4 space-y-6">
                        {/* Temperature */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Thermometer className={cn("w-4 h-4", isDark ? "text-orange-400" : "text-orange-600")} />
                                    <span className={cn("text-sm font-medium", isDark ? "text-white" : "text-black")}>
                                        Temperature
                                    </span>
                                    <span className={cn(
                                        "px-2 py-0.5 rounded text-xs font-mono",
                                        isDark ? "bg-white/10 text-white/70" : "bg-black/5 text-black/70"
                                    )}>
                                        {settings.temperature.toFixed(2)}
                                    </span>
                                </div>
                                <div className={cn(
                                    "text-xs flex items-center gap-1",
                                    isDark ? "text-white/40" : "text-black/40"
                                )}>
                                    <Info className="w-3 h-3" />
                                    Higher = more creative
                                </div>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="2"
                                step="0.1"
                                value={settings.temperature}
                                onChange={(e) => saveSettings({ ...settings, temperature: parseFloat(e.target.value) })}
                                className={cn(
                                    "w-full h-2 rounded-full appearance-none cursor-pointer",
                                    isDark ? "bg-white/10" : "bg-black/10",
                                    "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full",
                                    isDark
                                        ? "[&::-webkit-slider-thumb]:bg-orange-400"
                                        : "[&::-webkit-slider-thumb]:bg-orange-500"
                                )}
                            />
                            <div className={cn(
                                "flex justify-between text-xs mt-1",
                                isDark ? "text-white/30" : "text-black/30"
                            )}>
                                <span>Precise (0)</span>
                                <span>Balanced (1)</span>
                                <span>Creative (2)</span>
                            </div>
                        </div>

                        {/* Max Tokens */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Hash className={cn("w-4 h-4", isDark ? "text-blue-400" : "text-blue-600")} />
                                    <span className={cn("text-sm font-medium", isDark ? "text-white" : "text-black")}>
                                        Max Tokens
                                    </span>
                                    <span className={cn(
                                        "px-2 py-0.5 rounded text-xs font-mono",
                                        isDark ? "bg-white/10 text-white/70" : "bg-black/5 text-black/70"
                                    )}>
                                        {settings.maxTokens}
                                    </span>
                                </div>
                                <div className={cn(
                                    "text-xs flex items-center gap-1",
                                    isDark ? "text-white/40" : "text-black/40"
                                )}>
                                    <Info className="w-3 h-3" />
                                    Max response length
                                </div>
                            </div>
                            <input
                                type="range"
                                min="256"
                                max="8192"
                                step="256"
                                value={settings.maxTokens}
                                onChange={(e) => saveSettings({ ...settings, maxTokens: parseInt(e.target.value) })}
                                className={cn(
                                    "w-full h-2 rounded-full appearance-none cursor-pointer",
                                    isDark ? "bg-white/10" : "bg-black/10",
                                    "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full",
                                    isDark
                                        ? "[&::-webkit-slider-thumb]:bg-blue-400"
                                        : "[&::-webkit-slider-thumb]:bg-blue-500"
                                )}
                            />
                            <div className={cn(
                                "flex justify-between text-xs mt-1",
                                isDark ? "text-white/30" : "text-black/30"
                            )}>
                                <span>Short (256)</span>
                                <span>Medium (2048)</span>
                                <span>Long (8192)</span>
                            </div>
                        </div>

                        {/* Top P */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Zap className={cn("w-4 h-4", isDark ? "text-green-400" : "text-green-600")} />
                                    <span className={cn("text-sm font-medium", isDark ? "text-white" : "text-black")}>
                                        Top P (Nucleus Sampling)
                                    </span>
                                    <span className={cn(
                                        "px-2 py-0.5 rounded text-xs font-mono",
                                        isDark ? "bg-white/10 text-white/70" : "bg-black/5 text-black/70"
                                    )}>
                                        {settings.topP.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                            <input
                                type="range"
                                min="0.1"
                                max="1"
                                step="0.05"
                                value={settings.topP}
                                onChange={(e) => saveSettings({ ...settings, topP: parseFloat(e.target.value) })}
                                className={cn(
                                    "w-full h-2 rounded-full appearance-none cursor-pointer",
                                    isDark ? "bg-white/10" : "bg-black/10",
                                    "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full",
                                    isDark
                                        ? "[&::-webkit-slider-thumb]:bg-green-400"
                                        : "[&::-webkit-slider-thumb]:bg-green-500"
                                )}
                            />
                            <div className={cn(
                                "flex justify-between text-xs mt-1",
                                isDark ? "text-white/30" : "text-black/30"
                            )}>
                                <span>Focused (0.1)</span>
                                <span>Balanced (0.5)</span>
                                <span>Diverse (1.0)</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Current Model Info */}
                <div className={cn(
                    "rounded-xl border p-4",
                    isDark ? "bg-purple-500/10 border-purple-500/20" : "bg-purple-50 border-purple-200"
                )}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={cn(
                                "text-sm font-medium",
                                isDark ? "text-purple-300" : "text-purple-700"
                            )}>
                                Currently using: <span className="font-bold">{selectedModel.name}</span>
                            </p>
                            <p className={cn(
                                "text-xs mt-1",
                                isDark ? "text-purple-400/60" : "text-purple-600/60"
                            )}>
                                {selectedModel.description}
                            </p>
                        </div>
                        <a
                            href="https://console.groq.com/docs/models"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                                "flex items-center gap-1 text-xs",
                                isDark ? "text-purple-400 hover:text-purple-300" : "text-purple-600 hover:text-purple-700"
                            )}
                        >
                            View all models
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                </div>

                {/* Reset to defaults */}
                <button
                    onClick={() => {
                        saveSettings(DEFAULT_SETTINGS);
                        setHasChanges(true);
                    }}
                    className={cn(
                        "w-full py-3 rounded-lg text-sm font-medium transition-colors",
                        isDark
                            ? "bg-white/5 hover:bg-white/10 text-white/60 hover:text-white"
                            : "bg-black/5 hover:bg-black/10 text-black/60 hover:text-black"
                    )}
                >
                    Reset to Default Settings
                </button>
            </div>
        </div>
    );
}
