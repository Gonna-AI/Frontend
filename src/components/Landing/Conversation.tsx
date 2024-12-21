"use client";

import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { Phone, PhoneCall, Bot, User, Mic, Clock, Calendar, Settings, Database, MessageSquare, Sliders, Activity, VolumeIcon as VolumeUp, BrainCircuit, ChevronRight, BarChart4, Sparkles, Shield, Zap, Gauge, ChevronDown } from 'lucide-react';
import { LineChart, Line, Tooltip, ResponsiveContainer } from 'recharts';

// Utility function for class names
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

const messages = [
  { isAI: true, text: "Hello! I notice this is a high-priority medical claim. How can I assist you today?" },
  { isAI: false, text: "I need an urgent update on the claim status from last week." },
  { isAI: true, text: "I've analyzed the claim history and detected urgency. Would you like me to schedule a priority callback within the next 2 hours?" },
  { isAI: false, text: "Yes, that would be helpful. Can you also prepare a summary of the claim status?" },
  { isAI: true, text: "I've scheduled a priority callback for 2:30 PM. Here's the claim summary: Initial filing date 03/15, current status: Under Review, Expected resolution: 48 hours. Sentiment analysis indicates the client needs reassurance about the timeline." }
];

const performanceMetrics = [
  { label: "Response Time", value: "1.2s", trend: "-15%", color: "emerald" },
  { label: "Accuracy", value: "99.2%", trend: "+2.5%", color: "blue" },
  { label: "User Rating", value: "4.9/5", trend: "+0.3", color: "purple" }
];

