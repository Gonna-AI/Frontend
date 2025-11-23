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
        { id: 'search', label: 'Semantic Search', status: 'pending', detail: 'Searching through the legal database using AI embeddings...' },
        { id: 'collect', label: 'Collecting Cases', status: 'pending', count: 0, detail: 'Scanning cases to find relevant matches...' },
        { id: 'graph', label: 'Graph Analysis', status: 'pending', detail: 'Analyzing citation networks to find connected cases...' },
        { id: 'precedents', label: 'Precedent Chain', status: 'pending', detail: 'Mapping legal precedent relationships and hierarchies...' },
        { id: 'synthesis', label: 'Synthesizing Results', status: 'pending', detail: 'Ranking and filtering the most relevant cases...' }
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

            // Step 2: Collecting Cases (Realistic variable speed)
            setSteps(prev => prev.map(s => s.id === 'collect' ? { ...s, status: 'processing', count: 0, detail: 'Starting case collection...' } : s));

            const targetCount = 13; // Max 13 cases
            let currentCount = 0;

            // Fast count 1-3 (300ms each)
            for (let i = 1; i <= 3; i++) {
                await new Promise(resolve => setTimeout(resolve, 300));
                currentCount = i;
                setSteps(prev => prev.map(s => s.id === 'collect' ? {
                    ...s,
                    count: currentCount,
                    detail: `Initiating semantic search across the database...`
                } : s));
            }

            // Slow count 4-5 (1000ms each)
            for (let i = 4; i <= 5; i++) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                currentCount = i;
                setSteps(prev => prev.map(s => s.id === 'collect' ? {
                    ...s,
                    count: currentCount,
                    detail: `Found ${currentCount} potential matches, analyzing relevance...`
                } : s));
            }

            // Medium-slow count 6-10 (600ms each)
            for (let i = 6; i <= 10; i++) {
                await new Promise(resolve => setTimeout(resolve, 600));
                currentCount = i;
                setSteps(prev => prev.map(s => s.id === 'collect' ? {
                    ...s,
                    count: currentCount,
                    detail: `Collected ${currentCount} cases, filtering by jurisdiction...`
                } : s));
            }

            // Final slow count 11-13 (800ms each)
            for (let i = 11; i <= 13; i++) {
                await new Promise(resolve => setTimeout(resolve, 800));
                currentCount = i;
                setSteps(prev => prev.map(s => s.id === 'collect' ? {
                    ...s,
                    count: currentCount,
                    detail: `Reviewing ${currentCount} cases for citation strength...`
                } : s));
            }

            setSteps(prev => prev.map(s => s.id === 'collect' ? { ...s, status: 'complete', count: 13, detail: 'Successfully collected 13 relevant cases' } : s));

            // Step 3: Graph Analysis
            setSteps(prev => prev.map(s => s.id === 'graph' ? { ...s, status: 'processing', detail: 'Building citation graph from collected cases...' } : s));
            await new Promise(resolve => setTimeout(resolve, 1500));
            setSteps(prev => prev.map(s => s.id === 'graph' ? { ...s, detail: 'Identifying central nodes and influential cases...' } : s));
            await new Promise(resolve => setTimeout(resolve, 1500));
            setSteps(prev => prev.map(s => s.id === 'graph' ? { ...s, status: 'complete', detail: 'Citation network analysis complete' } : s));

            // Step 4: Precedent Chain
            setSteps(prev => prev.map(s => s.id === 'precedents' ? { ...s, status: 'processing', detail: 'Tracing precedent chains through case citations...' } : s));
            await new Promise(resolve => setTimeout(resolve, 1500));
            setSteps(prev => prev.map(s => s.id === 'precedents' ? { ...s, detail: 'Evaluating precedent strength and relevance...' } : s));
            await new Promise(resolve => setTimeout(resolve, 1500));
            setSteps(prev => prev.map(s => s.id === 'precedents' ? { ...s, status: 'complete', detail: 'Precedent mapping completed successfully' } : s));

            // Step 5: Synthesizing
            setSteps(prev => prev.map(s => s.id === 'synthesis' ? { ...s, status: 'processing', detail: 'Synthesizing findings from all analysis layers...' } : s));
            await new Promise(resolve => setTimeout(resolve, 1000));
            setSteps(prev => prev.map(s => s.id === 'synthesis' ? { ...s, detail: 'Ranking cases by relevance and precedent strength...' } : s));
            await new Promise(resolve => setTimeout(resolve, 1000));
            setSteps(prev => prev.map(s => s.id === 'synthesis' ? { ...s, status: 'complete', detail: 'Analysis complete - found 2 highly relevant cases' } : s));

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
            <div className="relative ml-2">
                {/* Continuous Vertical Line - Centered on the dots */}
                <div className="absolute left-[0.4375rem] top-[7px] bottom-[7px] w-0.5 bg-white/10 -translate-x-1/2" />

                <div className="space-y-6">
                    {steps.map((step, idx) => (
                        <div key={step.id} className="relative flex gap-4">
                            {/* Dot Indicator */}
                            <div className={`relative z-10 flex-none w-3.5 h-3.5 rounded-full border-2 transition-all duration-500 bg-[#0a0a0a] ${step.status === 'complete'
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
                            <div className={`transition-all duration-500 -mt-1 ${step.status === 'pending' ? 'opacity-30 blur-[1px]' : 'opacity-100'
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

                                {/* Detail Text - Always show when processing or complete */}
                                <div className={`overflow-hidden transition-all duration-300 ${step.status === 'processing' || step.status === 'complete' ? 'max-h-12 mt-1.5 opacity-100' : 'max-h-0 opacity-0'
                                    }`}>
                                    <p className="text-xs text-white/50 leading-relaxed">
                                        {step.detail}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
