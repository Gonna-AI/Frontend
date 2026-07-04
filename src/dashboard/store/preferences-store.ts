import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SidebarVariant = "inset" | "sidebar" | "floating";
export type SidebarCollapsible = "icon" | "offcanvas";
export type ContentLayout = "centered" | "full-width";
export type NavbarStyle = "sticky" | "scroll";

interface PreferencesValues {
  content_layout: ContentLayout;
  navbar_style: NavbarStyle;
  sidebar_variant: SidebarVariant;
  sidebar_collapsible: SidebarCollapsible;
}

const PREFERENCE_DEFAULTS: PreferencesValues = {
  content_layout: "full-width",
  navbar_style: "sticky",
  sidebar_variant: "inset",
  sidebar_collapsible: "icon",
};

interface PreferencesState {
  values: PreferencesValues;
  setPreference: <K extends keyof PreferencesValues>(key: K, value: PreferencesValues[K]) => void;
  resetPreferences: () => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      values: PREFERENCE_DEFAULTS,
      setPreference: (key, value) =>
        set((state) => ({ values: { ...state.values, [key]: value } })),
      resetPreferences: () => set({ values: PREFERENCE_DEFAULTS }),
    }),
    { name: "dashboard-preferences" },
  ),
);
