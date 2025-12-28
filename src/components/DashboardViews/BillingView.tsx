import React from 'react';
import { cn } from '../../utils/cn';
import { RotateCcw } from 'lucide-react';

export default function BillingView({ isDark = true }: { isDark?: boolean }) {
    const pricing = [
        { item: 'Voice Call', cost: '5 credits per minute' },
        { item: 'LLM Processing (Input)', cost: '0.1 credits per 1k tokens' },
        { item: 'LLM Processing (Output)', cost: '0.2 credits per 1k tokens' },
        { item: 'Knowledge Base Query', cost: '1 credit per search' },
        { item: 'Text Message', cost: '0.5 credits per message' },
    ];

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-10">
            <div className="flex items-center gap-2">
                <h1 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-black")}>Billing</h1>
                <RotateCcw className={cn("w-4 h-4 cursor-pointer hover:rotate-180 transition-transform", isDark ? "text-white/40" : "text-black/40")} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Balance Card */}
                <div className={cn(
                    "p-8 rounded-xl border flex flex-col justify-between min-h-[250px]",
                    isDark ? "bg-black/40 border-white/10" : "bg-white border-black/10"
                )}>
                    <div>
                        <h3 className={cn("text-base font-medium", isDark ? "text-white/80" : "text-black/80")}>Remaining Balance</h3>
                        <div className="flex items-baseline gap-2 mt-4">
                            <span className={cn("text-6xl font-bold", isDark ? "text-white" : "text-black")}>50</span>
                            <span className={cn("text-xl font-medium", isDark ? "text-white/40" : "text-black/40")}>Credits</span>
                        </div>
                    </div>

                    <div className="flex justify-end mt-8">
                        <button className={cn(
                            "px-4 py-2 rounded-lg font-medium text-sm transition-colors",
                            isDark ? "bg-white text-black hover:bg-white/90" : "bg-black text-white hover:bg-black/90"
                        )}>
                            Top up balance
                        </button>
                    </div>
                </div>

                {/* API Access Card */}
                <div className={cn(
                    "p-8 rounded-xl border flex flex-col min-h-[250px]",
                    isDark ? "bg-black/40 border-white/10" : "bg-white border-black/10"
                )}>
                    <h3 className={cn("text-base font-medium", isDark ? "text-white" : "text-black")}>API Access</h3>
                    <p className={cn("text-sm mt-1 mb-6", isDark ? "text-white/40" : "text-black/40")}>
                        Your API keys will be disabled when your balance reaches 0 credits.
                    </p>

                    <div className="space-y-4">
                        {pricing.map((p, i) => (
                            <div key={i} className={cn(
                                "flex items-center justify-between py-3 border-b border-dashed last:border-0",
                                isDark ? "border-white/10" : "border-black/10"
                            )}>
                                <span className={cn("text-sm font-medium", isDark ? "text-white/80" : "text-black/80")}>{p.item}</span>
                                <span className={cn("text-sm", isDark ? "text-white/60" : "text-black/60")}>{p.cost}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
