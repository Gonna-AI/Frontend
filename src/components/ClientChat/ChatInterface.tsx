import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, GalleryVerticalEnd, Phone, Upload } from 'lucide-react';
import { cn } from '../../utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import CallWindow from './CallWindow';

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
}

export default function ChatInterface({ ticketCode, isDark }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isCallWindowOpen, setIsCallWindowOpen] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

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
      const response = await axios.post('http://localhost:5000/api/chat', 
        { 
          message: inputMessage,
          ticketCode: ticketCode
        }, 
        { 
          withCredentials: true,
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
      
      const formData = new FormData();
      formData.append('image', file);
      formData.append('ticketCode', ticketCode);

      const imageUrl = URL.createObjectURL(file);
      
      const userMessage: Message = {
        text: `Uploaded image: ${file.name}`,
        isUser: true,
        image: {
          name: file.name,
          url: imageUrl
        }
      };
      setMessages(prev => [...prev, userMessage]);
      setIsTyping(true);

      const response = await axios.post('http://localhost:5000/api/upload-image',
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      const aiMessage: Message = { text: response.data.response, isUser: false };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error uploading image:', error);
      const errorMessage: Message = {
        text: error instanceof Error ? error.message : 'Sorry, I encountered an error uploading the image. Please try again.',
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
              Gonna Support
            </h1>
            <p className={cn(
              "text-sm",
              isDark ? "text-white/60" : "text-black/60"
            )}>
              Ticket: {ticketCode}
            </p>
          </div>
        </div>
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
              "max-w-3xl px-6 py-4 rounded-xl text-base md:text-lg",
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
        "border-t p-4 md:p-6",
        isDark 
          ? "bg-black/20 border-white/10" 
          : "bg-white/10 border-black/10"
      )}>
        <form 
          onSubmit={handleSubmit}
          className="max-w-6xl mx-auto flex gap-4"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className={cn(
              "flex-1 px-6 py-4 rounded-xl text-base md:text-lg",
              "focus:ring-2 focus:ring-purple-500/30 focus:outline-none",
              isDark 
                ? "bg-black/20 border border-white/10 text-white placeholder-white/40" 
                : "bg-white/10 border border-black/10 text-black placeholder-black/40"
            )}
          />
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
            type="submit"
            disabled={isTyping}
            className={cn(
              "px-8 py-4 rounded-xl transition-colors flex items-center justify-center",
              isDark
                ? "bg-black/20 border border-white/10 text-white hover:bg-black/30 disabled:opacity-50"
                : "bg-white/10 border border-black/10 text-black hover:bg-white/20 disabled:opacity-50"
            )}
          >
            <Send className="w-6 h-6" />
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
          />
        )}
      </AnimatePresence>
    </div>
  );
}