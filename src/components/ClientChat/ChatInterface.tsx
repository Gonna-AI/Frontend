import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, GalleryVerticalEnd } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../utils/cn';
import { motion } from 'framer-motion';

interface Message {
  text: string;
  isUser: boolean;
}

interface ChatInterfaceProps {
  ticketCode: string;
}

export default function ChatInterface({ ticketCode }: ChatInterfaceProps) {
  const { isDark } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    setMessages([
      {
        text: `Welcome! How can I help you today?`,
        isUser: false
      }
    ]);
  }, [ticketCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage: Message = { text: inputMessage, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await axios.post('http://localhost:5000/api/chat', 
        { 
          message: inputMessage,
          ticketCode: ticketCode
        }, 
        { withCredentials: true }
      );
      
      const aiMessage: Message = { text: response.data.response, isUser: false };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = { 
        text: 'Sorry, I encountered an error. Please try again.',
        isUser: false 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col items-stretch justify-start p-2">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full h-full flex flex-col gap-4"
      >
        <a href="/" className="flex items-center gap-2 self-center py-4 font-medium text-purple-600">
          <div className={cn(
            "flex h-8 w-8 items-center justify-center rounded-md",
            isDark ? "bg-purple-600" : "bg-purple-500"
          )}>
            <GalleryVerticalEnd className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl">Chat</span>
        </a>

        <div className={cn(
          "flex flex-col gap-4 rounded-xl overflow-hidden min-h-[90vh] border",
          isDark ? "bg-black/40 border-white/10" : "bg-white border-gray-200",
          "backdrop-blur-lg"
        )}>
          {/* Chat Header */}
          <div className={cn(
            "p-8 text-center border-b",
            isDark ? "border-white/10" : "border-gray-200"
          )}>
            <h2 className={cn(
              "text-3xl font-semibold",
              isDark ? "text-white" : "text-gray-900"
            )}>
              Gonna AI Support
            </h2>
            <p className={cn(
              "text-lg mt-2",
              isDark ? "text-gray-400" : "text-gray-600"
            )}>
              Ticket: {ticketCode}
            </p>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex",
                  message.isUser ? "justify-end" : "justify-start"
                )}
              >
                <div className={cn(
                  "max-w-3xl px-6 py-4 rounded-xl text-lg",
                  message.isUser
                    ? "bg-purple-500 text-white"
                    : isDark
                      ? "bg-gray-800/50 text-white"
                      : "bg-gray-100 text-gray-900"
                )}>
                  {message.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className={cn(
                  "px-6 py-4 rounded-xl text-lg",
                  isDark
                    ? "bg-gray-800/50 text-white"
                    : "bg-gray-100 text-gray-900"
                )}>
                  Typing...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form 
            onSubmit={handleSubmit}
            className={cn(
              "px-8 py-6 border-t",
              isDark ? "border-white/10" : "border-gray-200"
            )}
          >
            <div className="flex gap-4 max-w-6xl mx-auto">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                className={cn(
                  "flex-1 px-6 py-4 rounded-xl text-lg focus:ring-2 focus:ring-purple-500/30 focus:outline-none",
                  isDark 
                    ? "bg-gray-800/50 text-white placeholder-gray-500 border-gray-700/50"
                    : "bg-gray-50 text-gray-900 placeholder-gray-500 border border-gray-200"
                )}
              />
              <button
                type="submit"
                disabled={isTyping}
                className={cn(
                  "px-8 py-4 rounded-xl transition-colors flex items-center justify-center",
                  isDark
                    ? "bg-purple-600 text-white hover:bg-purple-700 disabled:bg-purple-800 disabled:text-gray-300"
                    : "bg-purple-500 text-white hover:bg-purple-600 disabled:bg-purple-300 disabled:text-gray-100"
                )}
              >
                <Send className="w-6 h-6" />
              </button>
            </div>
          </form>
        </div>

        <div className={cn(
          "text-center text-sm py-4",
          isDark ? "text-gray-400" : "text-gray-600"
        )}>
          Powered by gonna.ai &copy; 2023
        </div>
      </motion.div>
    </div>
  );
}