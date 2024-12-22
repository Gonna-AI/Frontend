import React from "react";
import { motion } from "framer-motion";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const SmoothContent = ({ children, className }) => {
  return (
    <div className={cn("relative w-full max-w-4xl mx-auto h-full", className)}>
      <div>{children}</div>
    </div>
  );
};

const dummyContent = [
  {
    title: "The Virtue of Automated Wisdom",
    description: (
      <>
        <p className="mb-4">
          As Marcus Aurelius taught us, 'The universe is change; our life is what our thoughts make it.' Our AI solution embodies this principle by transforming complex claims processing into clear, manageable actions.
        </p>
        <p>
          Like a stoic mind that remains unperturbed in chaos, our system brings order to overwhelming workloads, automatically prioritizing and scheduling tasks with unwavering logic and precision.
        </p>
      </>
    ),
    badge: "Intelligence",
    overlayWord: "Automated",
    imageUrl: "images/1.jpeg" // Update with your actual image path
  },
  {
    title: "Time: The Ultimate Resource",
    description: (
      <>
        <p className="mb-4">
          Minimalism is not a lack of something. It's simply the perfect amount of something.
          The simplest solution is often the best solution.
        </p>
        <p>
          Less is more. Perfection is achieved not when there is nothing more to add, 
          but when there is nothing left to take away.
        </p>
      </>
    ),
    badge: "Efficiency",
    overlayWord: "Personalized",
    imageUrl: "/images2.jpg" // Update with your actual image path
  },
  {
    title: "The Art of Digital Empathy",
    description: (
      <>
        <p className="mb-4">
          Epictetus said, 'It's not what happens to you, but how you react to it that matters.' Our sentiment analysis technology embodies this principle by understanding not just what clients say, but how they feel.
        </p>
        <p>
          By combining stoic rationality with emotional intelligence, we create a system that maintains composure under pressure while delivering deeply empathetic service. The result is a transformed claims experience that honors both efficiency and humanity.
        </p>
      </>
    ),
    badge: "Experience",
    overlayWord: "Intelligence",
    imageUrl: "/images/3.jpeg" // Update with your actual image path
  },
];

const GradientCard = ({ item }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ 
        opacity: 1, 
        y: 0,
        transition: {
          duration: 0.6,
          ease: [0.23, 1, 0.32, 1]
        }
      }}
      viewport={{ once: true, margin: "-100px" }}
      className="mb-16"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-white rounded-full text-black text-sm px-4 py-1">
          {item.badge}
        </div>
      </div>

      <p className="text-xl mb-4 font-semibold">
        {item.title}
      </p>

      <div className="text-sm prose prose-sm dark:prose-invert">
        <div className="relative h-48 sm:h-56 md:h-64 rounded-2xl mb-10 overflow-hidden">
          {/* Image Background */}
          <img 
            src={item.imageUrl}
            alt={item.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          
          {/* Glass Text Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
            <h3 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold tracking-wider text-center glass-text"
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                }}>
              {item.overlayWord}
            </h3>
          </div>
        </div>
        {item.description}
      </div>
    </motion.div>
  );
};

export default function SmoothContentDemo() {
  return (
    <div className="min-h-screen bg-[rgb(10,10,10)] text-white py-20">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');
        
        .glass-text {
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.9) 0%,
            rgba(255, 255, 255, 0.7) 50%,
            rgba(255, 255, 255, 0.8) 100%
          );
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          text-shadow: 
            0 0 10px rgba(255, 255, 255, 0.5),
            0 0 20px rgba(255, 255, 255, 0.3),
            0 0 30px rgba(255, 255, 255, 0.2);
          letter-spacing: 0.05em;
          filter: drop-shadow(0 0 12px rgba(255, 255, 255, 0.6));
          mix-blend-mode: overlay;
          font-weight: 700;
        }
      `}</style>
      <SmoothContent className="px-6">
        <div className="max-w-2xl mx-auto antialiased pt-4 relative">
          {dummyContent.map((item, index) => (
            <GradientCard key={`content-${index}`} item={item} />
          ))}
        </div>
      </SmoothContent>
    </div>
  );
}