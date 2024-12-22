import React, { useEffect, useRef, useState } from "react";
import { motion, useTransform, useScroll, useSpring } from "framer-motion";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const TracingBeam = ({
  children,
  className,
}) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const contentRef = useRef(null);
  const [svgHeight, setSvgHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setSvgHeight(contentRef.current.offsetHeight);
    }
  }, []);

  const y1 = useSpring(
    useTransform(scrollYProgress, [0, 0.8], [50, svgHeight]),
    {
      stiffness: 500,
      damping: 90,
    }
  );
  const y2 = useSpring(
    useTransform(scrollYProgress, [0, 1], [50, svgHeight - 400]),
    {
      stiffness: 500,
      damping: 90,
    }
  );

  return (
    <motion.div
      ref={ref}
      className={cn("relative w-full max-w-4xl mx-auto h-full", className)}
    >
      <div className="absolute -left-4 md:-left-20 top-3">
        <motion.div
          transition={{
            duration: 0.2,
            delay: 0.5,
          }}
          animate={{
            boxShadow:
              scrollYProgress.get() > 0
                ? "none"
                : "rgba(0, 0, 0, 0.24) 0px 3px 8px",
          }}
          className="ml-[27px] h-4 w-4 rounded-full border border-neutral-200 shadow-sm flex items-center justify-center"
        >
          <motion.div
            transition={{
              duration: 0.2,
              delay: 0.5,
            }}
            animate={{
              backgroundColor:
                scrollYProgress.get() > 0 ? "white" : "rgb(16 185 129)",
              borderColor:
                scrollYProgress.get() > 0 ? "white" : "rgb(5 150 105)",
            }}
            className="h-2 w-2 rounded-full border border-neutral-300 bg-white"
          />
        </motion.div>
        <svg
          viewBox={`0 0 20 ${svgHeight}`}
          width="20"
          height={svgHeight}
          className="ml-4 block"
          aria-hidden="true"
        >
          <motion.path
            d={`M 1 0V -36 l 18 24 V ${svgHeight * 0.9} l -18 24V ${svgHeight}`}
            fill="none"
            stroke="#9091A0"
            strokeOpacity="0.16"
            strokeWidth="1.5"
            transition={{
              duration: 10,
            }}
          />
          <motion.path
            d={`M 1 0V -36 l 18 24 V ${svgHeight * 0.9} l -18 24V ${svgHeight}`}
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="1.5"
            className="motion-reduce:hidden"
            transition={{
              duration: 10,
            }}
          />
          <defs>
            <motion.linearGradient
              id="gradient"
              gradientUnits="userSpaceOnUse"
              x1="0"
              x2="0"
              y1={y1}
              y2={y2}
            >
              <stop stopColor="#18CCFC" stopOpacity="0" />
              <stop stopColor="#18CCFC" />
              <stop offset="0.325" stopColor="#6344F5" />
              <stop offset="1" stopColor="#AE48FF" stopOpacity="0" />
            </motion.linearGradient>
          </defs>
        </svg>
      </div>
      <div ref={contentRef}>{children}</div>
    </motion.div>
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
    image: "src/api/placeholder/image6.png"
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
    image: "src/api/placeholder/image10.jpeg"
  },
  {
    title: "The Art of Digital Empathy",
    description: (
      <>
        <p className="mb-4">
        Epictetus said, 'It's not what happens to you, but how you react to it that matters.' Our sentiment analysis technology embodies this principle by understanding not just what clients say, but how they feel.        </p>
        <p>
        By combining stoic rationality with emotional intelligence, we create a system that maintains composure under pressure while delivering deeply empathetic service. The result is a transformed claims experience that honors both efficiency and humanity.        </p>
      </>
    ),
    badge: "Experience",
    image: "src/api/placeholder/image15.png"
  },
];

export default function TracingBeamDemo() {
  return (
    <div className="min-h-screen bg-[rgb(10,10,10)] text-white py-20">
      <TracingBeam className="px-6">
        <div className="max-w-2xl mx-auto antialiased pt-4 relative">
          {dummyContent.map((item, index) => (
            <div key={`content-${index}`} className="mb-10">
              <h2 className="bg-white text-black rounded-full text-sm w-fit px-4 py-1 mb-4">
                {item.badge}
              </h2>

              <p className="text-xl mb-4 font-semibold">
                {item.title}
              </p>

              <div className="text-sm prose prose-sm dark:prose-invert">
                <img
                  src={item.image}
                  alt={`${item.title} thumbnail`}
                  className="rounded-lg mb-10 object-cover w-full h-64"
                />
                {item.description}
              </div>
            </div>
          ))}
        </div>
      </TracingBeam>
    </div>
  );
}