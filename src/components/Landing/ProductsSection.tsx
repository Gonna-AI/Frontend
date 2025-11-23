import { useState, useMemo, useCallback, memo } from 'react';
import { Bot, Workflow, Database, Calendar, FileText, Zap, Scale, Scroll, Gavel, Shield, Search, Brain, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useDeviceDetection } from '../../hooks/useDeviceDetection';
import { Link } from 'react-router-dom';

type ProductType = 'arbor' | 'juris';

// Memoized card component to prevent unnecessary re-renders
const ProductCard = memo(({
    icon: Icon,
    title,
    description,
    features,
    colorClass,
    iconColor,
    hoverColor,
    isLowEnd
}: {
    icon: React.ElementType;
    title: string;
    description: string;
    features: Array<{ icon: React.ElementType; text: string }>;
    colorClass: string;
    iconColor: string;
    hoverColor: string;
    isLowEnd: boolean;
}) => {
    const hoverClasses = isLowEnd
        ? 'hover:ring-white/10'
        : 'hover:scale-[1.01] hover:from-white/[0.08] hover:ring-white/10 hover:shadow-2xl';

    return (
        <div
            className={`group relative overflow-hidden rounded-[2.5rem] bg-gradient-to-b from-white/[0.05] to-transparent p-10 ring-1 ring-white/5 transition-all duration-300 ${hoverClasses} ${hoverColor}`}
            style={{ willChange: isLowEnd ? 'auto' : 'transform' }}
        >
            {!isLowEnd && (
                <div className={`absolute inset-0 bg-gradient-to-br ${colorClass} via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
            )}
            <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${colorClass}`}>
                        <Icon className={`w-6 h-6 ${iconColor}`} />
                    </div>
                    <h3 className="text-2xl font-semibold text-white">{title}</h3>
                </div>
                <p className="text-lg text-white/60 leading-relaxed mb-8">{description}</p>
                <ul className="space-y-4">
                    {features.map((feature, idx) => {
                        const FeatureIcon = feature.icon;
                        return (
                            <li key={idx} className="flex items-start gap-3 text-white/60">
                                <FeatureIcon className={`w-5 h-5 ${iconColor} shrink-0 mt-0.5`} />
                                <span>{feature.text}</span>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
});

ProductCard.displayName = 'ProductCard';

// Memoized content sections
const ArborContent = memo(({ isLowEnd, prefersReducedMotion }: { isLowEnd: boolean; prefersReducedMotion: boolean }) => {
    const animationConfig = useMemo(() => ({
        initial: prefersReducedMotion || isLowEnd ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: prefersReducedMotion || isLowEnd ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 },
        transition: { duration: prefersReducedMotion || isLowEnd ? 0 : 0.2 }
    }), [isLowEnd, prefersReducedMotion]);

    return (
        <motion.div key="arbor" {...animationConfig}>
            <div className="text-center mb-16">
                <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                    <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-600 text-transparent bg-clip-text">
                        Arbor
                    </span>
                </h2>
                <p className="text-lg text-white/60 max-w-2xl mx-auto">
                    The next generation AI operations agent that unifies your business intelligence.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <ProductCard
                    icon={Database}
                    title="Intelligent Operations Agent"
                    description="Built on LangChain, Arbor integrates seamlessly with your existing ecosystem. It combines the power of DeepSeek-7B RAG with MiniLM semantic search to turn your Google Drive into an interactive knowledge base."
                    features={[
                        { icon: FileText, text: 'Google Drive knowledge integration' },
                        { icon: Zap, text: 'DeepSeek-7B RAG & MiniLM search' },
                        { icon: Calendar, text: 'Calendar-powered scheduling & briefs' }
                    ]}
                    colorClass="bg-emerald-500/10"
                    iconColor="text-emerald-400"
                    hoverColor="hover:shadow-emerald-500/10"
                    isLowEnd={isLowEnd}
                />
                <ProductCard
                    icon={Workflow}
                    title="Enterprise Automation"
                    description="Engineered for scale, Arbor handles the heavy lifting of enterprise operations. From document ingestion to workflow orchestration, it creates a unified business intelligence layer."
                    features={[
                        { icon: Bot, text: 'Bilingual QA & Async pipelines' },
                        { icon: FileText, text: 'Document ingestion & Vector indexing' },
                        { icon: Workflow, text: 'Email automation & Orchestration' }
                    ]}
                    colorClass="bg-teal-500/10"
                    iconColor="text-teal-400"
                    hoverColor="hover:shadow-teal-500/10"
                    isLowEnd={isLowEnd}
                />
            </div>

            {/* Try Arbor Button */}
            <div className="flex justify-center mt-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <Link
                        to="/arbor"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-900/40 hover:bg-emerald-800/50 backdrop-blur-md border border-emerald-600/30 hover:border-emerald-500/50 text-emerald-100 font-medium rounded-2xl transition-all duration-300 hover:shadow-lg hover:shadow-emerald-900/30 group"
                    >
                        <span>Try Arbor</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </motion.div>
            </div>
        </motion.div>
    );
});

ArborContent.displayName = 'ArborContent';

const JurisContent = memo(({ isLowEnd, prefersReducedMotion }: { isLowEnd: boolean; prefersReducedMotion: boolean }) => {
    const animationConfig = useMemo(() => ({
        initial: prefersReducedMotion || isLowEnd ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: prefersReducedMotion || isLowEnd ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 },
        transition: { duration: prefersReducedMotion || isLowEnd ? 0 : 0.2 }
    }), [isLowEnd, prefersReducedMotion]);

    return (
        <motion.div key="juris" {...animationConfig}>
            <div className="text-center mb-16">
                <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                    <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-600 text-transparent bg-clip-text">
                        Juris
                    </span>
                </h2>
                <p className="text-lg text-white/60 max-w-2xl mx-auto">
                    The Future of Legal Intelligence. Automated analysis, research, and drafting for modern legal teams.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <ProductCard
                    icon={Scale}
                    title="Legal Analysis Engine"
                    description="Accelerate contract review and due diligence with our advanced legal analysis engine. Identify risks, extract key terms, and ensure compliance in seconds, not hours."
                    features={[
                        { icon: Search, text: 'Automated contract review & risk detection' },
                        { icon: Shield, text: 'Compliance monitoring & alerts' },
                        { icon: FileText, text: 'Key term extraction & summarization' }
                    ]}
                    colorClass="bg-indigo-500/10"
                    iconColor="text-indigo-400"
                    hoverColor="hover:shadow-indigo-500/10"
                    isLowEnd={isLowEnd}
                />
                <ProductCard
                    icon={Gavel}
                    title="Case Law Research"
                    description="Navigate complex case law with confidence. Our semantic search engine understands legal concepts, helping you find relevant precedents and build stronger arguments faster."
                    features={[
                        { icon: Brain, text: 'Semantic case law search' },
                        { icon: Scroll, text: 'Automated legal drafting assistance' },
                        { icon: Database, text: 'Citation checking & validation' }
                    ]}
                    colorClass="bg-violet-500/10"
                    iconColor="text-violet-400"
                    hoverColor="hover:shadow-violet-500/10"
                    isLowEnd={isLowEnd}
                />
            </div>
        </motion.div>
    );
});

JurisContent.displayName = 'JurisContent';

export default function ProductsSection() {
    const [activeProduct, setActiveProduct] = useState<ProductType>('arbor');
    const { isLowEnd } = useDeviceDetection();
    const prefersReducedMotion = useReducedMotion();

    // Debounce toggle to prevent rapid clicking issues
    const handleToggle = useCallback((product: ProductType) => {
        if (activeProduct === product) return;
        setActiveProduct(product);
    }, [activeProduct]);

    // Memoize background gradient styles
    const backgroundGradients = useMemo(() => {
        if (isLowEnd) {
            // Simplified gradients for low-end devices
            return (
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        maskImage: 'linear-gradient(to bottom, transparent, black 25%, black 75%, transparent)',
                        WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 25%, black 75%, transparent)'
                    }}
                >
                    <div
                        className={`absolute top-0 left-1/4 w-96 h-96 transition-opacity duration-500 ${activeProduct === 'arbor' ? 'opacity-100' : 'opacity-0'}`}
                        style={{ background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)' }}
                    />
                    <div
                        className={`absolute top-0 left-1/4 w-96 h-96 transition-opacity duration-500 ${activeProduct === 'juris' ? 'opacity-100' : 'opacity-0'}`}
                        style={{ background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)' }}
                    />
                </div>
            );
        }

        // Full gradients for high-end devices
        return (
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    maskImage: 'linear-gradient(to bottom, transparent, black 25%, black 75%, transparent)',
                    WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 25%, black 75%, transparent)'
                }}
            >
                <div
                    className={`absolute top-0 left-1/4 w-96 h-96 transition-opacity duration-700 ${activeProduct === 'arbor' ? 'opacity-100' : 'opacity-0'}`}
                    style={{ background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)' }}
                />
                <div
                    className={`absolute top-0 left-1/4 w-96 h-96 transition-opacity duration-700 ${activeProduct === 'juris' ? 'opacity-100' : 'opacity-0'}`}
                    style={{ background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)' }}
                />
                <div
                    className={`absolute bottom-0 right-1/4 w-96 h-96 transition-opacity duration-700 ${activeProduct === 'arbor' ? 'opacity-100' : 'opacity-0'}`}
                    style={{ background: 'radial-gradient(circle, rgba(20, 184, 166, 0.15) 0%, transparent 70%)' }}
                />
                <div
                    className={`absolute bottom-0 right-1/4 w-96 h-96 transition-opacity duration-700 ${activeProduct === 'juris' ? 'opacity-100' : 'opacity-0'}`}
                    style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)' }}
                />
            </div>
        );
    }, [activeProduct, isLowEnd]);

    // Optimize toggle animation based on device
    const toggleAnimation = useMemo(() => {
        if (prefersReducedMotion || isLowEnd) {
            return {
                transition: { duration: 0.2 }
            };
        }
        return {
            transition: { type: "spring", stiffness: 300, damping: 30 }
        };
    }, [prefersReducedMotion, isLowEnd]);

    return (
        <div className="relative py-24 px-4 sm:px-6 bg-transparent overflow-hidden">
            {backgroundGradients}

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Product Toggle Pill */}
                <div className="flex justify-center mb-16">
                    <div className={`p-1.5 rounded-full bg-white/5 border border-white/10 ${isLowEnd ? '' : 'backdrop-blur-sm'} inline-flex relative`}>
                        {/* Sliding Background */}
                        <motion.div
                            className={`absolute top-1.5 bottom-1.5 left-1.5 w-32 rounded-full ${activeProduct === 'arbor' ? 'bg-emerald-500/20' : 'bg-indigo-500/20'}`}
                            initial={false}
                            animate={{
                                x: activeProduct === 'arbor' ? 0 : '100%'
                            }}
                            {...toggleAnimation}
                            style={{ willChange: isLowEnd ? 'auto' : 'transform' }}
                        />

                        <button
                            onClick={() => handleToggle('arbor')}
                            className={`relative w-32 py-2.5 rounded-full text-sm font-medium transition-colors duration-200 z-10 ${activeProduct === 'arbor' ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'text-white/60 hover:text-white/80'}`}
                            aria-label="Switch to Arbor"
                        >
                            Arbor
                        </button>
                        <button
                            onClick={() => handleToggle('juris')}
                            className={`relative w-32 py-2.5 rounded-full text-sm font-medium transition-colors duration-200 z-10 ${activeProduct === 'juris' ? 'text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]' : 'text-white/60 hover:text-white/80'}`}
                            aria-label="Switch to Juris"
                        >
                            Juris
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <AnimatePresence mode={isLowEnd ? "sync" : "wait"}>
                    {activeProduct === 'arbor' ? (
                        <ArborContent isLowEnd={isLowEnd} prefersReducedMotion={!!prefersReducedMotion} />
                    ) : (
                        <JurisContent isLowEnd={isLowEnd} prefersReducedMotion={!!prefersReducedMotion} />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
