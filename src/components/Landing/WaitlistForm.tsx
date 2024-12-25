import React, { useState, useEffect } from 'react';
import { cn } from '../../utils/cn';

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // Debounced email update
  useEffect(() => {
    const timer = setTimeout(() => {
      setEmail(inputValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    console.log("Submitted email:", email);
    setIsSubmitted(true);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
      {!isSubmitted ? (
        <div className="flex flex-col items-center gap-4">
          <input
            type="email"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="johndoe@example.com"
            className="w-full px-4 py-2 text-white bg-white/10 rounded-lg backdrop-blur-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
            required
          />
          <button
            type="submit"
            className="w-full px-4 py-2 bg-white text-black font-semibold rounded-lg hover:bg-black hover:text-white transition-colors"
          >
            Join the waitlist
          </button>
        </div>
      ) : (
        <p className="text-white text-center">Thank you for joining the waitlist!</p>
      )}
    </form>
  );
}