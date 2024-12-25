import React, { useState } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../utils/cn';
import Logo from './Logo';
import TicketInput from './TicketInput';
import ChatInterface from './ChatInterface';

export default function ClientChat() {
  const { isDark } = useTheme();
  const [isVerified, setIsVerified] = useState(false);
  const [ticketCode, setTicketCode] = useState('');
  const [error, setError] = useState('');

  const handleVerification = (code: string) => {
    setError('');
    // For demo, accept '123' as valid code
    if (code === '123') {
      setIsVerified(true);
      setTicketCode(code);
    } else {
      setError('Invalid ticket code');
    }
  };

  return (
    <div className="min-h-screen bg-[rgb(10,10,10)]">
      {/* Background Gradients */}
      <div className="fixed inset-0">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] opacity-30 rounded-full bg-gradient-to-b from-purple-500/30 via-purple-500/10 to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] opacity-30 rounded-full bg-gradient-to-t from-blue-500/30 via-blue-500/10 to-transparent blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Logo */}
        <div className="flex justify-center mb-12">
          <Logo />
        </div>

        {/* Main Container */}
        <div className={cn(
          "max-w-2xl mx-auto",
          "rounded-2xl overflow-hidden",
          "border backdrop-blur-xl",
          isDark 
            ? "bg-black/40 border-white/10" 
            : "bg-white/40 border-black/10"
        )}>
          {!isVerified ? (
            <div className="p-6 md:p-8">
              <div className="text-center mb-8">
                <h1 className={cn(
                  "text-2xl font-bold mb-2",
                  isDark ? "text-white" : "text-black"
                )}>
                  Welcome to Support
                </h1>
                <p className={isDark ? "text-white/60" : "text-black/60"}>
                  Please enter your support ticket code to continue
                </p>
              </div>
              <TicketInput onSubmit={handleVerification} error={error} />
            </div>
          ) : (
            <ChatInterface ticketCode={ticketCode} />
          )}
        </div>
      </div>
    </div>
  );
}