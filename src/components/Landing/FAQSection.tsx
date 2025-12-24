import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useDeviceDetection } from '../../hooks/useDeviceDetection';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export default function FAQSection() {
  const prefersReducedMotion = useReducedMotion();
  const { isMobile, isLowEnd } = useDeviceDetection();
  const { t } = useLanguage();

  const shouldReduceMotion = prefersReducedMotion || isMobile || isLowEnd;

  const faqs: FAQItem[] = [
    {
      category: 'Support',
      question: t('faq.q1'),
      answer: t('faq.a1')
    },
    {
      category: 'Pricing',
      question: t('faq.q2'),
      answer: t('faq.a2')
    },
    {
      category: 'Pricing',
      question: t('faq.q3'),
      answer: t('faq.a3')
    },
    {
      category: 'Product',
      question: t('faq.q4'),
      answer: t('faq.a4')
    },
    {
      category: 'Support',
      question: t('faq.q5'),
      answer: t('faq.a5')
    }
  ];

  return (
    <div className="w-full rounded-md relative py-24 px-6 antialiased bg-[rgb(10,10,10)]">
      <div className="max-w-6xl mx-auto relative z-10">

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-4 items-start">
          {/* Left Side - Header */}
          <div className="sticky top-24">
            <motion.h2
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.4 }}
              className="text-2xl md:text-3xl font-semibold mb-6"
            >
              <span className="text-white block">
                {t('faq.title1')}
              </span>
              <span className="text-white block">
                {t('faq.title2')}
              </span>
            </motion.h2>

            <motion.div
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.4, delay: 0.1 }}
              className="text-sm text-neutral-400 space-y-2"
            >
              <p>{t('faq.cantFind')}</p>
              <p>
                {t('faq.visitOur')}{' '}
                <Link to="/contact" className="text-white hover:text-white/80 underline">
                  {t('faq.contactPage')}
                </Link>
              </p>
            </motion.div>
          </div>

          {/* Right Side - FAQ Accordion */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.4, delay: 0.2 }}
            className="w-full"
          >
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border-white/10"
                >
                  <AccordionTrigger className="text-left">
                    <span className="text-base font-medium pr-4">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-white/60 leading-relaxed">
                      {faq.answer}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
