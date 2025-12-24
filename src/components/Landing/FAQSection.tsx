import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useDeviceDetection } from '../../hooks/useDeviceDetection';
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

  const shouldReduceMotion = prefersReducedMotion || isMobile || isLowEnd;

  const faqs: FAQItem[] = [
    {
      category: 'Support',
      question: 'How do I get started?',
      answer: 'Getting started is easy! Book a demo with our team through the Contact page, and we\'ll schedule a personalized walkthrough. After that, we\'ll help you set up a trial environment tailored to your specific use case.'
    },
    {
      category: 'Pricing',
      question: 'Do you offer a free trial?',
      answer: 'Yes, we offer a 14-day free trial for qualified businesses. During the trial, you\'ll have access to our core features and dedicated support to help you evaluate the platform.'
    },
    {
      category: 'Pricing',
      question: 'How is ClerkTree priced?',
      answer: 'We offer flexible pricing based on your volume of documents, number of users, and specific features required. Contact our sales team for a customized quote that fits your business needs.'
    },
    {
      category: 'Product',
      question: 'How long does implementation take?',
      answer: 'Implementation typically takes 2-4 weeks depending on your specific requirements and existing systems. We provide dedicated onboarding support and training to ensure a smooth transition.'
    },
    {
      category: 'Support',
      question: 'Can I integrate ClerkTree with my existing systems?',
      answer: 'Yes! ClerkTree offers REST APIs and pre-built integrations with popular business tools including Salesforce, SAP, Microsoft Dynamics, and more. Our team can also help with custom integrations.'
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
                Frequently Asked
              </span>
              <span className="text-white block">
                Questions
              </span>
            </motion.h2>

            <motion.div
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.4, delay: 0.1 }}
              className="text-sm text-neutral-400 space-y-2"
            >
              <p>Can't find what you're looking for?</p>
              <p>
                Visit our{' '}
                <Link to="/contact" className="text-white hover:text-white/80 underline">
                  Contact page
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
