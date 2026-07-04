import { Monitor, Moon, Sun } from "lucide-react-dash";

import { Button } from "@/components/dashboard-ui/button";
import { usePreferencesStore } from "@/dashboard/store/preferences-store";

const THEME_CYCLE = ["light", "dark", "system"] as const;

export function ThemeSwitcher() {
  const themeMode = usePreferencesStore((s) => s.values.theme_mode);
  const setPreference = usePreferencesStore((s) => s.setPreference);

  const cycleTheme = () => {
    const currentIndex = THEME_CYCLE.indexOf(themeMode);
    const nextTheme = THEME_CYCLE[(currentIndex + 1) % THEME_CYCLE.length];

    setPreference("theme_mode", nextTheme);
  };

  return (
    <Button size="icon" variant="ghost" onClick={cycleTheme} aria-label={`Current theme: ${themeMode}. Click to cycle themes`}>
      {themeMode === "system" && <Monitor />}
      {themeMode === "dark" && <Sun />}
      {themeMode === "light" && <Moon />}
    </Button>
  );
}
