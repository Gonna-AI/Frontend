import React from 'react';
import { Users, MessageSquare, Brain, Calendar } from 'lucide-react';
import AnalyticsCard from './AnalyticsCard';

interface AnalyticsCardsProps {
  totalClients: number;
  totalConversations: number;
  kbItems: number;
  dailyConversations: number;
}

export default function AnalyticsCards({ 
  totalClients,
  totalConversations,
  kbItems,
  dailyConversations
}: AnalyticsCardsProps) {
  const analyticsData = [
    { 
      title: 'Total Users',
      value: totalClients.toString(),
      icon: Users
    },
    {
      title: 'Total Conversations',
      value: totalConversations.toString(),
      icon: MessageSquare
    },
    {
      title: 'Knowledge Base Items',
      value: kbItems.toString(),
      icon: Brain
    },
    {
      title: 'Daily Conversations',
      value: dailyConversations.toString(),
      icon: Calendar
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {analyticsData.map((item) => (
        <AnalyticsCard key={item.title} {...item} />
      ))}
    </div>
  );
}              