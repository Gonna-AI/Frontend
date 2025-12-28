'use client'

import React, { useState, useEffect } from 'react';
import { Menu, Bell } from 'lucide-react';
import DatePicker from '../DatePicker';
import { cn } from '../../utils/cn';
import { useTheme } from '../../hooks/useTheme';
import { motion, AnimatePresence } from 'framer-motion';
import AnalogClock from '../AnalogClock';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../../config/api';
import { useLanguage } from '../../contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

interface HeaderProps {
  onMobileMenuClick: () => void;
}

// Add interface for API notification type
interface Notification {
  id: number;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export default function Header({ onMobileMenuClick }: HeaderProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { isDark } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  // Replace MOCK_NOTIFICATIONS with API call
  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await notificationsApi.getAll();
      return response.data.notifications;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Mutation for marking single notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      await notificationsApi.markAsRead([notificationId]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Mutation for marking all notifications as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const notificationIds = notifications.map(n => n.id);
      await notificationsApi.markAsRead(notificationIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setShowNotifications(false); // Close notification panel
    },
  });

  // Handle notification click
  const handleNotificationClick = async (id: number) => {
    await markAsReadMutation.mutate(id);
  };

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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 464 468"
              className="w-11 h-11 -ml-1" // Size remains the same
              aria-label="ClerkTree Logo"
            >
              <path
                fill={isDark ? "white" : "black"} // Solid color based on theme
                d="M275.9 63.5c37.7 5.3 76.6 24.1 103.7 50.2 30 28.8 41.8 57.6 35.8 87.1-6.1 30.1-33.6 52.9-70.6 58.3-6 0.9-18.3 1-44.9 0.6l-36.6-0.7-0.5 17.8c-0.3 9.7-0.4 17.8-0.4 17.9 0.1 0.1 19.1 0.3 42.2 0.4 23.2 0 42.7 0.5 43.5 1 1.2 0.7 1.1 2.2-0.8 9.4-6 23-20.5 42.1-41.8 55-7.3 4.3-26.7 11.9-36 14.1-9 2-34 2-44.5 0-41.3-7.9-74.2-38-82.9-75.7-8.1-35.7 2.2-71.5 27.5-94.7 16.1-14.9 35.5-22.4 63.7-24.7l7.7-0.7v-34.1l-11.7 0.7c-22.2 1.3-37 5.3-56.4 15.2-28.7 14.6-49.7 39.3-59.9 70.2-9.6 29.3-9.3 62.6 0.8 91.4 3.3 9.2 12.2 25.6 18.3 33.8 11.3 14.9 30.6 30.8 48.7 39.9 19.9 10 49.2 15.9 73.2 14.7 26.5-1.3 52.5-9.6 74.2-23.9 26.9-17.6 47.2-47.9 53.3-79.7 1-5.2 2.3-10.1 2.8-10.8 0.8-0.9 6.9-1.2 27.1-1l26.1 0.3 0.3 3.8c1.2 14.6-10.9 52.1-23.9 74-17.8 30-43.2 54-75.9 71.5-20.9 11.2-38.3 16.5-67.2 20.7-27.6 3.9-47.9 3.1-75.8-3.1-36.9-8.3-67.8-25.6-97.1-54.6-23.6-23.2-44.8-61.9-51.7-93.8-5.1-23.7-5.5-28.1-4.9-48.8 1.7-63.2 23.4-111.8 67.7-152 28-25.4 60.4-41.3 99-48.8 18.5-3.6 46.1-4 67.9-0.9zm16.4 92.6c-6.3 2.4-12.8 8.5-15.4 14.5-2.6 6.1-2.6 18.3 0 23.9 5 11 20.2 17.7 32.3 14.1 11.9-3.4 19.8-14.3 19.8-27.1-0.1-19.9-18.2-32.5-36.7-25.4z"
              />
            </svg>
            <span className={cn(
              "text-xl md:text-2xl font-bold",
              isDark ? "text-white" : "text-black"
            )}>
              ClerkTree
            </span>
          </div>

          {/* Mobile: Empty space */}
          <div className="flex-1 md:hidden" />

          {/* Notification and Clock Container */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher isExpanded={true} />

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
                      {t('header.notifications')}
                    </h2>
                    {notifications.length > 0 && (
                      <button
                        className={cn(
                          "text-sm underline-offset-4 hover:underline",
                          isDark ? "text-white/60" : "text-black/60"
                        )}
                        onClick={() => markAllAsReadMutation.mutate()}
                        disabled={markAllAsReadMutation.isPending}
                      >
                        {t('header.markAllRead')}
                      </button>
                    )}
                  </div>
                  <p className={cn(
                    "text-sm",
                    isDark ? "text-white/60" : "text-black/60"
                  )}>
                    {t('header.stayUpdated')}
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
                            !notification.is_read && (
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
                              {notification.type.toUpperCase()}
                            </h3>
                            <span className={cn(
                              "text-xs",
                              isDark ? "text-white/40" : "text-black/40"
                            )}>
                              {formatRelativeTime(new Date(notification.created_at))}
                            </span>
                          </div>
                          <p className={cn(
                            "text-sm",
                            isDark ? "text-white/60" : "text-black/60"
                          )}>
                            {notification.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={cn(
                      "text-center py-8",
                      isDark ? "text-white/40" : "text-black/40"
                    )}>

                      {t('header.noNotifications')}
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

