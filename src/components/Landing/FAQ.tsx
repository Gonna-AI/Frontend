import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-white/10">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between py-6 text-left"
            >
                <span className="text-lg font-medium text-white/90 font-urbanist">{question}</span>
                <ChevronDown
                    className={`h-5 w-5 text-white/50 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <p className="pb-6 text-white/60 leading-relaxed font-light text-base">
                            {answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const FAQ = () => {
    const { t } = useLanguage();

    const faqs = [
        { q: t('faq.q1'), a: t('faq.a1') },
        { q: t('faq.q2'), a: t('faq.a2') },
        { q: t('faq.q3'), a: t('faq.a3') },
        { q: t('faq.q4'), a: t('faq.a4') },
    ];

    return (
        <section className="py-24 relative overflow-hidden bg-[rgb(10,10,10)] z-20">
            <div className="max-w-[90%] md:max-w-4xl mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 font-urbanist tracking-tight">
                        <span className="text-white">{t('faq.title1')}</span>{' '}
                        <span className="bg-gradient-to-r from-white via-white/95 to-white/90 text-transparent bg-clip-text">
                            {t('faq.title2')}
                        </span>
                    </h2>
                    <p className="text-white/60 font-light text-lg">
                        {t('faq.cantFind')} <a href="mailto:team@clerktree.com" className="text-white hover:underline">{t('faq.contactPage')}</a>
                    </p>
                </motion.div>

                <div className="space-y-2">
                    {faqs.map((faq, index) => (
                        <FAQItem key={index} question={faq.q} answer={faq.a} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQ;
