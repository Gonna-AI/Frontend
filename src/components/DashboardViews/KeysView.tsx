import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import { RotateCcw, Plus, Copy, Trash2, Eye, EyeOff } from 'lucide-react';

export default function KeysView({ isDark = true }: { isDark?: boolean }) {
    const [keys, setKeys] = useState<any[]>([]); // Mock state

    const createKey = () => {
        const newKey = {
            id: 'sk_live_' + Math.random().toString(36).substr(2, 9),
            name: 'My API Key ' + (keys.length + 1),
            token: 'sk_live_' + Math.random().toString(36).substr(2, 24),
            created: new Date().toLocaleDateString(),
            lastUsed: 'Never'
        };
        setKeys([...keys, newKey]);
    };

    const deleteKey = (id: string) => {
        setKeys(keys.filter(k => k.id !== id));
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-10">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <h1 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-black")}>Keys</h1>
                        <RotateCcw className={cn("w-4 h-4 cursor-pointer hover:rotate-180 transition-transform", isDark ? "text-white/40" : "text-black/40")} />
                    </div>
                    <p className={cn("text-sm", isDark ? "text-white/60" : "text-black/60")}>Manage your API keys and access tokens</p>
                </div>

                <div className="flex items-center gap-2">
                    <span className={cn("text-sm mr-2", isDark ? "text-white/40" : "text-black/40")}>Docs</span>
                </div>
            </div>

            <div>
                <button
                    onClick={createKey}
                    className={cn(
                        "px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors",
                        isDark ? "bg-white text-black hover:bg-white/90" : "bg-black text-white hover:bg-black/90"
                    )}>
                    <Plus className="w-4 h-4" />
                    Create new key
                </button>
            </div>

            {/* List / Empty State */}
            <div className={cn(
                "min-h-[400px] flex flex-col rounded-xl border",
                keys.length === 0 ? "items-center justify-center border-dashed" : "border-solid",
                isDark ? "bg-black/20 border-white/10" : "bg-white/50 border-black/10"
            )}>
                {keys.length === 0 ? (
                    <div className="text-center">
                        <p className={cn("text-sm font-medium", isDark ? "text-white/60" : "text-black/60")}>No API keys found. Create your first key to get started.</p>
                    </div>
                ) : (
                    <div className="w-full">
                        <div className={cn(
                            "grid grid-cols-4 px-6 py-3 border-b text-xs font-medium uppercase tracking-wider",
                            isDark ? "border-white/10 text-white/40" : "border-black/10 text-black/40"
                        )}>
                            <div>Name</div>
                            <div>Key</div>
                            <div>Created</div>
                            <div className="text-right">Actions</div>
                        </div>
                        {keys.map((key) => (
                            <div key={key.id} className={cn(
                                "grid grid-cols-4 px-6 py-4 border-b last:border-0 items-center hover:bg-white/5 transition-colors",
                                isDark ? "border-white/5" : "border-black/5"
                            )}>
                                <div className={cn("font-medium", isDark ? "text-white" : "text-black")}>{key.name}</div>
                                <div className={cn("font-mono text-xs", isDark ? "text-white/60" : "text-black/60")}>
                                    {key.token.substr(0, 8)}...{key.token.substr(-4)}
                                </div>
                                <div className={cn("text-sm", isDark ? "text-white/60" : "text-black/60")}>{key.created}</div>
                                <div className="flex justify-end gap-2">
                                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors group">
                                        <Copy className="w-4 h-4 text-white/40 group-hover:text-white" />
                                    </button>
                                    <button
                                        onClick={() => deleteKey(key.id)}
                                        className="p-2 hover:bg-red-500/10 rounded-lg transition-colors group"
                                    >
                                        <Trash2 className="w-4 h-4 text-white/40 group-hover:text-red-400" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
