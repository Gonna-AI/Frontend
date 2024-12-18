import { 
  BarChart2, 
  Brain,
  User, 
  CreditCard, 
  Settings
} from 'lucide-react';
import { MenuItem } from '../types/navigation';

export const menuItems: MenuItem[] = [
  { icon: BarChart2, label: 'Dashboard', id: 'dashboard' },
  { icon: Brain, label: 'AI Settings', id: 'ai-settings' },
  { icon: User, label: 'Profile', id: 'profile' },
  { icon: CreditCard, label: 'Billing', id: 'billing' },
  { icon: Settings, label: 'Settings', id: 'settings' },
];