import { Home, Settings, User, CreditCard, Bot, MessageSquare, FileCheck, Brain } from 'lucide-react';

export const menuItems = [
  {
    id: 'dashboard',
    icon: Home,
    label: 'Dashboard',
    path: '/dashboard'
  },
  {
    id: 'documents',
    icon: FileCheck,
    label: 'Documents',
    path: '/documents'
  },
  {
    id: 'ai-settings',
    icon: Brain,
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