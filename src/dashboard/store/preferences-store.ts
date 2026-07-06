import { create } from "zustand";
import { persist } from "zustand/middleware";

import { useTheme as useSiteTheme } from "@/hooks/useTheme";

export type ThemeMode = "light" | "dark" | "system";
export type ThemePreset = "default" | "tangerine" | "brutalist" | "soft-pop";
export type SidebarVariant = "inset" | "sidebar" | "floating";
export type SidebarCollapsible = "icon" | "offcanvas";
export type ContentLayout = "centered" | "full-width";
export type NavbarStyle = "sticky" | "scroll";
export type FontKey =
  | "geist"
  | "inter"
  | "notoSans"
  | "nunitoSans"
  | "figtree"
  | "roboto"
  | "raleway"
  | "dmSans"
  | "publicSans"
  | "outfit"
  | "geistMono"
  | "geistPixelSquare"
  | "jetBrainsMono"
  | "notoSerif"
  | "robotoSlab"
  | "merriweather"
  | "lora"
  | "playfairDisplay";

export const THEME_PRESET_OPTIONS: { value: ThemePreset; label: string; primary: { light: string; dark: string } }[] = [
  { value: "default", label: "Default", primary: { light: "oklch(0.205 0 0)", dark: "oklch(0.922 0 0)" } },
  { value: "tangerine", label: "Tangerine", primary: { light: "oklch(0.64 0.17 36.44)", dark: "oklch(0.64 0.17 36.44)" } },
  { value: "brutalist", label: "Neo Brutalism", primary: { light: "oklch(0.65 0.24 26.97)", dark: "oklch(0.7 0.19 23.19)" } },
  { value: "soft-pop", label: "Soft Pop", primary: { light: "oklch(0.62 0.19 259.81)", dark: "oklch(0.68 0.16 259.49)" } },
];

export const fontOptions: { key: FontKey; label: string }[] = [
  { key: "geist", label: "Geist" },
  { key: "inter", label: "Inter" },
  { key: "notoSans", label: "Noto Sans" },
  { key: "nunitoSans", label: "Nunito Sans" },
  { key: "figtree", label: "Figtree" },
  { key: "roboto", label: "Roboto" },
  { key: "raleway", label: "Raleway" },
  { key: "dmSans", label: "DM Sans" },
  { key: "publicSans", label: "Public Sans" },
  { key: "outfit", label: "Outfit" },
  { key: "geistMono", label: "Geist Mono" },
  { key: "geistPixelSquare", label: "Geist Pixel Square" },
  { key: "jetBrainsMono", label: "JetBrains Mono" },
  { key: "notoSerif", label: "Noto Serif" },
  { key: "robotoSlab", label: "Roboto Slab" },
  { key: "merriweather", label: "Merriweather" },
  { key: "lora", label: "Lora" },
  { key: "playfairDisplay", label: "Playfair Display" },
];

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
