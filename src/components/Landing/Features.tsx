"use client";

import WobbleCardDemo from "./WobbleCardDemo";

export default function Features() {
  return (
    <section className="relative bg-[rgb(10,10,10)] px-4 py-24 sm:px-6 lg:px-8 2xl:px-10">
      <div className="absolute inset-0 overflow-hidden">
        <svg
          className="h-full w-full opacity-20"
          viewBox="0 0 1000 1000"
          preserveAspectRatio="none"
        >
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

      <div className="relative z-10">
        <WobbleCardDemo />
      </div>
    </section>
  );
}
