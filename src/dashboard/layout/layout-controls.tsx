import { Settings } from "lucide-react";

import { Button } from "@/components/dashboard-ui/button";
import { Label } from "@/components/dashboard-ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/dashboard-ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/components/dashboard-ui/toggle-group";
import {
  usePreferencesStore,
  type ContentLayout,
  type NavbarStyle,
  type SidebarCollapsible,
  type SidebarVariant,
} from "@/dashboard/store/preferences-store";

export function LayoutControls() {
  const values = usePreferencesStore((s) => s.values);
  const setPreference = usePreferencesStore((s) => s.setPreference);
  const resetPreferences = usePreferencesStore((s) => s.resetPreferences);

  const {
    content_layout: contentLayout,
    navbar_style: navbarStyle,
    sidebar_variant: variant,
    sidebar_collapsible: collapsible,
  } = values;

  const onContentLayoutChange = (layout: ContentLayout | "") => {
    if (!layout) return;
    setPreference("content_layout", layout);
  };

  const onNavbarStyleChange = (style: NavbarStyle | "") => {
    if (!style) return;
    setPreference("navbar_style", style);
  };

  const onSidebarStyleChange = (value: SidebarVariant | "") => {
    if (!value) return;
    setPreference("sidebar_variant", value);
  };

  const onSidebarCollapseModeChange = (value: SidebarCollapsible | "") => {
    if (!value) return;
    setPreference("sidebar_collapsible", value);
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
            <h4 className="font-medium text-sm leading-none">Preferences</h4>
            <p className="text-muted-foreground text-xs">Customize your dashboard layout preferences.</p>
          </div>
          <div className="space-y-3 **:data-[slot=toggle-group]:w-full **:data-[slot=toggle-group-item]:flex-1 **:data-[slot=toggle-group-item]:text-xs">
            <div className="space-y-1">
              <Label className="font-medium text-xs">Page Layout</Label>
              <ToggleGroup
                size="sm"
                variant="outline"
                type="single"
                value={contentLayout}
                onValueChange={onContentLayoutChange}
              >
                <ToggleGroupItem value="centered" aria-label="Toggle centered">
                  Centered
                </ToggleGroupItem>
                <ToggleGroupItem value="full-width" aria-label="Toggle full-width">
                  Full Width
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div className="space-y-1">
              <Label className="font-medium text-xs">Navbar Behavior</Label>
              <ToggleGroup
                size="sm"
                variant="outline"
                type="single"
                value={navbarStyle}
                onValueChange={onNavbarStyleChange}
              >
                <ToggleGroupItem value="sticky" aria-label="Toggle sticky">
                  Sticky
                </ToggleGroupItem>
                <ToggleGroupItem value="scroll" aria-label="Toggle scroll">
                  Scroll
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div className="space-y-1">
              <Label className="font-medium text-xs">Sidebar Style</Label>
              <ToggleGroup
                size="sm"
                variant="outline"
                type="single"
                value={variant}
                onValueChange={onSidebarStyleChange}
              >
                <ToggleGroupItem value="inset" aria-label="Toggle inset">
                  Inset
                </ToggleGroupItem>
                <ToggleGroupItem value="sidebar" aria-label="Toggle sidebar">
                  Sidebar
                </ToggleGroupItem>
                <ToggleGroupItem value="floating" aria-label="Toggle floating">
                  Floating
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div className="space-y-1">
              <Label className="font-medium text-xs">Sidebar Collapse Mode</Label>
              <ToggleGroup
                size="sm"
                variant="outline"
                type="single"
                value={collapsible}
                onValueChange={onSidebarCollapseModeChange}
              >
                <ToggleGroupItem value="icon" aria-label="Toggle icon">
                  Icon
                </ToggleGroupItem>
                <ToggleGroupItem value="offcanvas" aria-label="Toggle offcanvas">
                  OffCanvas
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <Button type="button" size="sm" variant="outline" className="w-full text-xs" onClick={resetPreferences}>
              Restore Defaults
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
