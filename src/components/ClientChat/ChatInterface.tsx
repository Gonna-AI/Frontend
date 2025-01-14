import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, GalleryVerticalEnd, Phone, Upload, FileCode2, MoreVertical } from 'lucide-react';
import { cn } from '../../utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import CallWindow from './CallWindow';
import api, { API_BASE_URL, documentApi } from '../../config/api';  // Import the configured api instance
import { useNavigate } from 'react-router-dom';

interface Message {
  text: string;
  isUser: boolean;
  image?: {
    name: string;
    url: string;
  };
}

interface ChatInterfaceProps {
  ticketCode: string;
  isDark: boolean;
  onLogout?: () => void;
}

export default function ChatInterface({ ticketCode, isDark, onLogout }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isCallWindowOpen, setIsCallWindowOpen] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

    abortControllerRef.current = new AbortController();

    try {
      const response = await api.post('/api/chat', 
        { 
          message: inputMessage,
          ticketCode: ticketCode
        }, 
        { 
          signal: abortControllerRef.current.signal
        }
      );
      
      const aiMessage: Message = { text: response.data.response, isUser: false };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Request canceled:', error.message);
      } else {
        console.error('Error sending message:', error);
        const errorMessage: Message = { 
          text: 'Sorry, I encountered an error. Please try again.',
          isUser: false 
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } finally {
      setIsTyping(false);
      abortControllerRef.current = null;
    }
  };

  const handleCallButtonClick = () => {
    setIsCallWindowOpen(true);
  };

  const handleStopAI = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsTyping(false);
    }
    setMessages(prev => [...prev, { text: "AI response stopped. You can ask another question.", isUser: false }]);
  };

  const validateImageFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Please upload only image files (JPEG, PNG, GIF, or WebP)');
    }
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('Image size should be less than 10MB');
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      validateImageFile(file);
      
      const userMessage: Message = {
        text: `Uploaded image: ${file.name}`,
        isUser: true,
        image: {
          name: file.name,
          url: URL.createObjectURL(file)
        }
      };
      setMessages(prev => [...prev, userMessage]);
      setIsTyping(true);

      const response = await documentApi.analyzeDocument(file);
      
      const aiMessage: Message = { text: response.data.analysis, isUser: false };
      setMessages(prev => [...prev, aiMessage]);

      if (response.data.audio_url) {
        const audio = new Audio(`${API_BASE_URL}${response.data.audio_url}`);
        audio.play();
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      const errorMessage: Message = {
        text: error instanceof Error ? error.message : 'Sorry, I encountered an error uploading the image.',
        isUser: false
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
      event.target.value = '';
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between px-6 py-4 border-b",
        isDark 
          ? "bg-black/20 border-white/10" 
          : "bg-white/10 border-black/10"
      )}>
        <div className="flex items-center gap-4">
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg",
            isDark 
              ? "bg-black/20 border border-white/10" 
              : "bg-white/10 border border-black/10"
          )}>
            <GalleryVerticalEnd className={cn(
              "h-6 w-6",
              isDark ? "text-purple-400" : "text-purple-600"
            )} />
          </div>
          <div>
            <h1 className={cn(
              "text-xl font-semibold",
              isDark ? "text-white" : "text-black"
            )}>
              Clerk Tree Support
            </h1>
            <p className={cn(
              "text-sm",
              isDark ? "text-white/60" : "text-black/60"
            )}>
              Ticket: {ticketCode}
            </p>
          </div>
        </div>
        
        {/* Add logout button */}
        {onLogout && (
          <button
            onClick={onLogout}
            className={cn(
              "px-4 py-2 rounded-lg transition-colors",
              isDark
                ? "bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30"
                : "bg-red-500/10 border border-red-500/20 text-red-600 hover:bg-red-500/20"
            )}
          >
            Logout
          </button>
        )}
      </div>

      {/* Messages */}
      <div className={cn(
        "flex-1 overflow-y-auto p-6 space-y-6",
        isDark 
          ? "bg-black/20" 
          : "bg-white/10"
      )}>
        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              "flex",
              message.isUser ? "justify-end" : "justify-start"
            )}
          >
            <div className={cn(
              "max-w-3xl px-6 py-4 rounded-xl text-base md:text-lg whitespace-pre-line",
              message.isUser
                ? isDark
                  ? "bg-black/20 border border-white/10 text-white"
                  : "bg-white/10 border border-black/10 text-black"
                : isDark
                  ? "bg-black/20 border border-white/10 text-white"
                  : "bg-white/10 border border-black/10 text-black"
            )}>
              {message.text}
              {message.image && (
                <div className="mt-2">
                  <img 
                    src={message.image.url} 
                    alt={message.image.name}
                    className="max-w-full rounded-lg max-h-64 object-contain"
                  />
                  <div className={cn(
                    "mt-1 text-sm",
                    isDark ? "text-white/60" : "text-black/60"
                  )}>
                    {message.image.name}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className={cn(
              "px-6 py-4 rounded-xl text-base md:text-lg",
              isDark
                ? "bg-black/20 border border-white/10 text-white"
                : "bg-white/10 border border-black/10 text-black"
            )}>
              Typing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className={cn(
        "border-t p-2 md:p-6",
        isDark 
          ? "bg-black/20 border-white/10" 
          : "bg-white/10 border-black/10"
      )}>
        <form 
          onSubmit={handleSubmit}
          className="max-w-6xl mx-auto flex gap-2 md:gap-4 relative"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className={cn(
              "flex-1 px-3 py-2 md:px-6 md:py-4 rounded-xl text-sm md:text-lg",
              "focus:ring-2 focus:ring-purple-500/30 focus:outline-none",
              isDark 
                ? "bg-black/20 border border-white/10 text-white placeholder-white/40" 
                : "bg-white/10 border border-black/10 text-black placeholder-black/40"
            )}
          />

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={cn(
              "md:hidden px-3 py-2 rounded-xl transition-colors flex items-center justify-center",
              isDark
                ? "bg-black/20 border border-white/10 text-white hover:bg-black/30"
                : "bg-white/10 border border-black/10 text-black hover:bg-white/20"
            )}
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {/* Mobile expandable menu */}
          {isMenuOpen && (
            <div className="absolute bottom-full right-0 mb-2 p-2 rounded-xl flex flex-col gap-2 md:hidden
              bg-black/90 border border-white/10">
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleFileButtonClick}
                  className="p-2 rounded-lg hover:bg-white/10 text-white"
                >
                  <Upload className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleCallButtonClick}
                  className="p-2 rounded-lg hover:bg-white/10 text-white"
                >
                  <Phone className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/smart-contracts')}
                  className="p-2 rounded-lg hover:bg-white/10 text-white"
                >
                  <FileCode2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Desktop buttons - hidden on mobile */}
          <div className="hidden md:flex gap-4">
            <button
              type="button"
              onClick={handleFileButtonClick}
              className={cn(
                "px-4 py-4 rounded-xl transition-colors flex items-center justify-center",
                isDark
                  ? "bg-black/20 border border-white/10 text-white hover:bg-black/30"
                  : "bg-white/10 border border-black/10 text-black hover:bg-white/20"
              )}
            >
              <Upload className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={handleCallButtonClick}
              className={cn(
                "px-4 py-4 rounded-xl transition-colors flex items-center justify-center",
                isDark
                  ? "bg-black/20 border border-white/10 text-white hover:bg-black/30"
                  : "bg-white/10 border border-black/10 text-black hover:bg-white/20"
              )}
            >
              <Phone className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/smart-contracts')}
              className={cn(
                "px-4 py-4 rounded-xl transition-colors flex items-center justify-center",
                "bg-gradient-to-r from-blue-500/20 via-blue-500/30 to-blue-400/20",
                "hover:from-blue-500/30 hover:via-blue-500/40 hover:to-blue-400/30",
                "border border-blue-500/30",
                "text-blue-300"
              )}
            >
              <FileCode2 className="w-6 h-6" />
            </button>
          </div>

          <button
            type="submit"
            disabled={isTyping}
            className={cn(
              "px-3 py-2 md:px-8 md:py-4 rounded-xl transition-colors flex items-center justify-center",
              isDark
                ? "bg-black/20 border border-white/10 text-white hover:bg-black/30 disabled:opacity-50"
                : "bg-white/10 border border-black/10 text-black hover:bg-white/20 disabled:opacity-50"
            )}
          >
            <Send className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </form>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/jpeg,image/png,image/gif,image/webp"
        />
      </div>

      {/* Call Window */}
      <AnimatePresence>
        {isCallWindowOpen && (
          <CallWindow
            isDark={isDark}
            onClose={() => setIsCallWindowOpen(false)}
            onStopAI={handleStopAI}
            onFileUpload={handleImageUpload}
            ticketCode={ticketCode}
          />
        )}
      </AnimatePresence>
    </div>
  );
}