import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/dashboard-ui/button";
import { useTheme } from "@/hooks/useTheme";

export function ThemeSwitcher() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={toggleTheme}
      aria-label={`Currently ${isDark ? "dark" : "light"} mode. Click to toggle.`}
    >
      {isDark ? <Sun /> : <Moon />}
    </Button>
  );
}
