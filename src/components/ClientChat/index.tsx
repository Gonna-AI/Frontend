import { useState, useEffect } from "react";
import { cn } from "../../utils/cn";
import Logo from "./Logo";
import TicketInput from "./TicketInput";
import ChatInterface from "./ChatInterface";
import ThemeToggle from "./ThemeToggle";
import { ticketApi, setTicketHeader } from "../../config/api";

export default function ClientChat() {
  const [isVerified, setIsVerified] = useState(() => {
    // Initialize from localStorage
    const savedVerification = localStorage.getItem("ticketVerification");
    return savedVerification === "true";
  });

  const [ticketCode, setTicketCode] = useState(() => {
    // Initialize from localStorage
    return localStorage.getItem("ticketCode") || "";
  });

  const [error, setError] = useState("");
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("clientChatTheme");
    return saved ? saved === "dark" : true;
  });

  useEffect(() => {
    // If there's a saved ticket, restore the API header
    const savedTicket = localStorage.getItem("ticketCode");
    if (savedTicket) {
      setTicketHeader(savedTicket);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem("clientChatTheme", newTheme ? "dark" : "light");
  };

  const handleVerification = async (code: string) => {
    setError("");
    try {
      const response = await ticketApi.validate(code);
      if (response.data.valid) {
        setTicketHeader(code);
        setIsVerified(true);
        setTicketCode(code);
        // Save to localStorage
        localStorage.setItem("ticketVerification", "true");
        localStorage.setItem("ticketCode", code);
      } else {
        setError("Invalid ticket code");
      }
    } catch (err) {
      console.error("Ticket validation failed:", err);
      setError("Failed to validate ticket");
    }
  };

  const handleLogout = () => {
    setIsVerified(false);
    setTicketCode("");
    // Clear localStorage
    localStorage.removeItem("ticketVerification");
    localStorage.removeItem("ticketCode");
    setTicketHeader(""); // Clear the API header
  };

  return (
    <div
      className={cn(
        "min-h-screen w-full transition-colors duration-300",
        isDark
          ? "bg-gradient-to-br from-gray-900 to-black"
          : "bg-gradient-to-br from-gray-50 to-white",
      )}
    >
      {/* Theme Toggle */}
      <ThemeToggle isDark={isDark} onToggle={toggleTheme} />

      {!isVerified ? (
        // Ticket Verification Screen
        <div className="relative z-10 container mx-auto px-4 py-8">
          {/* Logo */}
          <div className="flex justify-center mb-12">
            <Logo isDark={isDark} />
          </div>

          {/* Verification Container */}
          <div
            className={cn(
              "max-w-2xl mx-auto",
              "rounded-2xl overflow-hidden",
              "shadow-xl",
              isDark
                ? "bg-black/40 border border-white/10"
                : "bg-white/80 border border-black/10",
              "backdrop-blur-lg",
            )}
          >
            <div className="p-6 md:p-8">
              <div className="text-center mb-8">
                <h1
                  className={cn(
                    "text-2xl font-bold mb-2",
                    isDark ? "text-white" : "text-gray-900",
                  )}
                >
                  Welcome to Support
                </h1>
                <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                  Please enter your support ticket code to continue
                </p>
              </div>
              <TicketInput
                onSubmit={handleVerification}
                error={error}
                isDark={isDark}
              />
            </div>
          </div>

          {/* Footer */}
          <div
            className={cn(
              "text-center mt-8 text-sm",
              isDark ? "text-gray-400" : "text-gray-500",
            )}
          >
            Need help? Email us at{" "}
            <a
              href="mailto:team@clerktree.com"
              className="underline hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              team@clerktree.com
            </a>
          </div>
        </div>
      ) : (
        // Chat Interface - Full Width on Desktop
        <div className="h-screen flex flex-col">
          <ChatInterface
            ticketCode={ticketCode}
            isDark={isDark}
            onLogout={handleLogout}
          />
        </div>
      )}
    </div>
  );
}
