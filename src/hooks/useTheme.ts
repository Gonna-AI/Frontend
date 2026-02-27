import { create } from "zustand";

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
}

// Calculate initial theme state
const getInitialTheme = () => {
  if (typeof window === "undefined") return true; // SSR fallback
  const stored = localStorage.getItem("theme");
  if (stored) return stored === "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

// Initialize theme class on document
const initializeThemeClass = (isDark: boolean) => {
  if (typeof document !== "undefined") {
    document.documentElement.classList.toggle("dark", isDark);
  }
};

// Get initial state and apply class immediately
const initialIsDark = getInitialTheme();
initializeThemeClass(initialIsDark);

export const useTheme = create<ThemeState>((set) => ({
  isDark: initialIsDark,
  toggleTheme: () => {
    set((state) => {
      const newTheme = !state.isDark;
      localStorage.setItem("theme", newTheme ? "dark" : "light");
      document.documentElement.classList.toggle("dark", newTheme);
      return { isDark: newTheme };
    });
  },
}));
