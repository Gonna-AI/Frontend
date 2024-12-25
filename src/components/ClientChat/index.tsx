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

  const handleVerification = (code) => {
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
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 opacity-20 rounded-full bg-gradient-to-b from-blue-200 via-blue-100 to-transparent blur-2xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 opacity-20 rounded-full bg-gradient-to-t from-purple-200 via-purple-100 to-transparent blur-2xl" />
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
          "shadow-xl",
          "bg-white border border-gray-200",
          "backdrop-blur-lg"
        )}>
          {!isVerified ? (
            <div className="p-6 md:p-8">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold mb-2 text-gray-900">
                  Welcome to Support
                </h1>
                <p className="text-gray-600">
                  Please enter your support ticket code to continue
                </p>
              </div>
              <TicketInput onSubmit={handleVerification} error={error} />
            </div>
          ) : (
            <ChatInterface ticketCode={ticketCode} />
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          Need help? Contact our support team
        </div>
      </div>
    </div>
  );
}