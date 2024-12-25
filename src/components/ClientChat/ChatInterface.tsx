import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../utils/cn';

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
    // Add initial welcome message
    setMessages([
      {
        text: `Welcome! Your ticket code is ${ticketCode}. How can I help you today?`,
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
    <div className="h-[80vh] flex flex-col">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              "flex",
              message.isUser ? "justify-end" : "justify-start"
            )}
          >
            <div className={cn(
              "max-w-[80%] px-4 py-2 rounded-lg",
              message.isUser
                ? isDark
                  ? "bg-blue-500/20 text-white"
                  : "bg-blue-500/20 text-black"
                : isDark
                  ? "bg-white/10 text-white"
                  : "bg-black/10 text-black"
            )}>
              {message.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className={cn(
              "px-4 py-2 rounded-lg",
              isDark
                ? "bg-white/10 text-white"
                : "bg-black/10 text-black"
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
          "p-4 border-t",
          isDark ? "border-white/10" : "border-black/10"
        )}
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className={cn(
              "flex-1 px-4 py-2 rounded-lg",
              "transition-colors duration-200",
              "focus:outline-none focus:ring-2",
              isDark
                ? "bg-white/5 border border-white/10 text-white placeholder-white/30 focus:ring-white/20"
                : "bg-black/5 border border-black/10 text-black placeholder-black/30 focus:ring-black/20"
            )}
          />
          <button
            type="submit"
            disabled={isTyping}
            className={cn(
              "px-4 py-2 rounded-lg",
              "transition-colors duration-200",
              "flex items-center gap-2",
              isDark
                ? "bg-white/10 hover:bg-white/20 text-white disabled:opacity-50"
                : "bg-black/10 hover:bg-black/20 text-black disabled:opacity-50"
            )}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}