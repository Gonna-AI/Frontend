"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { Phone, PhoneCall, Bot, User, Mic, Clock, Calendar, Settings, Database, MessageSquare, Sliders, Activity, VolumeIcon as VolumeUp, BrainCircuit, ChevronRight, BarChart4, Sparkles, Shield, Zap, Gauge } from 'lucide-react';
import { LineChart, Line, Tooltip, ResponsiveContainer } from 'recharts';

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

export default function Conversation() {
  const [selectedTone, setSelectedTone] = useState("Professional");
  const [selectedLength, setSelectedLength] = useState("Moderate");
  const [enableFollowUp, setEnableFollowUp] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [performanceData, setPerformanceData] = useState(
    Array.from({ length: 24 }, (_, i) => ({ time: i, value: Math.floor(Math.random() * 100) }))
  );

  const handleMouseMove = (event) => {
    const { clientX, clientY } = event;
    setMousePosition({ x: clientX, y: clientY });
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
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
    <div className="relative bg-black min-h-screen">
      <div className="py-20 px-6">
        {/* Main Chat Interface */}
        <div className="relative">
          {/* Gradient Background */}
          <div className="absolute top-0 left-0 w-[45rem] h-[45rem] bg-gradient-to-br from-emerald-600/20 via-purple-500/20 to-transparent blur-2xl" />
          <div className="absolute bottom-0 right-0 w-[35rem] h-[35rem] bg-gradient-to-tl from-purple-600/20 via-emerald-500/20 to-transparent blur-3xl" />

          <div className="relative z-10 max-w-4xl mx-auto">
            {/* MacOS Window Frame */}
            <div className="rounded-2xl overflow-hidden backdrop-blur-xl bg-white/5 border border-white/10">
              {/* Window Header */}
              <div className="px-4 py-3 bg-black/40 border-b border-white/5 flex items-center">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors" />
                  <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors" />
                </div>
                <div className="flex-1 text-center text-white/40 text-sm font-medium">
                  Claims Processing Assistant - Active Call
                </div>
                <div className="w-16" />
              </div>

              {/* Content Area */}
              <div className="p-8">
                {/* Call Status Header */}
                <div className="mb-8 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <PhoneCall className="w-8 h-8 text-emerald-400" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">Active Call Session</h3>
                        <p className="text-white/60 text-sm">Duration: 3:24</p>
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

                <h2 className="text-3xl font-bold text-center mb-4 text-white">
                  AI-Powered Claims Assistant in Action
                </h2>
                
                <p className="text-white/60 text-center mb-12 text-sm">
                  * This demonstration showcases real-time voice-to-text transcription. The AI system automatically converts spoken dialogue into text for enhanced accessibility and documentation.
                </p>

                {/* Chat Messages */}
                <div className="space-y-6">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex items-start gap-3",
                        message.isAI ? "justify-start" : "justify-end"
                      )}
                    >
                      {message.isAI && (
                        <div className="w-8 h-8 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                          <Bot className="w-5 h-5 text-emerald-400" />
                        </div>
                      )}
                      <div className={cn(
                        "max-w-[75%] p-4 rounded-2xl relative group transform hover:scale-105 transition-all backdrop-blur-sm border border-white/10",
                        message.isAI
                          ? "bg-gray-800/80 hover:bg-gray-800/90"
                          : "bg-purple-900/80 hover:bg-purple-900/90"
                      )}>
                        <div className={cn(
                          "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity",
                          message.isAI
                            ? "bg-gradient-to-br from-emerald-500/10 via-purple-500/10 to-purple-500/10"
                            : "bg-gradient-to-br from-purple-500/10 via-emerald-500/10 to-emerald-500/10"
                        )} />
                        <p className="relative z-10 text-gray-100">
                          {message.text}
                        </p>
                      </div>
                      {!message.isAI && (
                        <div className="w-8 h-8 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                          <User className="w-5 h-5 text-purple-400" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Call Actions */}
                <div className="mt-8">
                  <div className="flex justify-center items-center space-x-8">
                    <div className="p-3 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    
                    <div className="text-center">
                      <div className="p-3 rounded-full bg-red-500/20 backdrop-blur-sm border border-red-500/30 hover:bg-red-500/30 transition-all cursor-pointer">
                        <Phone className="w-5 h-5 text-red-400" />
                      </div>
                      <span className="text-red-400 text-xs mt-1 block">End Call</span>
                    </div>
                    
                    <div className="p-3 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* iPhone Admin Panel Section */}
        <div className="relative z-10 max-w-lg mx-auto mt-32">
          <h2 className="text-4xl font-bold text-center mb-4 text-white">
            AI Assistant Control Panel
          </h2>
          <p className="text-white/60 text-center mb-16 text-lg">
            Fine-tune your AI assistant's behavior and monitor performance metrics
          </p>

          {/* iPhone Frame */}
          <div 
            className="relative mx-auto rounded-[3rem] overflow-hidden backdrop-blur-xl bg-white/5 border-4 border-white/20 aspect-[9/19.5] max-w-[300px]"
            style={{
              transform: `perspective(1000px) rotateY(${(mousePosition.x - window.innerWidth/2) / 50}deg) rotateX(${(mousePosition.y - window.innerHeight/2) / 50}deg)`,
              transition: 'transform 0.1s ease-out'
            }}
          >
            {/* iPhone Status Bar */}
            <div className="absolute top-0 left-0 right-0 flex justify-between items-center px-6 py-2 text-white text-xs z-30">
              <div>9:41</div>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 20.5a8.5 8.5 0 100-17 8.5 8.5 0 000 17z" />
                  </svg>
                </div>
                <div className="w-4 h-4">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
                  </svg>
                </div>
                <div>100%</div>
              </div>
            </div>

            {/* Dynamic Island */}
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-[120px] h-[35px] bg-black rounded-full flex items-center justify-center z-20">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-[10px] text-white/60">Donna.AI</span>
              </div>
            </div>

            {/* Screen Content */}
            <div className="relative h-full bg-black/40 px-4 pt-14 pb-8 overflow-y-auto">
              {/* Performance Cards */}
              <div className="grid grid-cols-1 gap-2 mb-6">
                {performanceMetrics.map((metric, index) => (
                  <div key={index} className="p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                    <div className="flex justify-between items-center">
                      <span className="text-white/60 text-sm">{metric.label}</span>
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
                <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                  <div className="flex items-center space-x-3 mb-4">
                    <BrainCircuit className="w-5 h-5 text-blue-400" />
                    <span className="text-white font-semibold">AI Personality</span>
                  </div>
                  <div className="space-y-3">
                    <button className="w-full p-3 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 text-left flex justify-between items-center">
                      <span>Professional</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button className="w-full p-3 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 text-left flex justify-between items-center">
                      <span>Friendly</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Response Settings */}
                <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                  <div className="flex items-center space-x-3 mb-4">
                    <MessageSquare className="w-5 h-5 text-purple-400" />
                    <span className="text-white font-semibold">Response Settings</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">Length</span>
                      <div className="flex space-x-2">
                        {["Concise", "Moderate"].map((length) => (
                          <button
                            key={length}
                            className={cn(
                              "px-3 py-1 rounded-lg text-xs",
                              selectedLength === length
                                ? "bg-purple-500/20 text-purple-400"
                                : "bg-white/5 text-white/60"
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
                <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Enable Follow-up</span>
                    <div
                      className={cn(
                        "w-12 h-6 rounded-full transition-colors cursor-pointer",
                        enableFollowUp ? "bg-purple-500/50" : "bg-white/10"
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
                <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Database className="w-5 h-5 text-emerald-400" />
                      <span className="text-white font-semibold">Knowledge Base</span>
                    </div>
                    <span className="text-white/40 text-sm">Last updated 2h ago</span>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between items-center p-2 rounded-lg bg-white/5">
                      <span className="text-white/60 text-sm">Claims Processing</span>
                      <span className="text-emerald-400 text-xs">Active</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg bg-white/5">
                      <span className="text-white/60 text-sm">Medical Terms</span>
                      <span className="text-emerald-400 text-xs">Active</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg bg-white/5">
                      <span className="text-white/60 text-sm">Company Policies</span>
                      <span className="text-emerald-400 text-xs">Active</span>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics Graph */}
                <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                  <div className="flex items-center space-x-3 mb-4">
                    <Activity className="w-5 h-5 text-blue-400" />
                    <span className="text-white font-semibold">Performance</span>
                  </div>
                  <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={performanceData}>
                        <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} dot={false} />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white/10 backdrop-blur-sm p-2 rounded-lg border border-white/20">
                                  <p className="text-white text-xs">{`Value: ${payload[0].value}`}</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-white/40">
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
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-[40%] h-1 bg-white/20 rounded-full" />
          </div>

          {/* Mouse-following glow effect */}
          <div 
            className="absolute w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"
            style={{
              left: mousePosition.x - 128,
              top: mousePosition.y - 128,
              transition: 'all 0.1s ease-out'
            }}
          />
        </div>
      </div>
    </div>
  );
}

