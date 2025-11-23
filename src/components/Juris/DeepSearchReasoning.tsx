import { useState, useEffect } from 'react';
import { CheckCircle2, Loader2, Circle } from 'lucide-react';

interface ReasoningStep {
    id: string;
    label: string;
    status: 'pending' | 'processing' | 'complete';
    detail?: string;
    count?: number;
}

interface DeepSearchReasoningProps {
    query: string;
    onComplete: () => void;
}

export default function DeepSearchReasoning({ query, onComplete }: DeepSearchReasoningProps) {
    const [steps, setSteps] = useState<ReasoningStep[]>([
        { id: 'search', label: 'Semantic Search', status: 'pending', detail: 'Finding relevant cases' },
        { id: 'collect', label: 'Collecting Cases', status: 'pending', count: 0 },
        { id: 'graph', label: 'Graph Analysis', status: 'pending', detail: 'Analyzing citation networks' },
        { id: 'precedents', label: 'Precedent Chain', status: 'pending', detail: 'Mapping legal precedents' },
        { id: 'synthesis', label: 'Synthesizing', status: 'pending', detail: 'Found 2 relevant cases' }
    ]);
    const [elapsedTime, setElapsedTime] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setElapsedTime(prev => prev + 0.1);
        }, 100);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const processSteps = async () => {
            // Random delays between 2-5 seconds per step
            const getRandomDelay = () => Math.floor(Math.random() * 3000) + 2000;

            // Step 1: Semantic Search
            setSteps(prev => prev.map(s => s.id === 'search' ? { ...s, status: 'processing' } : s));
            await new Promise(resolve => setTimeout(resolve, getRandomDelay()));
            setSteps(prev => prev.map(s => s.id === 'search' ? { ...s, status: 'complete' } : s));

            // Step 2: Collecting Cases (Slow increase)
            setSteps(prev => prev.map(s => s.id === 'collect' ? { ...s, status: 'processing', count: 0 } : s));

            const targetCount = 150; // Search through many cases
            const duration = 5000; // Take 5 seconds
            const interval = 100;
            const steps_count = duration / interval;

            for (let i = 0; i <= steps_count; i++) {
                await new Promise(resolve => setTimeout(resolve, interval));
                setSteps(prev => prev.map(s => {
                    if (s.id === 'collect') {
                        // Logarithmic-like increase that slows down
                        const progress = i / steps_count;
                        const currentCount = Math.floor(targetCount * progress);
                        return { ...s, count: currentCount };
                    }
                    return s;
                }));
            }
            setSteps(prev => prev.map(s => s.id === 'collect' ? { ...s, status: 'complete', count: 150 } : s));

            // Step 3: Graph Analysis
            setSteps(prev => prev.map(s => s.id === 'graph' ? { ...s, status: 'processing' } : s));
            await new Promise(resolve => setTimeout(resolve, getRandomDelay()));
            setSteps(prev => prev.map(s => s.id === 'graph' ? { ...s, status: 'complete' } : s));

            // Step 4: Precedent Chain
            setSteps(prev => prev.map(s => s.id === 'precedents' ? { ...s, status: 'processing' } : s));
            await new Promise(resolve => setTimeout(resolve, getRandomDelay()));
            setSteps(prev => prev.map(s => s.id === 'precedents' ? { ...s, status: 'complete' } : s));

            // Step 5: Synthesizing
            setSteps(prev => prev.map(s => s.id === 'synthesis' ? { ...s, status: 'processing' } : s));
            await new Promise(resolve => setTimeout(resolve, 2000));
            setSteps(prev => prev.map(s => s.id === 'synthesis' ? { ...s, status: 'complete' } : s));

            // Complete
            await new Promise(resolve => setTimeout(resolve, 500));
            onComplete();
        };

        processSteps();
    }, [query, onComplete]);

    return (
        <div className="my-2 px-4 max-w-2xl ml-auto">
            {/* Timer Header */}
            <div className="flex items-center justify-end gap-3 mb-4 opacity-70">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
                    <span className="text-xs text-violet-300 font-medium uppercase tracking-wide">Deep Search</span>
                </div>
                <div className="text-xs text-white/40 font-mono tabular-nums">
                    {elapsedTime.toFixed(1)}s
                </div>
            </div>

            {/* Vertical Timeline */}
            <div className="relative border-l border-white/10 ml-3 pl-6 space-y-6">
                {steps.map((step, idx) => (
                    <div key={step.id} className="relative group">
                        {/* Dot Indicator */}
                        <div className={`absolute -left-[1.6rem] top-0.5 w-3.5 h-3.5 rounded-full border-2 transition-all duration-500 z-10 bg-[#0a0a0a] ${step.status === 'complete'
                                ? 'border-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]'
                                : step.status === 'processing'
                                    ? 'border-violet-400/50 animate-pulse'
                                    : 'border-white/10'
                            }`}>
                            {step.status === 'complete' && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 bg-violet-500 rounded-full" />
                                </div>
                            )}
                            {step.status === 'processing' && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-ping opacity-75" />
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className={`transition-all duration-500 ${step.status === 'pending' ? 'opacity-30 blur-[1px]' : 'opacity-100'
                            }`}>
                            <div className="flex items-center gap-3">
                                <span className={`text-sm font-medium ${step.status === 'processing' ? 'text-violet-300' : 'text-white/80'
                                    }`}>
                                    {step.label}
                                </span>
                                {step.count !== undefined && step.status !== 'pending' && (
                                    <span className="text-xs font-mono text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded">
                                        {step.count}
                                    </span>
                                )}
                            </div>

                            {/* Detail Text */}
                            <div className={`overflow-hidden transition-all duration-500 ${step.status === 'processing' || step.status === 'complete' ? 'max-h-8 mt-1 opacity-100' : 'max-h-0 opacity-0'
                                }`}>
                                <p className="text-xs text-white/50">
                                    {step.status === 'complete' && step.id === 'synthesis'
                                        ? 'Found 2 relevant cases'
                                        : step.detail}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
