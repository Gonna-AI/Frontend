import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '../../utils/cn';
import { Plus, Copy, Trash2, Key, Shield, Check, ArrowRight, ArrowLeft, X, Eye, EyeOff, AlertTriangle, Zap, MessageSquare, Mic, Loader2 } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface ApiKey {
    id: string;
    name: string;
    token: string;
    created: string;
    lastUsed: string;
    status: 'active' | 'revoked';
    permissions: string[];
    rateLimit: number;
}

type WizardStep = 'name' | 'permissions' | 'limits' | 'confirm' | 'created';

export default function KeysView({ isDark = true }: { isDark?: boolean }) {
    const { user } = useAuth();
    const [keys, setKeys] = useState<ApiKey[]>([]);
    const [isLoadingKeys, setIsLoadingKeys] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [wizardStep, setWizardStep] = useState<WizardStep>('name');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [showToken, setShowToken] = useState<string | null>(null);

    // New key form state
    const [newKeyName, setNewKeyName] = useState('');
    const [newKeyPermissions, setNewKeyPermissions] = useState<string[]>(['voice', 'text']);
    const [newKeyRateLimit, setNewKeyRateLimit] = useState(100);
    const [createdKeyToken, setCreatedKeyToken] = useState<string | null>(null);

    const resetForm = () => {
        setNewKeyName('');
        setNewKeyPermissions(['voice', 'text']);
        setNewKeyRateLimit(100);
        setWizardStep('name');
        setCreatedKeyToken(null);
    };

    const openCreateModal = () => {
        resetForm();
        setShowCreateModal(true);
    };

    const closeCreateModal = () => {
        setShowCreateModal(false);
        resetForm();
    };

    const getAuthHeaders = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        return {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json'
        };
    };

    const apiBase = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/api-keys`;

    // Load keys via edge function
    const loadKeys = useCallback(async () => {
        if (!user?.id) return;
        setIsLoadingKeys(true);
        try {
            const headers = await getAuthHeaders();
            const res = await fetch(apiBase, { headers });
            const result = await res.json();

            if (res.ok && result.keys) {
                setKeys(result.keys.map((k: any) => ({
                    id: k.id,
                    name: k.name,
                    token: k.token,
                    created: new Date(k.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    lastUsed: k.last_used ? new Date(k.last_used).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never',
                    status: k.status,
                    permissions: k.permissions || [],
                    rateLimit: k.rate_limit
                })));
            }
        } catch (err) {
            console.error('Failed to load API keys:', err);
        } finally {
            setIsLoadingKeys(false);
        }
    }, [user?.id]);

    useEffect(() => {
        loadKeys();
    }, [loadKeys]);

    const createKey = async () => {
        if (!user?.id) return;

        try {
            const headers = await getAuthHeaders();
            const res = await fetch(apiBase, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    name: newKeyName,
                    permissions: newKeyPermissions,
                    rate_limit: newKeyRateLimit
                })
            });
            const result = await res.json();

            if (res.ok && result.key) {
                const data = result.key;
                const newKey: ApiKey = {
                    id: data.id,
                    name: data.name,
                    token: data.token,
                    created: new Date(data.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    lastUsed: 'Never',
                    status: data.status,
                    permissions: data.permissions || [],
                    rateLimit: data.rate_limit
                };
                setKeys([newKey, ...keys]);
                setCreatedKeyToken(data.token);
                setWizardStep('created');
            } else {
                console.error('Failed to create API key:', result.error);
            }
        } catch (err) {
            console.error('Failed to create API key:', err);
        }
    };

    const deleteKey = async (id: string) => {
        if (confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
            try {
                const headers = await getAuthHeaders();
                const res = await fetch(`${apiBase}?id=${id}`, {
                    method: 'DELETE',
                    headers
                });

                if (res.ok) {
                    setKeys(keys.filter(k => k.id !== id));
                }
            } catch (err) {
                console.error('Failed to delete API key:', err);
            }
        }
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const togglePermission = (permission: string) => {
        if (newKeyPermissions.includes(permission)) {
            setNewKeyPermissions(newKeyPermissions.filter(p => p !== permission));
        } else {
            setNewKeyPermissions([...newKeyPermissions, permission]);
        }
    };

    const canProceed = () => {
        switch (wizardStep) {
            case 'name':
                return newKeyName.trim().length >= 3;
            case 'permissions':
                return newKeyPermissions.length > 0;
            case 'limits':
                return newKeyRateLimit >= 10 && newKeyRateLimit <= 1000;
            default:
                return true;
        }
    };

    const nextStep = () => {
        if (!canProceed()) return;

        switch (wizardStep) {
            case 'name':
                setWizardStep('permissions');
                break;
            case 'permissions':
                setWizardStep('limits');
                break;
            case 'limits':
                setWizardStep('confirm');
                break;
            case 'confirm':
                createKey();
                break;
        }
    };

    const prevStep = () => {
        switch (wizardStep) {
            case 'permissions':
                setWizardStep('name');
                break;
            case 'limits':
                setWizardStep('permissions');
                break;
            case 'confirm':
                setWizardStep('limits');
                break;
        }
    };

    const getStepNumber = () => {
        switch (wizardStep) {
            case 'name': return 1;
            case 'permissions': return 2;
            case 'limits': return 3;
            case 'confirm': return 4;
            case 'created': return 5;
        }
    };

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-black")}>API Keys</h1>
                    <p className={cn("text-sm mt-1", isDark ? "text-white/60" : "text-black/60")}>
                        Manage API keys for authenticating your applications
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <a
                        href="/docs"
                        className={cn(
                            "px-4 py-2 text-sm font-medium rounded-lg border transition-colors",
                            isDark ? "border-white/10 hover:bg-white/5 text-white" : "border-black/10 hover:bg-gray-50 text-black"
                        )}
                    >
                        View Documentation
                    </a>
                    <button
                        onClick={openCreateModal}
                        className={cn(
                            "px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors",
                            isDark ? "bg-white text-black hover:bg-white/90" : "bg-black text-white hover:bg-black/90"
                        )}>
                        <Plus className="w-4 h-4" />
                        Create API Key
                    </button>
                </div>
            </div>

            {/* Security Notice */}
            <div className={cn(
                "p-4 rounded-xl border flex items-start gap-4",
                isDark ? "bg-orange-500/5 border-orange-500/20" : "bg-orange-50 border-orange-200"
            )}>
                <div className={cn("p-2 rounded-lg", isDark ? "bg-orange-500/10" : "bg-orange-100")}>
                    <Shield className={cn("w-5 h-5", isDark ? "text-orange-400" : "text-orange-600")} />
                </div>
                <div>
                    <h3 className={cn("text-sm font-medium", isDark ? "text-orange-400" : "text-orange-700")}>
                        Keep Your API Keys Secure
                    </h3>
                    <p className={cn("text-sm mt-1", isDark ? "text-orange-400/70" : "text-orange-600/80")}>
                        Never share your API keys publicly or commit them to version control.
                        Use environment variables to store keys securely in your applications.
                    </p>
                </div>
            </div>

            {/* Keys List */}
            <div className={cn(
                "rounded-xl border overflow-hidden",
                isDark ? "bg-[#09090B] border-white/10" : "bg-white border-black/10"
            )}>
                {keys.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className={cn(
                            "w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center",
                            isDark ? "bg-white/5" : "bg-gray-100"
                        )}>
                            <Key className={cn("w-8 h-8", isDark ? "text-white/20" : "text-gray-300")} />
                        </div>
                        <h3 className={cn("text-lg font-semibold mb-1", isDark ? "text-white" : "text-black")}>
                            No API Keys Yet
                        </h3>
                        <p className={cn("text-sm mb-6 max-w-sm mx-auto", isDark ? "text-white/60" : "text-black/60")}>
                            Create your first API key to start integrating ClerkTree into your applications.
                        </p>
                        <button
                            onClick={openCreateModal}
                            className={cn(
                                "px-4 py-2 rounded-lg font-medium text-sm inline-flex items-center gap-2 transition-colors",
                                isDark ? "bg-white text-black hover:bg-white/90" : "bg-black text-white hover:bg-black/90"
                            )}>
                            <Plus className="w-4 h-4" />
                            Create Your First Key
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Table Header */}
                        <div className={cn(
                            "grid grid-cols-12 px-6 py-3 border-b text-xs font-semibold uppercase tracking-wider",
                            isDark ? "bg-white/5 border-white/10 text-white/50" : "bg-gray-50 border-black/5 text-gray-500"
                        )}>
                            <div className="col-span-3">Name</div>
                            <div className="col-span-3">Key</div>
                            <div className="col-span-2">Permissions</div>
                            <div className="col-span-2">Created</div>
                            <div className="col-span-2 text-right">Actions</div>
                        </div>

                        {keys.map((key) => (
                            <div key={key.id} className={cn(
                                "grid grid-cols-12 px-6 py-4 border-b last:border-0 items-center transition-colors group",
                                isDark ? "border-white/5 hover:bg-white/5" : "border-black/5 hover:bg-gray-50"
                            )}>
                                <div className="col-span-3">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "p-2 rounded-lg",
                                            isDark ? "bg-white/5" : "bg-gray-100"
                                        )}>
                                            <Key className={cn("w-4 h-4", isDark ? "text-white/60" : "text-gray-500")} />
                                        </div>
                                        <div>
                                            <p className={cn("font-medium text-sm", isDark ? "text-white" : "text-black")}>{key.name}</p>
                                            <p className={cn("text-xs", isDark ? "text-white/40" : "text-gray-500")}>Rate limit: {key.rateLimit} req/min</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-3">
                                    <div className="flex items-center gap-2">
                                        <code className={cn(
                                            "text-xs px-2 py-1 rounded border font-mono",
                                            isDark ? "bg-black/20 border-white/10 text-white/60" : "bg-gray-100 border-gray-200 text-gray-600"
                                        )}>
                                            {showToken === key.id ? key.token : `${key.token.substr(0, 12)}...${key.token.substr(-4)}`}
                                        </code>
                                        <button
                                            onClick={() => setShowToken(showToken === key.id ? null : key.id)}
                                            className={cn("p-1 rounded", isDark ? "hover:bg-white/10 text-white/40" : "hover:bg-gray-100 text-gray-400")}
                                        >
                                            {showToken === key.id ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <div className="flex flex-wrap gap-1">
                                        {key.permissions.map(p => (
                                            <span key={p} className={cn(
                                                "px-2 py-0.5 rounded text-xs font-medium",
                                                p === 'voice'
                                                    ? (isDark ? "bg-purple-500/10 text-purple-400" : "bg-purple-50 text-purple-600")
                                                    : (isDark ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600")
                                            )}>
                                                {p}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <p className={cn("text-sm", isDark ? "text-white/80" : "text-gray-700")}>{key.created}</p>
                                    <p className={cn("text-xs", isDark ? "text-white/40" : "text-gray-500")}>Last used: {key.lastUsed}</p>
                                </div>
                                <div className="col-span-2 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => copyToClipboard(key.token, key.id)}
                                        className={cn(
                                            "p-2 rounded-lg transition-colors border",
                                            isDark ? "border-white/10 hover:bg-white/10 text-white/60" : "border-gray-200 hover:bg-gray-100 text-gray-500"
                                        )}
                                        title="Copy Key"
                                    >
                                        {copiedId === key.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                    <button
                                        onClick={() => deleteKey(key.id)}
                                        className={cn(
                                            "p-2 rounded-lg transition-colors",
                                            isDark ? "hover:bg-red-500/10 text-white/40 hover:text-red-400" : "hover:bg-red-50 text-gray-400 hover:text-red-600"
                                        )}
                                        title="Revoke Key"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>

            {/* Multi-Step Create Key Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className={cn(
                        "w-full max-w-lg rounded-xl border overflow-hidden",
                        isDark ? "bg-[#0A0A0A] border-white/10" : "bg-white border-black/10"
                    )}>
                        {/* Modal Header */}
                        <div className={cn(
                            "px-6 py-4 border-b flex items-center justify-between",
                            isDark ? "border-white/10" : "border-black/10"
                        )}>
                            <div>
                                <h2 className={cn("text-lg font-semibold", isDark ? "text-white" : "text-black")}>
                                    Create API Key
                                </h2>
                                {wizardStep !== 'created' && (
                                    <p className={cn("text-xs mt-0.5", isDark ? "text-white/40" : "text-black/40")}>
                                        Step {getStepNumber()} of 4
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={closeCreateModal}
                                className={cn("p-2 rounded-lg transition-colors", isDark ? "hover:bg-white/10 text-white/60" : "hover:bg-gray-100 text-gray-500")}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Progress Bar */}
                        {wizardStep !== 'created' && (
                            <div className={cn("h-1", isDark ? "bg-white/5" : "bg-gray-100")}>
                                <div
                                    className="h-full bg-emerald-500 transition-all duration-300"
                                    style={{ width: `${(getStepNumber() / 4) * 100}%` }}
                                />
                            </div>
                        )}

                        {/* Modal Content */}
                        <div className="p-6">
                            {/* Step 1: Name */}
                            {wizardStep === 'name' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className={cn("text-sm font-medium", isDark ? "text-white/80" : "text-gray-700")}>
                                            Key Name
                                        </label>
                                        <p className={cn("text-xs mt-1 mb-3", isDark ? "text-white/40" : "text-gray-500")}>
                                            Give your API key a descriptive name to identify it later.
                                        </p>
                                        <input
                                            type="text"
                                            value={newKeyName}
                                            onChange={(e) => setNewKeyName(e.target.value)}
                                            placeholder="e.g., Production API Key"
                                            className={cn(
                                                "w-full px-4 py-3 rounded-lg text-sm border focus:outline-none focus:ring-2",
                                                isDark
                                                    ? "bg-white/5 border-white/10 text-white placeholder-white/30 focus:ring-white/20"
                                                    : "bg-gray-50 border-gray-200 text-black placeholder-gray-400 focus:ring-gray-300"
                                            )}
                                        />
                                        {newKeyName.length > 0 && newKeyName.length < 3 && (
                                            <p className="text-xs text-rose-400 mt-2">Name must be at least 3 characters</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Permissions */}
                            {wizardStep === 'permissions' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className={cn("text-sm font-medium", isDark ? "text-white/80" : "text-gray-700")}>
                                            Permissions
                                        </label>
                                        <p className={cn("text-xs mt-1 mb-4", isDark ? "text-white/40" : "text-gray-500")}>
                                            Select which services this API key can access.
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <button
                                            onClick={() => togglePermission('voice')}
                                            className={cn(
                                                "w-full p-4 rounded-lg border flex items-center gap-4 transition-all text-left",
                                                newKeyPermissions.includes('voice')
                                                    ? (isDark ? "bg-purple-500/10 border-purple-500/50" : "bg-purple-50 border-purple-300")
                                                    : (isDark ? "bg-white/5 border-white/10 hover:border-white/20" : "bg-gray-50 border-gray-200 hover:border-gray-300")
                                            )}
                                        >
                                            <div className={cn(
                                                "p-2 rounded-lg",
                                                newKeyPermissions.includes('voice')
                                                    ? (isDark ? "bg-purple-500/20" : "bg-purple-100")
                                                    : (isDark ? "bg-white/10" : "bg-gray-200")
                                            )}>
                                                <Mic className={cn(
                                                    "w-5 h-5",
                                                    newKeyPermissions.includes('voice') ? "text-purple-500" : (isDark ? "text-white/40" : "text-gray-400")
                                                )} />
                                            </div>
                                            <div className="flex-1">
                                                <p className={cn("font-medium text-sm", isDark ? "text-white" : "text-black")}>Voice API</p>
                                                <p className={cn("text-xs", isDark ? "text-white/40" : "text-gray-500")}>Access to voice calls and TTS</p>
                                            </div>
                                            <div className={cn(
                                                "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                                                newKeyPermissions.includes('voice')
                                                    ? "bg-purple-500 border-purple-500"
                                                    : (isDark ? "border-white/20" : "border-gray-300")
                                            )}>
                                                {newKeyPermissions.includes('voice') && <Check className="w-3 h-3 text-white" />}
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => togglePermission('text')}
                                            className={cn(
                                                "w-full p-4 rounded-lg border flex items-center gap-4 transition-all text-left",
                                                newKeyPermissions.includes('text')
                                                    ? (isDark ? "bg-blue-500/10 border-blue-500/50" : "bg-blue-50 border-blue-300")
                                                    : (isDark ? "bg-white/5 border-white/10 hover:border-white/20" : "bg-gray-50 border-gray-200 hover:border-gray-300")
                                            )}
                                        >
                                            <div className={cn(
                                                "p-2 rounded-lg",
                                                newKeyPermissions.includes('text')
                                                    ? (isDark ? "bg-blue-500/20" : "bg-blue-100")
                                                    : (isDark ? "bg-white/10" : "bg-gray-200")
                                            )}>
                                                <MessageSquare className={cn(
                                                    "w-5 h-5",
                                                    newKeyPermissions.includes('text') ? "text-blue-500" : (isDark ? "text-white/40" : "text-gray-400")
                                                )} />
                                            </div>
                                            <div className="flex-1">
                                                <p className={cn("font-medium text-sm", isDark ? "text-white" : "text-black")}>Text API</p>
                                                <p className={cn("text-xs", isDark ? "text-white/40" : "text-gray-500")}>Access to chat and text completions</p>
                                            </div>
                                            <div className={cn(
                                                "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                                                newKeyPermissions.includes('text')
                                                    ? "bg-blue-500 border-blue-500"
                                                    : (isDark ? "border-white/20" : "border-gray-300")
                                            )}>
                                                {newKeyPermissions.includes('text') && <Check className="w-3 h-3 text-white" />}
                                            </div>
                                        </button>
                                    </div>

                                    {newKeyPermissions.length === 0 && (
                                        <p className="text-xs text-rose-400">Select at least one permission</p>
                                    )}
                                </div>
                            )}

                            {/* Step 3: Rate Limits */}
                            {wizardStep === 'limits' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className={cn("text-sm font-medium", isDark ? "text-white/80" : "text-gray-700")}>
                                            Rate Limit
                                        </label>
                                        <p className={cn("text-xs mt-1 mb-4", isDark ? "text-white/40" : "text-gray-500")}>
                                            Maximum requests per minute for this API key.
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <input
                                            type="range"
                                            min="10"
                                            max="1000"
                                            step="10"
                                            value={newKeyRateLimit}
                                            onChange={(e) => setNewKeyRateLimit(parseInt(e.target.value))}
                                            className="w-full"
                                        />
                                        <div className="flex items-center justify-between">
                                            <span className={cn("text-xs", isDark ? "text-white/40" : "text-gray-500")}>10 req/min</span>
                                            <span className={cn("text-lg font-bold", isDark ? "text-white" : "text-black")}>{newKeyRateLimit} req/min</span>
                                            <span className={cn("text-xs", isDark ? "text-white/40" : "text-gray-500")}>1000 req/min</span>
                                        </div>
                                    </div>

                                    <div className={cn(
                                        "p-3 rounded-lg flex items-start gap-3",
                                        isDark ? "bg-white/5" : "bg-gray-50"
                                    )}>
                                        <AlertTriangle className={cn("w-4 h-4 mt-0.5", isDark ? "text-orange-400" : "text-orange-500")} />
                                        <p className={cn("text-xs", isDark ? "text-white/60" : "text-gray-600")}>
                                            Higher rate limits consume more credits. Free plan supports up to 100 req/min.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Confirm */}
                            {wizardStep === 'confirm' && (
                                <div className="space-y-4">
                                    <p className={cn("text-sm", isDark ? "text-white/60" : "text-gray-600")}>
                                        Review your API key configuration before creating.
                                    </p>

                                    <div className={cn(
                                        "rounded-lg border divide-y",
                                        isDark ? "bg-white/5 border-white/10 divide-white/10" : "bg-gray-50 border-gray-200 divide-gray-200"
                                    )}>
                                        <div className="p-4 flex justify-between">
                                            <span className={cn("text-sm", isDark ? "text-white/60" : "text-gray-500")}>Name</span>
                                            <span className={cn("text-sm font-medium", isDark ? "text-white" : "text-black")}>{newKeyName}</span>
                                        </div>
                                        <div className="p-4 flex justify-between items-center">
                                            <span className={cn("text-sm", isDark ? "text-white/60" : "text-gray-500")}>Permissions</span>
                                            <div className="flex gap-1">
                                                {newKeyPermissions.map(p => (
                                                    <span key={p} className={cn(
                                                        "px-2 py-0.5 rounded text-xs font-medium",
                                                        p === 'voice'
                                                            ? (isDark ? "bg-purple-500/10 text-purple-400" : "bg-purple-50 text-purple-600")
                                                            : (isDark ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600")
                                                    )}>
                                                        {p}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="p-4 flex justify-between">
                                            <span className={cn("text-sm", isDark ? "text-white/60" : "text-gray-500")}>Rate Limit</span>
                                            <span className={cn("text-sm font-medium", isDark ? "text-white" : "text-black")}>{newKeyRateLimit} req/min</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 5: Created */}
                            {wizardStep === 'created' && createdKeyToken && (
                                <div className="space-y-4">
                                    <div className="text-center py-2">
                                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 mx-auto mb-3 flex items-center justify-center">
                                            <Check className="w-6 h-6 text-emerald-500" />
                                        </div>
                                        <h3 className={cn("text-lg font-semibold", isDark ? "text-white" : "text-black")}>API Key Created!</h3>
                                        <p className={cn("text-sm mt-1", isDark ? "text-white/60" : "text-gray-500")}>
                                            Copy your key now. You won't be able to see it again.
                                        </p>
                                    </div>

                                    <div className={cn(
                                        "p-4 rounded-lg border",
                                        isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"
                                    )}>
                                        <div className="flex items-center gap-2">
                                            <code className={cn(
                                                "flex-1 text-sm font-mono break-all",
                                                isDark ? "text-white" : "text-black"
                                            )}>
                                                {createdKeyToken}
                                            </code>
                                            <button
                                                onClick={() => copyToClipboard(createdKeyToken, 'new')}
                                                className={cn(
                                                    "p-2 rounded-lg transition-colors flex-shrink-0",
                                                    copiedId === 'new'
                                                        ? "bg-emerald-500/20 text-emerald-500"
                                                        : (isDark ? "bg-white/10 hover:bg-white/20 text-white" : "bg-gray-200 hover:bg-gray-300 text-black")
                                                )}
                                            >
                                                {copiedId === 'new' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className={cn(
                                        "p-3 rounded-lg flex items-start gap-3",
                                        isDark ? "bg-rose-500/10" : "bg-rose-50"
                                    )}>
                                        <AlertTriangle className={cn("w-4 h-4 mt-0.5", isDark ? "text-rose-400" : "text-rose-500")} />
                                        <p className={cn("text-xs", isDark ? "text-rose-400/80" : "text-rose-600")}>
                                            This is the only time you'll see this key. Store it securely!
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className={cn(
                            "px-6 py-4 border-t flex gap-3",
                            isDark ? "border-white/10" : "border-black/10"
                        )}>
                            {wizardStep === 'created' ? (
                                <button
                                    onClick={closeCreateModal}
                                    className={cn(
                                        "flex-1 py-3 rounded-lg text-sm font-medium transition-colors",
                                        isDark ? "bg-white text-black hover:bg-white/90" : "bg-black text-white hover:bg-black/90"
                                    )}
                                >
                                    Done
                                </button>
                            ) : (
                                <>
                                    {wizardStep !== 'name' && (
                                        <button
                                            onClick={prevStep}
                                            className={cn(
                                                "flex-1 py-3 rounded-lg text-sm font-medium border transition-colors flex items-center justify-center gap-2",
                                                isDark ? "border-white/10 text-white hover:bg-white/5" : "border-gray-200 text-black hover:bg-gray-50"
                                            )}
                                        >
                                            <ArrowLeft className="w-4 h-4" />
                                            Back
                                        </button>
                                    )}
                                    <button
                                        onClick={nextStep}
                                        disabled={!canProceed()}
                                        className={cn(
                                            "flex-1 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2",
                                            canProceed()
                                                ? (isDark ? "bg-white text-black hover:bg-white/90" : "bg-black text-white hover:bg-black/90")
                                                : (isDark ? "bg-white/10 text-white/30 cursor-not-allowed" : "bg-gray-100 text-gray-400 cursor-not-allowed")
                                        )}
                                    >
                                        {wizardStep === 'confirm' ? 'Create Key' : 'Continue'}
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
