import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

interface Message {
  text: string;
  isUser: boolean;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage: Message = { text: inputMessage, isUser: true };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await axios.post('https://backend-sq0u.onrender.com/api/chat', { message: inputMessage }, {
        withCredentials: true
      });
      const aiMessage: Message = { text: response.data.response, isUser: false };
      setMessages(prevMessages => [...prevMessages, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = { text: 'Error: Unable to get response from AI.', isUser: false };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`mb-4 ${message.isUser ? 'text-right' : 'text-left'}`}
          >
            <span 
              className={`inline-block p-2 rounded-lg ${
                message.isUser ? 'bg-blue-500 text-white' : 'bg-white/10 text-white'
              }`}
            >
              {message.text}
            </span>
          </div>
        ))}
        {isTyping && (
          <div className="text-left mb-4">
            <span className="inline-block p-2 rounded-lg bg-white/10 text-white">
              AI is typing...
            </span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-4 bg-white/5 backdrop-blur-sm">
        <div className="flex">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1 border rounded-l-lg p-2 bg-white/10 text-white placeholder-white/50"
            placeholder="Type your message..."
          />
          <button 
            type="submit" 
            className="bg-blue-500 text-white p-2 rounded-r-lg"
            disabled={isTyping}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;

