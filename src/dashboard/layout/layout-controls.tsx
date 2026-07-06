import { Settings } from "lucide-react-dash";

import { Button } from "@/components/dashboard-ui/button";
import { Label } from "@/components/dashboard-ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/dashboard-ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/components/dashboard-ui/toggle-group";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePreferencesStore, type ThemeMode } from "@/dashboard/store/preferences-store";

export function LayoutControls() {
  const values = usePreferencesStore((s) => s.values);
  const setPreference = usePreferencesStore((s) => s.setPreference);
  const { t } = useLanguage();

  const { theme_mode: themeMode } = values;

  const onThemeModeChange = (mode: ThemeMode | "") => {
    if (!mode) return;
    setPreference("theme_mode", mode);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="icon" variant="ghost">
          <Settings />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end">
        <div className="flex flex-col gap-5">
          <div className="space-y-1.5">
            <h4 className="font-medium text-sm leading-none">{t("dashShell.layoutControls.preferencesTitle")}</h4>
            <p className="text-muted-foreground text-xs">{t("dashShell.layoutControls.displayDesc")}</p>
          </div>
          <div className="space-y-3 **:data-[slot=toggle-group]:w-full **:data-[slot=toggle-group-item]:flex-1 **:data-[slot=toggle-group-item]:text-xs">
            <div className="space-y-1">
              <Label className="font-medium text-xs">{t("dashShell.layoutControls.themeMode")}</Label>
              <ToggleGroup
                size="sm"
                variant="outline"
                type="single"
                value={themeMode === "system" ? "light" : themeMode}
                onValueChange={onThemeModeChange}
              >
                <ToggleGroupItem value="light" aria-label={t("dashShell.layoutControls.toggleLight")}>
                  {t("dashShell.layoutControls.light")}
                </ToggleGroupItem>
                <ToggleGroupItem value="dark" aria-label={t("dashShell.layoutControls.toggleDark")}>
                  {t("dashShell.layoutControls.dark")}
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
