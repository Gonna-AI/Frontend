import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FAQSection() {
  const navigate = useNavigate();

  const quickFAQs = [
    {
      question: "What is ClerkTree?",
      answer: "AI-powered workflow automation for claims and back-office operations"
    },
    {
      question: "How does it work?",
      answer: "Combines human expertise with AI to reduce turnaround time by 40%"
    },
    {
      question: "Who is it for?",
      answer: "Insurance, BFSI, BPO, and document-heavy operations teams"
    }
  ];

  return (
    <div className="w-full rounded-md relative py-24 px-6 antialiased bg-[rgb(10,10,10)]">
      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-7xl font-bold text-center mb-6 pb-2"
          >
            <span className="bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-transparent">
              Frequently Asked
            </span>
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Questions
            </span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-neutral-400 max-w-2xl mx-auto"
          >
            Quick answers to common questions about ClerkTree
          </motion.p>
        </div>

        {/* Quick FAQs */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {quickFAQs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              className="group rounded-2xl border border-neutral-800 bg-neutral-900/50 backdrop-blur-sm p-6 hover:border-neutral-700 transition-all duration-300"
            >
              <h3 className="font-semibold text-neutral-200 mb-3 group-hover:text-white transition-colors">
                {faq.question}
              </h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                {faq.answer}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <button
            onClick={() => navigate('/faq')}
            className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-neutral-800 to-neutral-900 border-2 border-neutral-700 text-white font-semibold hover:from-neutral-700 hover:to-neutral-800 hover:border-neutral-600 transition-all duration-300 backdrop-blur-sm"
          >
            <span>See All FAQs</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}

