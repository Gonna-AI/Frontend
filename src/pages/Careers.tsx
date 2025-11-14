import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Careers() {
  const navigate = useNavigate();
  return (
    <div className="bg-[rgb(10,10,10)] min-h-screen relative overflow-hidden">
      {/* Emerald theme background accents */}
      <div className="fixed inset-0">
        <div 
          className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 md:w-[800px] h-96 md:h-[800px] opacity-40"
          style={{
            background: 'radial-gradient(circle, rgba(16,185,129,0.6) 0%, rgba(16,185,129,0.25) 40%, transparent 100%)',
            filter: 'blur(80px)',
          }}
        />
        <div 
          className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-72 md:w-[600px] h-72 md:h-[600px] opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(5,150,105,0.5) 0%, rgba(5,150,105,0.2) 40%, transparent 100%)',
            filter: 'blur(80px)',
          }}
        />
      </div>
      <div className="flex items-center justify-center min-h-screen">
        <div className="max-w-5xl mx-auto text-center px-6 relative z-10">
          {/* Clickable Logo to Home */}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 mb-6 mx-auto group"
            aria-label="Go to home"
          >
            <svg viewBox="0 0 464 468" className="w-14 h-14">
              <defs>
                <linearGradient id="ct-careers" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>
              <path fill="url(#ct-careers)" d="M275.9 63.5c37.7 5.3 76.6 24.1 103.7 50.2 30 28.8 41.8 57.6 35.8 87.1-6.1 30.1-33.6 52.9-70.6 58.3-6 0.9-18.3 1-44.9 0.6l-36.6-0.7-0.5 17.8c-0.3 9.7-0.4 17.8-0.4 17.9 0.1 0.1 19.1 0.3 42.2 0.4 23.2 0 42.7 0.5 43.5 1 1.2 0.7 1.1 2.2-0.8 9.4-6 23-20.5 42.1-41.8 55-7.3 4.3-26.7 11.9-36 14.1-9 2-34 2-44.5 0-41.3-7.9-74.2-38-82.9-75.7-8.1-35.7 2.2-71.5 27.5-94.7 16.1-14.9 35.5-22.4 63.7-24.7l7.7-0.7v-34.1l-11.7 0.7c-22.2 1.3-37 5.3-56.4 15.2-28.7 14.6-49.7 39.3-59.9 70.2-9.6 29.3-9.3 62.6 0.8 91.4 3.3 9.2 12.2 25.6 18.3 33.8 11.3 14.9 30.6 30.8 48.7 39.9 19.9 10 49.2 15.9 73.2 14.7 26.5-1.3 52.5-9.6 74.2-23.9 26.9-17.6 47.2-47.9 53.3-79.7 1-5.2 2.3-10.1 2.8-10.8 0.8-0.9 6.9-1.2 27.1-1l26.1 0.3 0.3 3.8c1.2 14.6-10.9 52.1-23.9 74-17.8 30-43.2 54-75.9 71.5-20.9 11.2-38.3 16.5-67.2 20.7-27.6 3.9-47.9 3.1-75.8-3.1-36.9-8.3-67.8-25.6-97.1-54.6-23.6-23.2-44.8-61.9-51.7-93.8-5.1-23.7-5.5-28.1-4.9-48.8 1.7-63.2 23.4-111.8 67.7-152 28-25.4 60.4-41.3 99-48.8 18.5-3.6 46.1-4 67.9-0.9zm16.4 92.6c-6.3 2.4-12.8 8.5-15.4 14.5-2.6 6.1-2.6 18.3 0 23.9 5 11 20.2 17.7 32.3 14.1 11.9-3.4 19.8-14.3 19.8-27.1-0.1-19.9-18.2-32.5-36.7-25.4z" />
            </svg>
            <span className="text-3xl md:text-4xl font-semibold text-white/90 group-hover:text-white">
              ClerkTree
            </span>
          </button>
          <div className="mb-8 flex items-center justify-center">
            <div className="bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 text-transparent bg-clip-text">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight">Careers</h1>
            </div>
          </div>
          <div className="space-y-8">
            <p className="text-lg md:text-xl text-white/70 leading-relaxed mx-auto">
              Join us to reimagine claims operations with AI-first tooling. 
              We value craft, curiosity, and shipping meaningful work.
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="rounded-2xl border border-emerald-500/20 bg-white/5 p-6">
                <h3 className="font-semibold mb-2 bg-gradient-to-r from-emerald-400 to-emerald-600 text-transparent bg-clip-text">
                  Open Roles
                </h3>
                <ul className="text-white/70 text-sm space-y-1">
                  <li>— Senior Frontend Engineer</li>
                  <li>— Fullstack Engineer</li>
                  <li>— Product Designer</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-emerald-500/20 bg-white/5 p-6">
                <h3 className="font-semibold mb-2 bg-gradient-to-r from-emerald-400 to-emerald-600 text-transparent bg-clip-text">
                  How we work
                </h3>
                <p className="text-white/70 text-sm">Remote-friendly, async-first, with focus blocks and thoughtful collaboration.</p>
              </div>
              <div className="rounded-2xl border border-emerald-500/20 bg-white/5 p-6">
                <h3 className="font-semibold mb-2 bg-gradient-to-r from-emerald-400 to-emerald-600 text-transparent bg-clip-text">
                  Benefits
                </h3>
                <p className="text-white/70 text-sm">Competitive comp, flexible schedule, and a culture that values impact.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

