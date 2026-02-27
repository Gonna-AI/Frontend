"use client";

export default function Features() {
  return (
    <section className="py-24 relative bg-[rgb(10,10,10)]">
      {/* Curved decoration lines */}
      <div className="absolute inset-0 overflow-hidden">
        <svg
          className="w-full h-full opacity-20"
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

      <div className="relative max-w-7xl mx-auto px-4"></div>
    </section>
  );
}
