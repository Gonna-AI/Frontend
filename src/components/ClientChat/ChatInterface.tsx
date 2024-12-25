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
    <div className={cn(
      "h-[80vh] flex flex-col",
      isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900"
    )}>
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
                  ? "bg-blue-600 text-white"
                  : "bg-blue-500 text-white"
                : isDark
                  ? "bg-gray-700 text-white"
                  : "bg-gray-200 text-gray-900"
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
                ? "bg-gray-700 text-white"
                : "bg-gray-200 text-gray-900"
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
          isDark ? "border-gray-700" : "border-gray-200"
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
                ? "bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:ring-blue-500"
                : "bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500"
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
                ? "bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-800 disabled:text-gray-300"
                : "bg-blue-500 hover:bg-blue-600 text-white disabled:bg-blue-300 disabled:text-gray-100"
            )}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