export const LampContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 w-full rounded-md z-0",
        className
      )}
    >
      <div className="relative flex w-full flex-1 scale-y-125 items-center justify-center isolate z-0 ">
        <motion.div
          initial={{ opacity: 0.5, width: "15rem" }}
          whileInView={{ opacity: 1, width: "30rem" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          style={{
            backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
          }}
          className="absolute inset-auto right-1/2 h-56 overflow-visible w-[30rem] bg-gradient-conic from-cyan-500 via-transparent to-transparent text-white [--conic-position:from_70deg_at_center_top]"
        >
          <div className="absolute  w-[100%] left-0 bg-slate-950 h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
          <div className="absolute  w-40 h-[100%] left-0 bg-slate-950  bottom-0 z-20 [mask-image:linear-gradient(to_right,white,transparent)]" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0.5, width: "15rem" }}
          whileInView={{ opacity: 1, width: "30rem" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          style={{
            backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
          }}
          className="absolute inset-auto left-1/2 h-56 w-[30rem] bg-gradient-conic from-transparent via-transparent to-cyan-500 text-white [--conic-position:from_290deg_at_center_top]"
        >
          <div className="absolute  w-40 h-[100%] right-0 bg-slate-950  bottom-0 z-20 [mask-image:linear-gradient(to_left,white,transparent)]" />
          <div className="absolute  w-[100%] right-0 bg-slate-950 h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
        </motion.div>
        <div className="absolute top-1/2 h-48 w-full translate-y-12 scale-x-150 bg-slate-950 blur-2xl"></div>
        <div className="absolute top-1/2 z-50 h-48 w-full bg-transparent opacity-10 backdrop-blur-md"></div>
        <div className="absolute inset-auto z-50 h-36 w-[28rem] -translate-y-1/2 rounded-full bg-cyan-500 opacity-50 blur-3xl"></div>
        <motion.div
          initial={{ width: "8rem" }}
          whileInView={{ width: "16rem" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="absolute inset-auto z-30 h-36 w-64 -translate-y-[6rem] rounded-full bg-cyan-400 blur-2xl"
        ></motion.div>
        <motion.div
          initial={{ width: "15rem" }}
          whileInView={{ width: "30rem" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="absolute inset-auto z-50 h-0.5 w-[30rem] -translate-y-[7rem] bg-cyan-400 "
        ></motion.div>

        <div className="absolute inset-auto z-40 h-44 w-full -translate-y-[12.5rem] bg-slate-950 "></div>
      </div>

      <div className="relative z-50 flex -translate-y-80 flex-col items-center px-5">
        {children}
      </div>
    </div>
  );
};

export default function Conversation() {
  const [selectedTone, setSelectedTone] = useState("Professional");
  const [selectedLength, setSelectedLength] = useState("Moderate");
  const [enableFollowUp, setEnableFollowUp] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [performanceData, setPerformanceData] = useState(
    Array.from({ length: 24 }, (_, i) => ({ time: i, value: Math.floor(Math.random() * 100) }))
  );

  const handleMouseMove = (event: React.MouseEvent) => {
    const { clientX, clientY } = event;
    setMousePosition({ x: clientX, y: clientY });
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove as any);
    return () => window.removeEventListener('mousemove', handleMouseMove as any);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPerformanceData(prevData => {
        const newData = [...prevData.slice(1), { time: prevData.length, value: Math.floor(Math.random() * 100) }];
        return newData;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 overflow-x-hidden pt-20 pb-40">
      <LampContainer>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-200">
              AI-Powered Claims Assistant in Action
            </h2>
            <p className="text-gray-400 text-sm max-w-2xl mx-auto">
              * This demonstration showcases real-time voice-to-text transcription. The AI system automatically converts spoken dialogue into text for enhanced accessibility and documentation.
            </p>
          </div>

          <div className="flex flex-col items-center space-y-12">
            {/* Main Chat Interface */}
            <div className="w-full max-w-4xl">
              {/* MacOS Window Frame */}
              <div className="rounded-2xl overflow-hidden backdrop-blur-xl bg-gray-800/90 border border-gray-700">
                {/* Window Header */}
                <div className="px-4 py-3 bg-gray-800 border-b border-gray-700 flex items-center">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors" />
                    <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors" />
                  </div>
                  <div className="flex-1 text-center text-gray-400 text-sm font-medium">
                    Claims Processing Assistant - Active Call
                  </div>
                  <div className="w-16" />
                </div>

                {/* Content Area */}
                <div className="p-6 h-[500px] flex flex-col">
                  {/* Call Status Header */}
                  <div className="mb-8 p-4 rounded-2xl bg-gray-900/90 backdrop-blur-sm border border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <PhoneCall className="w-8 h-8 text-emerald-400" />
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
                        </div>
                        <div>
                          <h3 className="text-gray-200 font-semibold">Active Call Session</h3>
                          <p className="text-gray-400 text-sm">Duration: 3:24</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mic className="w-6 h-6 text-emerald-400 animate-pulse" />
                        <div className="flex space-x-1">
                          {[...Array(3)].map((_, i) => (
                            <div
                              key={i}
                              className="w-1 h-4 bg-emerald-400 rounded-full animate-pulse"
                              style={{
                                animationDelay: `${i * 0.2}s`,
                                height: `${(i + 1) * 8}px`
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto mb-6 space-y-6 chat-messages pr-4">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={cn(
                          "flex items-start gap-3",
                          message.isAI ? "justify-start" : "justify-end"
                        )}
                      >
                        {message.isAI && (
                          <div className="w-8 h-8 rounded-full bg-gray-700 border border-gray-600 flex items-center justify-center">
                            <Bot className="w-5 h-5 text-emerald-400" />
                          </div>
                        )}
                        <div className={cn(
                          "max-w-[75%] p-4 rounded-2xl relative group transform hover:scale-105 transition-all",
                          message.isAI
                            ? "bg-gray-700 text-gray-200"
                            : "bg-purple-700 text-gray-200"
                        )}>
                          <div className={cn(
                            "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity",
                            message.isAI
                              ? "bg-gradient-to-br from-emerald-500/10 via-purple-500/10 to-purple-500/10"
                              : "bg-gradient-to-br from-purple-500/10 via-emerald-500/10 to-emerald-500/10"
                          )} />
                          <p className="relative z-10">
                            {message.text}
                          </p>
                        </div>
                        {!message.isAI && (
                          <div className="w-8 h-8 rounded-full bg-gray-700 border border-gray-600 flex items-center justify-center">
                            <User className="w-5 h-5 text-purple-400" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Call Actions */}
                  <div className="mt-auto">
                    <div className="flex justify-center items-center space-x-8">
                      <div className="text-center">
                        <div className="p-3 rounded-full bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 transition-all cursor-pointer">
                          <Phone className="w-5 h-5 text-red-400" />
                        </div>
                        <span className="text-red-400 text-xs mt-1 block">End Call</span>
                      </div>
                    </div>
                  </div>

                  {/* Scroll Button */}
                  <button 
                    className="absolute bottom-4 right-4 p-2 bg-gray-700 rounded-full text-gray-200 hover:bg-gray-600 transition-all"
                    onClick={() => {
                      const chatContainer = document.querySelector('.chat-messages');
                      if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
                    }}
                  >
                    <ChevronDown className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Performance Metrics Section */}
            <div className="w-full max-w-sm">
              {/* Control Panel */}
              <div 
                className="relative mx-auto rounded-[3rem] overflow-hidden backdrop-blur-xl bg-gray-800/90 border-4 border-gray-700 aspect-[9/19.5] max-w-[300px]"
                style={{
                  transform: `perspective(1000px) rotateY(${(mousePosition.x - window.innerWidth/2) / 50}deg) rotateX(${(mousePosition.y - window.innerHeight/2) / 50}deg)`,
                  transition: 'transform 0.1s ease-out'
                }}
              >
                {/* Status Bar and Dynamic Island */}
                <div className="absolute top-6 left-0 right-0 flex justify-between items-center px-6 z-20">
                  <div className="text-gray-300 text-xs">9:41</div>
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-[90px] h-[24px] bg-black rounded-full flex items-center justify-center" />
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="text-gray-300">
                        <path d="M12 20.5a8.5 8.5 0 100-17 8.5 8.5 0 000 17z" />
                      </svg>
                    </div>
                    <div className="w-3 h-3">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="text-gray-300">
                        <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
                      </svg>
                    </div>
                    <div className="text-gray-300 text-xs">100%</div>
                  </div>
                </div>

                {/* Screen Content */}
                <div className="relative h-full bg-gray-900/90 px-4 pt-16 pb-8 overflow-y-auto">
                  {/* Performance Cards */}
                  <div className="grid grid-cols-1 gap-2 mb-6">
                    {performanceMetrics.map((metric, index) => (
                      <div key={index} className="p-3 rounded-xl bg-gray-800/90 border border-gray-700">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">{metric.label}</span>
                          <span className={`text-${metric.color}-400 text-sm font-semibold`}>
                            {metric.value}
                          </span>
                        </div>
                        <div className={`text-${metric.color}-400 text-xs mt-1`}>
                          {metric.trend}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Settings Sections */}
                  <div className="space-y-4">
                    {/* AI Personality */}
                    <div className="p-4 rounded-xl bg-gray-800/90 border border-gray-700">
                      <div className="flex items-center space-x-3 mb-4">
                        <BrainCircuit className="w-5 h-5 text-blue-400" />
                        <span className="text-gray-200 font-semibold">AI Personality</span>
                      </div>
                      <div className="space-y-3">
                        <button className="w-full p-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 text-left flex justify-between items-center">
                          <span>Professional</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <button className="w-full p-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 text-left flex justify-between items-center">
                          <span>Friendly</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Response Settings */}
                    <div className="p-4 rounded-xl bg-gray-800/90 border border-gray-700">
                      <div className="flex items-center space-x-3 mb-4">
                        <MessageSquare className="w-5 h-5 text-purple-400" />
                        <span className="text-gray-200 font-semibold">Response Settings</span>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Length</span>
                          <div className="flex space-x-2">
                            {["Concise", "Moderate"].map((length) => (
                              <button
                                key={length}
                                className={cn(
                                  "px-3 py-1 rounded-lg text-xs",
                                  selectedLength === length
                                    ? "bg-purple-500/20 text-purple-400"
                                    : "bg-gray-700 text-gray-400"
                                )}
                                onClick={() => setSelectedLength(length)}
                              >
                                {length}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Follow-up Toggle */}
                    <div className="p-4 rounded-xl bg-gray-800/90 border border-gray-700">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Enable Follow-up</span>
                        <div
                          className={cn(
                            "w-12 h-6 rounded-full transition-colors cursor-pointer",
                            enableFollowUp ? "bg-purple-500/50" : "bg-gray-700"
                          )}
                          onClick={() => setEnableFollowUp(!enableFollowUp)}
                        >
                          <div
                            className={cn(
                              "w-5 h-5 rounded-full bg-white transform transition-transform duration-200",
                              enableFollowUp ? "translate-x-6" : "translate-x-1"
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Knowledge Base */}
                    <div className="p-4 rounded-xl bg-gray-800/90 border border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Database className="w-5 h-5 text-emerald-400" />
                          <span className="text-gray-200 font-semibold">Knowledge Base</span>
                        </div>
                        <span className="text-gray-400 text-sm">Last updated 2h ago</span>
                      </div>
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between items-center p-2 rounded-lg bg-gray-700">
                          <span className="text-gray-300 text-sm">Claims Processing</span>
                          <span className="text-emerald-400 text-xs">Active</span>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded-lg bg-gray-700">
                          <span className="text-gray-300 text-sm">Medical Terms</span>
                          <span className="text-emerald-400 text-xs">Active</span>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded-lg bg-gray-700">
                          <span className="text-gray-300 text-sm">Company Policies</span>
                          <span className="text-emerald-400 text-xs">Active</span>
                        </div>
                      </div>
                    </div>

                    {/* Performance Metrics Graph */}
                    <div className="p-4 rounded-xl bg-gray-800/90 border border-gray-700">
                      <div className="flex items-center space-x-3 mb-4">
                        <Activity className="w-5 h-5 text-blue-400" />
                        <span className="text-gray-200 font-semibold">Performance</span>
                      </div>
                      <div className="h-32">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={performanceData}>
                            <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} dot={false} />
                            <Tooltip
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  return (
                                    <div className="bg-gray-800 p-2 rounded-lg border border-gray-700">
                                      <p className="text-gray-200 text-xs">{`Value: ${payload[0].value}`}</p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-gray-400">
                        <span>12h ago</span>
                        <span>Now</span>
                      </div>
                    </div>

                    {/* Save Button */}
                    <button className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold hover:opacity-90 transition-opacity">
                      Save Settings
                    </button>
                  </div>
                </div>

                {/* Bottom Bar */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-[30%] h-1 bg-gray-600 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </LampContainer>
    </div>
  );
}

