'use client'

import React, { useState, useEffect } from 'react';
import { Menu, Bell } from 'lucide-react';
import DatePicker from '../DatePicker';
import { cn } from '../../utils/cn';
import { useTheme } from '../../hooks/useTheme';
import { motion, AnimatePresence } from 'framer-motion';
import AnalogClock from '../AnalogClock';

interface HeaderProps {
  onMobileMenuClick: () => void;
}

// Mock notifications data - In the future, this would come from your API
const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    title: "New Message",
    description: "Sarah sent you a new message about the project",
    type: "message",
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    read: false
  },
  {
    id: 2,
    title: "Task Completed",
    description: "AI Training model has finished processing",
    type: "task",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    read: false
  },
  {
    id: 3,
    title: "System Update",
    description: "New features have been deployed to production",
    type: "system",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: true
  }
];

export default function Header({ onMobileMenuClick }: HeaderProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { isDark } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format relative time
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 1000 / 60);
    
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  // Mark notification as read
  const handleNotificationClick = (id: number) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  return (
    <>
      <header className={cn(
        "fixed top-0 left-0 right-0 z-40",
        "h-16 md:h-20 flex items-center justify-between px-4 md:px-6",
        "transition-all duration-300",
        isDark
          ? "bg-black/60"
          : "bg-white/60",
        "border-b border-white/5",
        "backdrop-blur-[6px]",
        "shadow-sm"
      )}>
        <div className="flex items-center justify-between w-full relative z-10">
          {/* Mobile: Menu Button */}
          <div className="md:hidden">
            <button
              onClick={onMobileMenuClick}
              className={cn(
                "p-3 rounded-lg transition-colors",
                "bg-white/5 hover:bg-white/10 backdrop-blur-sm",
                "relative overflow-hidden",
                isDark ? "text-white" : "text-gray-800"
              )}
            >
              <Menu className="w-6 h-6 relative z-10" />
            </button>
          </div>

          {/* Desktop: Logo */}
          <div className="hidden md:flex items-center space-x-2">
            <span className={cn(
              "text-xl md:text-2xl font-bold",
              isDark ? "text-white" : "text-black"
            )}>
              gonna.ai
            </span>
          </div>

          {/* Mobile: Empty space */}
          <div className="flex-1 md:hidden" />

          {/* Notification and Clock Container */}
          <div className="flex items-center gap-3">
            {/* Notification Button */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={cn(
                "p-3 rounded-lg transition-colors",
                "bg-white/5 hover:bg-white/10 backdrop-blur-sm",
                "relative overflow-hidden",
                isDark ? "text-white" : "text-gray-800"
              )}
            >
              <Bell className="w-6 h-6 relative z-10" />
            </button>

            {/* Clock Button */}
            <div
              onClick={() => setShowCalendar(!showCalendar)}
              className={cn(
                "flex items-center justify-center cursor-pointer",
                "p-3 rounded-lg",
                "transition-all duration-300",
                "relative",
                "bg-white/5 hover:bg-white/10",
                "backdrop-blur-sm",
                isDark ? "text-white" : "text-gray-800"
              )}
            >
              {/* Mobile: Analog Clock */}
              <div className="md:hidden">
                <AnalogClock time={currentTime} size={24} />
              </div>

              {/* Desktop: Digital Clock */}
              <span className="hidden md:block text-base md:text-lg font-mono relative z-10">
                {currentTime.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                })}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Notification Panel */}
      <AnimatePresence>
        {showNotifications && (
          <>
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45]"
              onClick={() => setShowNotifications(false)}
            />
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="fixed right-4 top-20 z-50 w-[380px]"
            >
              <div className={cn(
                "rounded-2xl overflow-hidden",
                isDark 
                  ? "bg-black/80 border border-white/10" 
                  : "bg-white/80 border border-black/10",
                "backdrop-blur-xl"
              )}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className={cn(
                      "text-2xl font-semibold",
                      isDark ? "text-white" : "text-black"
                    )}>
                      Notifications
                    </h2>
                    <button
                      className={cn(
                        "text-sm underline-offset-4 hover:underline",
                        isDark ? "text-white/60" : "text-black/60"
                      )}
                      onClick={() => {
                        setNotifications(prev =>
                          prev.map(notif => ({ ...notif, read: true }))
                        );
                      }}
                    >
                      Mark all as read
                    </button>
                  </div>
                  <p className={cn(
                    "text-sm",
                    isDark ? "text-white/60" : "text-black/60"
                  )}>
                    Stay updated with your latest activities
                  </p>
                </div>
                
                <div className={cn(
                  "p-6 border-t max-h-[400px] overflow-y-auto",
                  isDark ? "border-white/10" : "border-black/10"
                )}>
                  {notifications.length > 0 ? (
                    <div className="space-y-4">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification.id)}
                          className={cn(
                            "p-4 rounded-xl",
                            isDark 
                              ? "hover:bg-white/10" 
                              : "hover:bg-black/10",
                            !notification.read && (
                              isDark 
                                ? "bg-white/5" 
                                : "bg-black/5"
                            ),
                            "transition-colors cursor-pointer"
                          )}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <h3 className={cn(
                              "text-sm font-medium",
                              isDark ? "text-white" : "text-black"
                            )}>
                              {notification.title}
                            </h3>
                            <span className={cn(
                              "text-xs",
                              isDark ? "text-white/40" : "text-black/40"
                            )}>
                              {formatRelativeTime(notification.timestamp)}
                            </span>
                          </div>
                          <p className={cn(
                            "text-sm",
                            isDark ? "text-white/60" : "text-black/60"
                          )}>
                            {notification.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={cn(
                      "text-center py-8",
                      isDark ? "text-white/40" : "text-black/40"
                    )}>
                      No new notifications
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Calendar Modal */}
      {showCalendar && (
        <div className="fixed inset-0 z-[100]">
          <div
            className={cn(
              "fixed inset-0",
              "bg-black/60 backdrop-blur-sm"
            )}
            onClick={() => setShowCalendar(false)}
          />
          
          {/* Mobile Calendar */}
          <div className="md:hidden">
            <div className={cn(
              "fixed bottom-0 left-0 right-0",
              "animate-in slide-in-from-bottom duration-500"
            )}>
              <div className={cn(
                isDark 
                  ? "bg-black/80 border-t border-white/10" 
                  : "bg-white/80 border-t border-black/10",
                "backdrop-blur-xl",
                "rounded-t-2xl",
                "overflow-hidden"
              )}>
                <DatePicker onClose={() => setShowCalendar(false)} />
              </div>
            </div>
          </div>

          {/* Desktop Calendar */}
          <div className="hidden md:flex items-center justify-center h-full">
            <div className={cn(
              "animate-in fade-in-0 slide-in-from-top-4 duration-300",
              isDark 
                ? "bg-black/80 border border-white/10" 
                : "bg-white/80 border border-black/10",
              "backdrop-blur-xl",
              "rounded-2xl",
              "overflow-hidden",
              "w-[380px]"
            )}>
              <DatePicker onClose={() => setShowCalendar(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

