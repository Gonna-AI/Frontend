import { useState } from 'react';
import { Bot, Workflow, Database, Calendar, FileText, Zap, Scale, Scroll, Gavel, Shield, Search, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type ProductType = 'arbor' | 'juris';

export default function ProductsSection() {
    const [activeProduct, setActiveProduct] = useState<ProductType>('arbor');

    return (
        <div className="relative py-24 px-4 sm:px-6 bg-transparent overflow-hidden">
            {/* Background Gradients - Dynamic based on active product */}
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

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Product Toggle Pill */}
                <div className="flex justify-center mb-16">
                    <div className="p-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm inline-flex relative">
                        {/* Sliding Background */}
                        <motion.div
                            className={`absolute top-1.5 bottom-1.5 left-1.5 w-32 rounded-full ${activeProduct === 'arbor' ? 'bg-emerald-500/20' : 'bg-indigo-500/20'
                                }`}
                            initial={false}
                            animate={{
                                x: activeProduct === 'arbor' ? 0 : '100%'
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />

                        <button
                            onClick={() => setActiveProduct('arbor')}
                            className={`relative w-32 py-2.5 rounded-full text-sm font-medium transition-colors duration-300 z-10 ${activeProduct === 'arbor' ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'text-white/60 hover:text-white/80'
                                }`}
                        >
                            Arbor
                        </button>
                        <button
                            onClick={() => setActiveProduct('juris')}
                            className={`relative w-32 py-2.5 rounded-full text-sm font-medium transition-colors duration-300 z-10 ${activeProduct === 'juris' ? 'text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]' : 'text-white/60 hover:text-white/80'
                                }`}
                        >
                            Juris
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <AnimatePresence mode="wait">
                    {activeProduct === 'arbor' ? (
                        <motion.div
                            key="arbor"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Arbor Content */}
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
                                <div className="group relative overflow-hidden rounded-[2.5rem] bg-gradient-to-b from-white/[0.05] to-transparent p-10 ring-1 ring-white/5 transition-all duration-500 hover:scale-[1.01] hover:from-white/[0.08] hover:ring-white/10 hover:shadow-2xl hover:shadow-emerald-500/10">
                                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10">
                                                <Database className="w-6 h-6 text-emerald-400" />
                                            </div>
                                            <h3 className="text-2xl font-semibold text-white">Intelligent Operations Agent</h3>
                                        </div>
                                        <p className="text-lg text-white/60 leading-relaxed mb-8">
                                            Built on LangChain, Arbor integrates seamlessly with your existing ecosystem. It combines the power of DeepSeek-7B RAG with MiniLM semantic search to turn your Google Drive into an interactive knowledge base.
                                        </p>
                                        <ul className="space-y-4">
                                            <li className="flex items-start gap-3 text-white/60">
                                                <FileText className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                                                <span>Google Drive knowledge integration</span>
                                            </li>
                                            <li className="flex items-start gap-3 text-white/60">
                                                <Zap className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                                                <span>DeepSeek-7B RAG & MiniLM search</span>
                                            </li>
                                            <li className="flex items-start gap-3 text-white/60">
                                                <Calendar className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                                                <span>Calendar-powered scheduling & briefs</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="group relative overflow-hidden rounded-[2.5rem] bg-gradient-to-b from-white/[0.05] to-transparent p-10 ring-1 ring-white/5 transition-all duration-500 hover:scale-[1.01] hover:from-white/[0.08] hover:ring-white/10 hover:shadow-2xl hover:shadow-teal-500/10">
                                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10">
                                                <Workflow className="w-6 h-6 text-teal-400" />
                                            </div>
                                            <h3 className="text-2xl font-semibold text-white">Enterprise Automation</h3>
                                        </div>
                                        <p className="text-lg text-white/60 leading-relaxed mb-8">
                                            Engineered for scale, Arbor handles the heavy lifting of enterprise operations. From document ingestion to workflow orchestration, it creates a unified business intelligence layer.
                                        </p>
                                        <ul className="space-y-4">
                                            <li className="flex items-start gap-3 text-white/60">
                                                <Bot className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                                                <span>Bilingual QA & Async pipelines</span>
                                            </li>
                                            <li className="flex items-start gap-3 text-white/60">
                                                <FileText className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                                                <span>Document ingestion & Vector indexing</span>
                                            </li>
                                            <li className="flex items-start gap-3 text-white/60">
                                                <Workflow className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                                                <span>Email automation & Orchestration</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="juris"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Juris Content */}
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
                                <div className="group relative overflow-hidden rounded-[2.5rem] bg-gradient-to-b from-white/[0.05] to-transparent p-10 ring-1 ring-white/5 transition-all duration-500 hover:scale-[1.01] hover:from-white/[0.08] hover:ring-white/10 hover:shadow-2xl hover:shadow-indigo-500/10">
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10">
                                                <Scale className="w-6 h-6 text-indigo-400" />
                                            </div>
                                            <h3 className="text-2xl font-semibold text-white">Legal Analysis Engine</h3>
                                        </div>
                                        <p className="text-lg text-white/60 leading-relaxed mb-8">
                                            Accelerate contract review and due diligence with our advanced legal analysis engine. Identify risks, extract key terms, and ensure compliance in seconds, not hours.
                                        </p>
                                        <ul className="space-y-4">
                                            <li className="flex items-start gap-3 text-white/60">
                                                <Search className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                                                <span>Automated contract review & risk detection</span>
                                            </li>
                                            <li className="flex items-start gap-3 text-white/60">
                                                <Shield className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                                                <span>Compliance monitoring & alerts</span>
                                            </li>
                                            <li className="flex items-start gap-3 text-white/60">
                                                <FileText className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                                                <span>Key term extraction & summarization</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="group relative overflow-hidden rounded-[2.5rem] bg-gradient-to-b from-white/[0.05] to-transparent p-10 ring-1 ring-white/5 transition-all duration-500 hover:scale-[1.01] hover:from-white/[0.08] hover:ring-white/10 hover:shadow-2xl hover:shadow-violet-500/10">
                                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10">
                                                <Gavel className="w-6 h-6 text-violet-400" />
                                            </div>
                                            <h3 className="text-2xl font-semibold text-white">Case Law Research</h3>
                                        </div>
                                        <p className="text-lg text-white/60 leading-relaxed mb-8">
                                            Navigate complex case law with confidence. Our semantic search engine understands legal concepts, helping you find relevant precedents and build stronger arguments faster.
                                        </p>
                                        <ul className="space-y-4">
                                            <li className="flex items-start gap-3 text-white/60">
                                                <Brain className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
                                                <span>Semantic case law search</span>
                                            </li>
                                            <li className="flex items-start gap-3 text-white/60">
                                                <Scroll className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
                                                <span>Automated legal drafting assistance</span>
                                            </li>
                                            <li className="flex items-start gap-3 text-white/60">
                                                <Database className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
                                                <span>Citation checking & validation</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
