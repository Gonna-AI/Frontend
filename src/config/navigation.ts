import { Home, MessageSquare, LayoutDashboard } from 'lucide-react';

export const menuItems = [
  {
    id: 'home',
    icon: Home,
    label: 'Home',
    path: '/'
  },
  {
    id: 'dashboard',
    icon: LayoutDashboard,
    label: 'Dashboard',
    path: '/dashboard'
  },
  {
    id: 'chatbot',
    icon: MessageSquare,
    label: 'Chatbot',
    path: '/user'
  }
] as const;