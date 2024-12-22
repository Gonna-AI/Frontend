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
    overlayWord: "INNOVATE",
    gradientColors: {
      primary: "from-[#E0F7FF] via-[#B3E5FC] to-[#81D4FA]",
      accent: "from-[#B3E5FC] via-[#4FC3F7] to-[#29B6F6]"
    }
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
    overlayWord: "TRANSFORM",
    gradientColors: {
      primary: "from-[#E0F2F1] via-[#B2DFDB] to-[#80CBC4]",
      accent: "from-[#B2DFDB] via-[#4DB6AC] to-[#26A69A]"
    }
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
    overlayWord: "DISRUPT",
    gradientColors: {
      primary: "from-[#EDE7F6] via-[#D1C4E9] to-[#B39DDB]",
      accent: "from-[#D1C4E9] via-[#9575CD] to-[#7E57C2]"
    }
  },
];

const GradientCard = ({ item }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
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
          {/* Base white layer */}
          <div className="absolute inset-0 bg-white/5" />
          
          {/* Luminous gradient layers */}
          <div className="absolute inset-0">
            {/* Soft base gradient */}
            <div className={cn(
              "absolute inset-0 bg-gradient-to-br",
              item.gradientColors.primary,
              "animate-pulse-slow opacity-70"
            )} />
            
            {/* Glowing accent layer */}
            <div className={cn(
              "absolute inset-0 bg-gradient-to-br",
              item.gradientColors.accent,
              "animate-glow-fast opacity-40"
            )} />

            {/* Light rays effect */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent animate-light-rays" />

            {/* Subtle glass effect */}
            <div className="absolute inset-0 backdrop-blur-[1px]" />
          </div>

          {/* Typography */}
          <div className="absolute inset-0 flex items-center justify-center">
            <h3 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold tracking-wider text-center"
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                }}>
              <span className="text-white/90 mix-blend-overlay">
                {item.overlayWord}
              </span>
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
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.02); }
        }
        
        @keyframes glow-fast {
          0%, 100% { opacity: 0.4; transform: scale(1.1); }
          25% { opacity: 0.2; transform: scale(1.15) translateY(-1%); }
          50% { opacity: 0.5; transform: scale(1.1) translateY(1%); }
          75% { opacity: 0.3; transform: scale(1.12) translateY(-0.5%); }
        }

        @keyframes light-rays {
          0% { opacity: 0.2; transform: scale(1) rotate(0deg); }
          25% { opacity: 0.3; transform: scale(1.1) rotate(90deg); }
          50% { opacity: 0.4; transform: scale(1.2) rotate(180deg); }
          75% { opacity: 0.3; transform: scale(1.1) rotate(270deg); }
          100% { opacity: 0.2; transform: scale(1) rotate(360deg); }
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 6s ease-in-out infinite;
        }
        
        .animate-glow-fast {
          animation: glow-fast 8s ease-in-out infinite;
        }

        .animate-light-rays {
          animation: light-rays 12s linear infinite;
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