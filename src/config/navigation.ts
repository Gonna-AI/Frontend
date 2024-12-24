import { Home, Settings, User, CreditCard, Bot } from 'lucide-react';

export const menuItems = [
  {
    id: 'dashboard',
    icon: Home,
    label: 'Dashboard',
    path: '/dashboard'
  },
  {
    id: 'ai-settings',
    icon: Bot,
    label: 'AI Settings',
    path: '/ai-settings'
  },
  {
    id: 'profile',
    icon: User,
    label: 'Profile',
    path: '/profile'
  },
  {
    id: 'billing',
    icon: CreditCard,
    label: 'Billing',
    path: '/billing'
  },
  {
    id: 'settings',
    icon: Settings,
    label: 'Settings',
    path: '/settings'
  }
] as const;