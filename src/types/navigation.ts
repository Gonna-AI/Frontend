export type ViewType = 'home' | 'dashboard' | 'chatbot';

export interface MenuItem {
  icon: React.ComponentType;
  label: string;
  id: ViewType;
}