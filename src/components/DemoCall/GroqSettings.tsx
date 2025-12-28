import { useState, useEffect } from 'react';

import {
    Zap,
    Check,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { cn } from '../../utils/cn';

// Available Groq models (free tier)
export const GROQ_MODELS = [
    {
        id: 'llama-3.3-70b-versatile',
        name: 'Llama 3.3 70B Versatile',
        provider: 'Meta',
        description: 'Latest Llama 3.3 model, versatile for various tasks',
        contextWindow: 128000,
        speed: 'fast',
        recommended: true
    },
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
        id: 'mixtral-8x7b-32768',
        name: 'Mixtral 8x7B',
        provider: 'Mistral AI',
        description: 'Mixture of experts model, great for coding & multilingual',
        contextWindow: 32768,
        speed: 'fast',
        recommended: false
    },
    {
        id: 'gemma2-9b-it',
        name: 'Gemma 2 9B',
        provider: 'Google',
        description: 'Efficient model with strong instruction following',
        contextWindow: 8192,
        speed: 'fastest',
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

const STORAGE_KEY = 'clerktree_groq_settings';

export function getGroqSettings(): GroqSettings {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch { /* ignore */ }
    return DEFAULT_SETTINGS;
}

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

    useEffect(() => {
        setSettings(getGroqSettings());
    }, []);

    const saveSettings = (newSettings: GroqSettings) => {
        setSettings(newSettings);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
        window.dispatchEvent(new CustomEvent('groq-settings-updated', { detail: newSettings }));
        if (onSettingsChange) onSettingsChange(newSettings);
    };

    const testConnection = async () => {
        setIsTestingConnection(true);
        setConnectionStatus('idle');
        setTestError(null);
        const apiKey = import.meta.env.VITE_GROQ_API_KEY;

        if (!apiKey) {
            setConnectionStatus('error');
            setTestError('No API key configured.');
            setIsTestingConnection(false);
            return;
        }

        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                body: JSON.stringify({
                    model: settings.model,
                    messages: [{ role: 'user', content: 'Hi' }],
                    max_tokens: 5
                })
            });
            if (response.ok) setConnectionStatus('success');
            else throw new Error('API Error');
        } catch (e: any) {
            setConnectionStatus('error');
            setTestError(e.message || 'Connection failed');
        } finally {
            setIsTestingConnection(false);
        }
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-black")}>
                        Groq Configuration
                    </h1>
                    <p className={cn("text-sm", isDark ? "text-white/60" : "text-black/60")}>
                        Model selection and inference parameters
                    </p>
                </div>
                <button
                    onClick={testConnection}
                    title={testError || ''}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                        isTestingConnection
                            ? isDark ? "bg-white/10 text-white/50" : "bg-black/10 text-black/50"
                            : connectionStatus === 'success'
                                ? "bg-green-500/20 text-green-400"
                                : connectionStatus === 'error'
                                    ? "bg-red-500/20 text-red-400"
                                    : isDark ? "bg-white text-black" : "bg-black text-white"
                    )}
                >
                    {isTestingConnection ? <Loader2 className="w-4 h-4 animate-spin" /> : connectionStatus === 'success' ? <Check className="w-4 h-4" /> : connectionStatus === 'error' ? <AlertCircle className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                    {isTestingConnection ? 'Testing...' : connectionStatus === 'success' ? 'Connected' : connectionStatus === 'error' ? 'Failed' : 'Test Connection'}
                </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Model Selection - Minimal Card */}
                <div className={cn(
                    "p-6 rounded-xl border",
                    isDark ? "bg-black/40 border-white/10 text-white" : "bg-white border-black/10 text-black"
                )}>
                    <h3 className={cn("text-lg font-semibold mb-1", isDark ? "text-white" : "text-black")}>
                        Model Selection
                    </h3>
                    <p className={cn("text-sm mb-6", isDark ? "text-white/40" : "text-black/40")}>
                        Choose the AI model for your agent
                    </p>

                    <div className="space-y-3">
                        {GROQ_MODELS.map((model) => (
                            <button
                                key={model.id}
                                onClick={() => saveSettings({ ...settings, model: model.id })}
                                className={cn(
                                    "w-full text-left rounded-lg transition-all p-4 border",
                                    settings.model === model.id
                                        ? isDark
                                            ? "bg-purple-500/10 border-purple-500/30 ring-1 ring-purple-500/30"
                                            : "bg-purple-50 border-purple-200 ring-1 ring-purple-500/20"
                                        : isDark
                                            ? "bg-transparent border-white/5 hover:bg-white/5 hover:border-white/10"
                                            : "bg-transparent border-black/5 hover:bg-black/5 hover:border-black/10"
                                )}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className={cn("font-medium", isDark ? "text-white" : "text-black")}>
                                        {model.name}
                                    </span>
                                    {settings.model === model.id && (
                                        <Check className={cn("w-4 h-4", isDark ? "text-purple-400" : "text-purple-600")} />
                                    )}
                                </div>
                                <p className={cn("text-xs", isDark ? "text-white/50" : "text-black/50")}>
                                    {model.description}
                                </p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Parameters - Minimal Card */}
                <div className={cn(
                    "p-6 rounded-xl border h-fit",
                    isDark ? "bg-black/40 border-white/10 text-white" : "bg-white border-black/10 text-black"
                )}>
                    <h3 className={cn("text-lg font-semibold mb-1", isDark ? "text-white" : "text-black")}>
                        Parameters
                    </h3>
                    <p className={cn("text-sm mb-6", isDark ? "text-white/40" : "text-black/40")}>
                        Fine-tune the model behavior
                    </p>

                    <div className="space-y-8">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <label className={cn("text-sm font-medium", isDark ? "text-white" : "text-black")}>
                                    Temperature
                                </label>
                                <span className={cn("text-xs font-mono px-2 py-1 rounded", isDark ? "bg-white/5" : "bg-black/5")}>
                                    {settings.temperature}
                                </span>
                            </div>
                            <input
                                type="range" min="0" max="2" step="0.1"
                                value={settings.temperature}
                                onChange={(e) => saveSettings({ ...settings, temperature: parseFloat(e.target.value) })}
                                className="w-full h-1.5 rounded-full appearance-none bg-white/10 cursor-pointer accent-white"
                            />
                            <p className={cn("text-xs mt-2", isDark ? "text-white/40" : "text-black/40")}>
                                Controls creativity. Lower values are more deterministic.
                            </p>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <label className={cn("text-sm font-medium", isDark ? "text-white" : "text-black")}>
                                    Max Tokens
                                </label>
                                <span className={cn("text-xs font-mono px-2 py-1 rounded", isDark ? "bg-white/5" : "bg-black/5")}>
                                    {settings.maxTokens}
                                </span>
                            </div>
                            <input
                                type="range" min="256" max="8192" step="256"
                                value={settings.maxTokens}
                                onChange={(e) => saveSettings({ ...settings, maxTokens: parseInt(e.target.value) })}
                                className="w-full h-1.5 rounded-full appearance-none bg-white/10 cursor-pointer accent-white"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <label className={cn("text-sm font-medium", isDark ? "text-white" : "text-black")}>
                                    Top P
                                </label>
                                <span className={cn("text-xs font-mono px-2 py-1 rounded", isDark ? "bg-white/5" : "bg-black/5")}>
                                    {settings.topP}
                                </span>
                            </div>
                            <input
                                type="range" min="0.1" max="1" step="0.05"
                                value={settings.topP}
                                onChange={(e) => saveSettings({ ...settings, topP: parseFloat(e.target.value) })}
                                className="w-full h-1.5 rounded-full appearance-none bg-white/10 cursor-pointer accent-white"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
