'use client'

import { useState } from 'react'

export default function Features() {
  const [activeFeature, setActiveFeature] = useState<number | null>(null)

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

  return (
    <section className="py-24 relative bg-[rgb(10,10,10)]">
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
            <h1 className="text-2xl font-medium text-white">Claim & Flow</h1>
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
              <button 
                className="bg-black text-white px-8 py-3 rounded-full border border-purple-500/30 hover:border-purple-500/60 transition-colors font-mono uppercase text-sm tracking-wider"
                onClick={() => window.location.href = '/contact'}
              >
                GET A CUSTOM QUOTE
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {[
            { value: '3.8s', label: 'Processing Speed' },
            { value: '12K', label: 'Test Claims Processed' },
            { value: '92%', label: 'Auto-classification Rate' }
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
        <div className="text-xs text-gray-500 text-center mt-4 mb-32">
          * Metrics based on test environment performance
        </div>
      </div>
    </section>
  )
}
