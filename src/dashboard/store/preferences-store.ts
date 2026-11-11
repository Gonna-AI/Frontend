import { create } from "zustand";
import { persist } from "zustand/middleware";

import { useTheme as useSiteTheme } from "@/hooks/useTheme";

export type ThemeMode = "light" | "dark" | "system";
type ThemePreset = "default";
type SidebarVariant = "inset" | "sidebar" | "floating";
type SidebarCollapsible = "icon" | "offcanvas";
type ContentLayout = "centered" | "full-width";
type NavbarStyle = "sticky" | "scroll";
type FontKey = "geist" | "inter" | "geistMono";

interface PreferencesValues {
  theme_mode: ThemeMode;
  theme_preset: ThemePreset;
  content_layout: ContentLayout;
  navbar_style: NavbarStyle;
  sidebar_variant: SidebarVariant;
  sidebar_collapsible: SidebarCollapsible;
  font: FontKey;
}

const PREFERENCE_DEFAULTS: PreferencesValues = {
  theme_mode: "light",
  theme_preset: "default",
  content_layout: "full-width",
  navbar_style: "sticky",
  sidebar_variant: "inset",
  sidebar_collapsible: "icon",
  font: "geist",
};

interface PreferencesState {
  values: PreferencesValues;
  setPreference: <K extends keyof PreferencesValues>(key: K, value: PreferencesValues[K]) => void;
  resetPreferences: () => void;
}

function applyResolvedThemeMode(mode: ThemeMode) {
  const systemPrefersDark = typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const shouldBeDark = mode === "dark" || (mode === "system" && systemPrefersDark);

  // The dashboard rides on this project's single global dark/light switch
  // (documentElement.classList('dark')) rather than its own separate theme
  // system, so the rest of the site and the dashboard never disagree about
  // which mode is active.
  const site = useSiteTheme.getState();
  if (site.isDark !== shouldBeDark) {
    site.toggleTheme();
  }
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      values: PREFERENCE_DEFAULTS,
      setPreference: (key, value) => {
        set((state) => ({ values: { ...state.values, [key]: value } }));
        if (key === "theme_mode") {
          applyResolvedThemeMode(value as ThemeMode);
        }
      },
      resetPreferences: () => {
        set({ values: PREFERENCE_DEFAULTS });
        applyResolvedThemeMode(PREFERENCE_DEFAULTS.theme_mode);
      },
    }),
    {
      name: "dashboard-preferences",
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        state.values = {
          ...state.values,
          theme_mode: state.values.theme_mode === "dark" ? "dark" : "light",
          theme_preset: "default",
          font: "geist",
        };
        applyResolvedThemeMode(state.values.theme_mode);
      },
    },
  ),
);
