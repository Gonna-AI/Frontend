'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'

export default function Features() {
  const [activeFeature, setActiveFeature] = useState(null)
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  const features = [
    {
      number: '01',
      title: 'AI-Powered Processing',
      description: 'Advanced machine learning algorithms for accurate and efficient claims processing.'
    },
    {
      number: '02',
      title: 'Real-time Analytics',
      description: 'Comprehensive dashboards with actionable insights and performance metrics.'
    },
    {
      number: '03',
      title: 'Smart Scheduling',
      description: 'Automated callback scheduling optimized for customer availability.'
    },
    {
      number: '04',
      title: 'Sentiment Analysis',
      description: 'Real-time customer sentiment tracking for improved service quality.'
    }
  ]

  const testimonials = [
    {
      quote: "Gonna.AI has transformed our claims processing workflow. The efficiency gains are remarkable.",
      author: "Sarah Chen",
      role: "Operations Director",
      company: "Technical University of Munich"
    },
    {
      quote: "The AI-powered analytics have given us insights we never had before. Game-changing platform.",
      author: "Michael Rivera",
      role: "Claims Manager",
      company: "Shiv Nadar University"
    },
    {
      quote: "Customer satisfaction has improved significantly since implementing Gonna.AI's smart scheduling.",
      author: "Emma Thompson",
      role: "Customer Success Lead",
      company: "Friedrich-Alexander University"
    }
  ]

  return (
    <section className="py-24 bg-[rgb(10,10,10)]">
      {/* Curved decoration lines */}
      <div className="absolute inset-0 overflow-hidden">
        <svg className="w-full h-full opacity-20" viewBox="0 0 1000 1000" preserveAspectRatio="none">
          <path
            d="M0,500 Q250,400 500,500 T1000,500"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="1"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="pt-20 mb-24">
          <div className="flex items-center space-x-2 mb-6">
            <div className="text-purple-500 text-2xl">{"{"}</div>
            <h1 className="text-2xl font-medium text-white">ClaimFlow</h1>
          </div>
          
          <div className="max-w-3xl">
            <h2 className="text-5xl sm:text-6xl font-bold text-white mb-8">
              Advanced Claims Processing Infrastructure
            </h2>
            <p className="text-lg text-gray-400 mb-12">
              {"}"} Renowned for revolutionizing claims management with state-of-the-art 
              automation, advanced analytics & intelligent routing
            </p>
            
            <div className="flex items-center gap-6">
              <button className="bg-black text-white px-8 py-3 rounded-full border border-purple-500/30 hover:border-purple-500/60 transition-colors font-mono uppercase text-sm tracking-wider">
                GET IN TOUCH
              </button>

              {/* Interactive dots */}
              <div className="flex gap-4 items-center">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="relative group"
                    onMouseEnter={() => setActiveFeature(index)}
                    onMouseLeave={() => setActiveFeature(null)}
                  >
                    {/* Feature dot */}
                    <div className="w-3 h-3 rounded-full bg-purple-500/20 border border-purple-500/40 group-hover:border-purple-500 transition-all duration-300 group-hover:scale-150" />
                    
                    {/* Pulsing effect */}
                    <div className="absolute inset-0 animate-ping bg-purple-500 rounded-full opacity-20 group-hover:opacity-0" />
                    
                    {/* Expanding content */}
                    <div className={`absolute left-1/2 -translate-x-1/2 bottom-full mb-4 w-64 opacity-0 group-hover:opacity-100 transition-all duration-300 ${
                      activeFeature === index ? 'translate-y-0' : 'translate-y-2'
                    }`}>
                      <div className="bg-black/60 backdrop-blur-sm border border-purple-500/20 rounded-lg p-4">
                        <div className="font-mono text-sm text-purple-400 mb-2">
                          {feature.number}
                        </div>
                        <div className="text-white font-medium mb-2">
                          {feature.title}
                        </div>
                        <div className="text-gray-400 text-sm">
                          {feature.description}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
          {[
            { value: '192K', label: 'Claims Processed' },
            { value: '34+', label: 'Unique Integrations' },
            { value: '99.9%', label: 'Processing Accuracy' }
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-black/40 backdrop-blur-sm border border-white/5 rounded-2xl p-8"
            >
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-gray-400 mt-2 font-mono">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Testimonials Section */}
        <div className="mb-32 relative">
          <div className="text-center mb-12">
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-3xl font-bold bg-gradient-to-r from-white/80 to-white/40 text-transparent bg-clip-text mb-4"
            >
              What Our Clients Say
            </motion.h3>
            
            {/* Interactive dots above testimonials */}
            <div className="flex justify-center gap-4 mb-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className="group relative"
                >
                  <div 
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      activeTestimonial === index 
                        ? 'bg-purple-500 scale-125' 
                        : 'bg-purple-500/20 border border-purple-500/40'
                    }`}
                  />
                  {activeTestimonial !== index && (
                    <div className="absolute inset-0 animate-ping bg-purple-500 rounded-full opacity-20" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="max-w-4xl mx-auto relative h-[200px]">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ 
                  opacity: activeTestimonial === index ? 1 : 0,
                  x: activeTestimonial === index ? 0 : 20
                }}
                transition={{ duration: 0.5 }}
                className={`absolute w-full ${activeTestimonial === index ? 'block' : 'hidden'}`}
              >
                <div className="bg-black/40 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8 relative">
                  {/* Decorative elements */}
                  <div className="absolute -top-3 -left-3">
                    <div className="w-6 h-6">
                      <div className="absolute inset-0 animate-ping bg-purple-500 rounded-full opacity-20" />
                      <div className="absolute inset-0 bg-purple-500/20 border border-purple-500/40 rounded-full" />
                    </div>
                  </div>
                  
                  <blockquote className="text-xl text-white/90 mb-6 relative">
                    "{testimonial.quote}"
                  </blockquote>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">{testimonial.author}</div>
                      <div className="text-gray-400 text-sm">{testimonial.role}</div>
                      <div className="text-purple-400 text-sm font-mono">{testimonial.company}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Gonna.AI Section */}
        <div className="flex justify-end mb-12">
          <div className="flex items-center gap-4">
            {/* Glowing dot */}
            <div className="relative group">
              <div className="w-2 h-2 rounded-full bg-purple-500/20 border border-purple-500/40 group-hover:border-purple-500 transition-all duration-300 group-hover:scale-150" />
              <div className="absolute inset-0 animate-ping bg-purple-500 rounded-full opacity-20" />
            </div>
            
            <div className="text-sm font-mono text-white/60">Gonna.AI</div>
          </div>
        </div>

        {/* Partners Section */}
        <div className="mt-24 text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-white/60 text-sm mb-8"
          >
            Used by professionals from
          </motion.p>
        </div>
      </div>
    </section>
  )
}