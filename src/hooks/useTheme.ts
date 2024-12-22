import { create } from 'zustand';

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
}

export const useTheme = create<ThemeState>((set) => ({
  isDark: localStorage.getItem('theme') === 'dark' || 
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches),
  toggleTheme: () => {
    set((state) => {
      const newTheme = !state.isDark;
      localStorage.setItem('theme', newTheme ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', newTheme);
      return { isDark: newTheme };
    });
  },
}));