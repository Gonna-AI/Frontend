import React from 'react';
import { Users, MessageSquare, Brain, Zap } from 'lucide-react';
import AnalyticsCard from './AnalyticsCard';

const analyticsData = [
  { 
    title: 'Total Users',
    value: '1,234',
    change: 12.5,
    icon: Users
  },
  {
    title: 'AI Conversations',
    value: '8,567',
    change: 23.1,
    icon: MessageSquare
  },
  {
    title: 'Knowledge Base Items',
    value: '456',
    change: 8.3,
    icon: Brain
  },
  {
    title: 'Average Response Time',
    value: '1.2s',
    change: -15.4,
    icon: Zap
  }
];

export default function AnalyticsCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {analyticsData.map((item) => (
        <AnalyticsCard key={item.title} {...item} />
      ))}
    </div>
  );
}              