import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export default function FAQ() {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { t } = useLanguage();

  const faqs: FAQItem[] = [
    {
      category: t('faqPage.catGeneral'),
      question: t('faqPage.q1'),
      answer: t('faqPage.a1')
    },
    {
      category: t('faqPage.catGeneral'),
      question: t('faqPage.q2'),
      answer: t('faqPage.a2')
    },
    {
      category: t('faqPage.catProduct'),
      question: t('faqPage.q3'),
      answer: t('faqPage.a3')
    },
    {
      category: t('faqPage.catProduct'),
      question: t('faqPage.q4'),
      answer: t('faqPage.a4')
    },
    {
      category: t('faqPage.catProduct'),
      question: t('faqPage.q5'),
      answer: t('faqPage.a5')
    },
    {
      category: t('faqPage.catPricing'),
      question: t('faqPage.q6'),
      answer: t('faqPage.a6')
    },
    {
      category: t('faqPage.catPricing'),
      question: t('faqPage.q7'),
      answer: t('faqPage.a7')
    },
    {
      category: t('faqPage.catSecurity'),
      question: t('faqPage.q8'),
      answer: t('faqPage.a8')
    },
    {
      category: t('faqPage.catSecurity'),
      question: t('faqPage.q9'),
      answer: t('faqPage.a9')
    },
    {
      category: t('faqPage.catSupport'),
      question: t('faqPage.q10'),
      answer: t('faqPage.a10')
    },
    {
      category: t('faqPage.catSupport'),
      question: t('faqPage.q11'),
      answer: t('faqPage.a11')
    },
    {
      category: t('faqPage.catSupport'),
      question: t('faqPage.q12'),
      answer: t('faqPage.a12')
    }
  ];

  const categories = Array.from(new Set(faqs.map(faq => faq.category)));

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-[rgb(10,10,10)] min-h-screen relative overflow-x-hidden">
      {/* Indigo/Purple theme background accents */}
      <div className="fixed inset-0 bg-[rgb(10,10,10)] -z-10">
        <div
          className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 md:w-[800px] h-96 md:h-[800px] opacity-40"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.6) 0%, rgba(99,102,241,0.25) 40%, transparent 100%)',
            filter: 'blur(80px)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-72 md:w-[600px] h-72 md:h-[600px] opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(79,70,229,0.5) 0%, rgba(79,70,229,0.2) 40%, transparent 100%)',
            filter: 'blur(80px)',
          }}
        />
      </div>

      {/* Glassy Header with Logo */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full py-3 px-4 sm:px-6 backdrop-blur-md bg-[rgb(10,10,10)]/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 group"
            aria-label="Go to home"
          >
            <svg viewBox="0 0 464 468" className="w-9 h-9 md:w-11 md:h-11">
              <path fill="white" d="M275.9 63.5c37.7 5.3 76.6 24.1 103.7 50.2 30 28.8 41.8 57.6 35.8 87.1-6.1 30.1-33.6 52.9-70.6 58.3-6 0.9-18.3 1-44.9 0.6l-36.6-0.7-0.5 17.8c-0.3 9.7-0.4 17.8-0.4 17.9 0.1 0.1 19.1 0.3 42.2 0.4 23.2 0 42.7 0.5 43.5 1 1.2 0.7 1.1 2.2-0.8 9.4-6 23-20.5 42.1-41.8 55-7.3 4.3-26.7 11.9-36 14.1-9 2-34 2-44.5 0-41.3-7.9-74.2-38-82.9-75.7-8.1-35.7 2.2-71.5 27.5-94.7 16.1-14.9 35.5-22.4 63.7-24.7l7.7-0.7v-34.1l-11.7 0.7c-22.2 1.3-37 5.3-56.4 15.2-28.7 14.6-49.7 39.3-59.9 70.2-9.6 29.3-9.3 62.6 0.8 91.4 3.3 9.2 12.2 25.6 18.3 33.8 11.3 14.9 30.6 30.8 48.7 39.9 19.9 10 49.2 15.9 73.2 14.7 26.5-1.3 52.5-9.6 74.2-23.9 26.9-17.6 47.2-47.9 53.3-79.7 1-5.2 2.3-10.1 2.8-10.8 0.8-0.9 6.9-1.2 27.1-1l26.1 0.3 0.3 3.8c1.2 14.6-10.9 52.1-23.9 74-17.8 30-43.2 54-75.9 71.5-20.9 11.2-38.3 16.5-67.2 20.7-27.6 3.9-47.9 3.1-75.8-3.1-36.9-8.3-67.8-25.6-97.1-54.6-23.6-23.2-44.8-61.9-51.7-93.8-5.1-23.7-5.5-28.1-4.9-48.8 1.7-63.2 23.4-111.8 67.7-152 28-25.4 60.4-41.3 99-48.8 18.5-3.6 46.1-4 67.9-0.9zm16.4 92.6c-6.3 2.4-12.8 8.5-15.4 14.5-2.6 6.1-2.6 18.3 0 23.9 5 11 20.2 17.7 32.3 14.1 11.9-3.4 19.8-14.3 19.8-27.1-0.1-19.9-18.2-32.5-36.7-25.4z" />
            </svg>
            <span className="text-xl md:text-2xl font-semibold text-white/90 group-hover:text-white transition-colors">
              ClerkTree
            </span>
          </button>
          <div className="md:hidden">
            <span className="px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium whitespace-nowrap">
              {t('faq.title')}
            </span>
          </div>
        </div>
      </header>

      <div className="relative z-10 py-12 px-6 pt-32 md:pt-36">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-white via-white/95 to-white/90 text-transparent bg-clip-text">
                {t('faqPage.title1')}
              </span>
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-600 text-transparent bg-clip-text">
                {t('faqPage.title2')}
              </span>
            </h1>
            <p className="text-lg md:text-xl text-white/60 leading-relaxed max-w-3xl mx-auto">
              {t('faqPage.subtitle')}
            </p>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category) => (
              <button
                key={category}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:border-indigo-500/30 hover:text-white/90 transition-all duration-300 text-sm font-medium"
              >
                {category}
              </button>
            ))}
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-4 mb-20">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.02] via-white/[0.01] to-transparent backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-indigo-500/30"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-5 flex items-start justify-between gap-4 text-left group"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium">
                        {faq.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-white/90 group-hover:text-white transition-colors">
                      {faq.question}
                    </h3>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-white/60 flex-shrink-0 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''
                      }`}
                  />
                </button>
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                >
                  <div className="px-6 pb-5 pt-0">
                    <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-4"></div>
                    <p className="text-white/60 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="text-center py-16 rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 backdrop-blur-sm">
            <HelpCircle className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text">
              {t('faqPage.stillQuestions')}
            </h2>
            <p className="text-white/60 mb-8 max-w-2xl mx-auto">
              {t('faqPage.stillDesc')}
            </p>
            <button
              onClick={() => navigate('/contact')}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-2 border-indigo-500/30 text-white font-semibold hover:from-indigo-500/30 hover:to-purple-500/30 hover:border-indigo-500/50 transition-all duration-300"
            >
              {t('faqPage.contactUs')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

