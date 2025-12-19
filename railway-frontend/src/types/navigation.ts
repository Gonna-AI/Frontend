export type ViewType = 'dashboard' | 'ai-settings' | 'profile' | 'billing' | 'settings';

export interface MenuItem {
  icon: React.ComponentType;
  label: string;
  id: ViewType;
}