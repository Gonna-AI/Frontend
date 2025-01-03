'use client'

import React, { useState, Suspense } from 'react'
import { motion } from 'framer-motion'
import { QuoteForm } from './QuoteForm'
import { useTweet } from 'react-tweet'
import { enrichTweet } from 'react-tweet'

// Tweet Components
const XLogo = ({ className, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    className={`fill-white ${className}`}
    {...props}
  >
    <g>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
    </g>
  </svg>
)

const Verified = ({ className, ...props }) => (
  <svg
    aria-label="Verified Account"
    viewBox="0 0 24 24"
    className={className}
    {...props}
  >
    <g fill="currentColor">
      <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z" />
    </g>
  </svg>
)

const TweetSkeleton = ({ className, ...props }) => (
  <div
    className="flex size-full max-h-max min-w-72 flex-col gap-2 rounded-lg border p-4"
    {...props}
  >
    <div className="flex flex-row gap-2">
      <div className="size-10 shrink-0 rounded-full bg-gray-200" />
      <div className="h-10 w-full bg-gray-200" />
    </div>
    <div className="h-20 w-full bg-gray-200" />
  </div>
)

const TweetNotFound = ({ className, ...props }) => (
  <div
    className="flex size-full flex-col items-center justify-center gap-2 rounded-lg border p-4"
    {...props}
  >
    <h3>Tweet not found</h3>
  </div>
)

const TweetBody = ({ tweet }) => (
  <div className="break-words leading-normal tracking-tighter">
    {tweet.entities.map((entity, idx) => {
      switch (entity.type) {
        case "url":
        case "symbol":
        case "hashtag":
        case "mention":
          return (
            <a
              key={idx}
              href={entity.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-normal text-blue-400 hover:underline"
            >
              {entity.text}
            </a>
          );
        case "text":
          return (
            <span
              key={idx}
              className="text-sm md:text-base font-normal text-white"
            >
              {entity.text}
            </span>
          );
        default:
          return null;
      }
    })}
  </div>
);

const TweetMedia = ({ tweet }) => {
  if (!tweet.photos?.length) return null;
  
  return (
    <div className="mt-2 grid gap-2 grid-cols-1">
      {tweet.photos.map((photo) => (
        <img
          key={photo.url}
          src={photo.url}
          alt={tweet.text}
          className="rounded-lg w-full h-auto object-cover"
        />
      ))}
    </div>
  );
};

const ClientTweetCard = ({
  id,
  apiUrl,
  fallback = <TweetSkeleton />,
  components,
  fetchOptions,
  onError,
  ...props
}) => {
  const { data, error, isLoading } = useTweet(id)
  
  if (isLoading) return fallback
  if (error || !data) {
    const NotFound = components?.TweetNotFound || TweetNotFound
    return <NotFound error={onError ? onError(error) : error} />
  }

  return <MagicTweet tweet={data} components={components} {...props} />
}

const MagicTweet = ({ tweet, components, className, ...props }) => {
  const enrichedTweet = enrichTweet(tweet);

  // Add reply context
  const replyToTweetId = "1872881853642035621"; // The tweet being replied to
  
  return (
    <div
      className="relative flex size-full max-w-xl md:max-w-2xl flex-col gap-2 overflow-hidden rounded-lg border border-purple-500/20 bg-black/40 p-4 md:p-6 backdrop-blur-md"
      {...props}
    >
      {/* Reply indicator */}
      <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
        <div className="w-5 h-5 flex items-center justify-end">
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
            <path d="M14.586 7.586a2 2 0 0 0-2.828 0L7.586 11.758A2 2 0 0 0 7 13.172V17h3.828a2 2 0 0 0 1.414-.586l4.172-4.172a2 2 0 0 0 0-2.828l-1.828-1.828zM19 19H5v-2h14v2z" />
          </svg>
        </div>
        <span>Replying to @greg16676935420</span>
      </div>
      <div className="flex flex-row justify-between tracking-tight">
        <div className="flex items-center space-x-2">
          <a href={tweet.user.url} target="_blank" rel="noreferrer">
            <img
              title={`Profile picture of ${tweet.user.name}`}
              alt={tweet.user.screen_name}
              height={48}
              width={48}
              src={tweet.user.profile_image_url_https}
              className="overflow-hidden rounded-full border border-transparent"
            />
          </a>
          <div>
            <a
              href={tweet.user.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center whitespace-nowrap font-semibold text-white"
            >
              {tweet.user.name}
              {tweet.user.verified && (
                <Verified className="ml-1 inline size-4 text-blue-500" />
              )}
            </a>
            <div className="flex items-center space-x-1">
              <a
                href={tweet.user.url}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-gray-400 transition-all duration-75 hover:text-gray-300"
              >
                @{tweet.user.screen_name}
              </a>
            </div>
          </div>
        </div>
        <a href={tweet.url} target="_blank" rel="noreferrer">
          <span className="sr-only">Link to tweet</span>
          <XLogo className="size-5 items-start transition-all ease-in-out hover:scale-105" />
        </a>
      </div>
      <TweetBody tweet={enrichedTweet} />
      <TweetMedia tweet={enrichedTweet} />
    </div>
  )
}

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
      quote: "ClerkTree has transformed our claims processing workflow. The efficiency gains are remarkable.",
      company: "Technical University of Munich"
    },
    {
      quote: "The AI-powered analytics have given us insights we never had before. Game-changing platform.",
      author: "",
      role: "",
      company: "Shiv Nadar University"
    },
    {
      quote: "Customer satisfaction has improved significantly since implementing ClerkTree's smart scheduling.",
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
        <div className="text-xs text-gray-500 text-center mt-2">
          * Metrics based on test environment performance
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

        {/* ClerkTree Section */}
        <div className="flex justify-end mb-12">
          <div className="flex items-center gap-4">
            {/* Glowing dot */}
            <div className="relative group">
              <div className="w-2 h-2 rounded-full bg-purple-500/20 border border-purple-500/40 group-hover:border-purple-500 transition-all duration-300 group-hover:scale-150" />
              <div className="absolute inset-0 animate-ping bg-purple-500 rounded-full opacity-20" />
            </div>
            
            <div className="text-sm font-mono text-white/60">ClerkTree</div>
          </div>
        </div>

        {/* Partners Section with Tweet */}
        <div className="mt-24 text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-white/60 text-sm mb-8"
          >
            Trusted by leading institutions worldwide
          </motion.p>
          
          <div className="flex flex-col items-center justify-center space-y-8">
            {/* Tweet Card */}
            <div className="w-full max-w-xl md:max-w-2xl mx-auto">
              <Suspense fallback={<TweetSkeleton />}>
                <ClientTweetCard 
                  id="1873125052339896610"
                  className="bg-black/40 backdrop-blur-sm border border-purple-500/20 w-full"
                />
              </Suspense>
            </div>
            
            <div className="flex justify-center items-center space-x-12">
              {/* Add partner logos here */}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

