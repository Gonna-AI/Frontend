import * as React from "react";
import { useNavigate } from "react-router-dom";

import { Search } from "lucide-react-dash";

import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/dashboard-ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/dashboard-ui/command";
import type { NavMainItem } from "@/dashboard/navigation/sidebar-items";
import { sidebarItems } from "@/dashboard/navigation/sidebar-items";

type SearchItem = {
  id: string;
  groupKey: string;
  labelKey: string;
  url: string;
  icon?: NavMainItem["icon"];
  disabled?: boolean;
  newTab?: boolean;
};

const OTHER_GROUP_KEY = "dashShell.search.otherGroup";

const sidebarGroupTitleKeys = new Set(sidebarItems.flatMap((group) => (group.labelKey ? [group.labelKey] : [])));

function getSubItemGroupKey(groupLabelKey: string | undefined, itemTitleKey: string) {
  return sidebarGroupTitleKeys.has(itemTitleKey) ? (groupLabelKey ?? OTHER_GROUP_KEY) : itemTitleKey;
}

const searchItems: SearchItem[] = sidebarItems.flatMap((group) =>
  group.items.flatMap((item) => {
    if (item.subItems) {
      return item.subItems.map((sub) => ({
        id: sub.id,
        groupKey: getSubItemGroupKey(group.labelKey, item.titleKey),
        labelKey: sub.titleKey,
        url: sub.url,
        icon: item.icon,
        disabled: sub.disabled,
        newTab: sub.newTab,
      }));
    }
    return [
      {
        id: item.id,
        groupKey: group.labelKey ?? OTHER_GROUP_KEY,
        labelKey: item.titleKey,
        url: item.url,
        icon: item.icon,
        disabled: item.disabled,
        newTab: item.newTab,
      },
    ];
  }),
);

function getAvailableItems(items: SearchItem[]) {
  return items.filter((item) => !item.disabled && !item.url.includes("coming-soon"));
}

const recommendations = getAvailableItems(searchItems);

function groupBy(items: SearchItem[]) {
  const groupKeys = [...new Set(items.map((item) => item.groupKey))];
  return groupKeys.map((groupKey) => ({
    groupKey,
    items: items.filter((item) => item.groupKey === groupKey),
  }));
}

export function SearchDialog() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const navigate = useNavigate();
  const { t } = useLanguage();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) setQuery("");
  };

  const handleSelect = (item: SearchItem) => {
    if (item.disabled) return;
    handleOpenChange(false);
    if (item.newTab) {
      window.open(item.url, "_blank", "noopener,noreferrer");
    } else {
      navigate(item.url);
    }
  };

  const renderGroups = (items: SearchItem[]) =>
    groupBy(items).map(({ groupKey, items: groupItems }, index) => {
      const groupLabel = t(groupKey);
      return (
        <React.Fragment key={groupKey}>
          {index > 0 && <CommandSeparator />}
          <CommandGroup heading={groupLabel}>
            {groupItems.map((item) => {
              const itemLabel = t(item.labelKey);
              return (
                <CommandItem
                  disabled={item.disabled}
                  key={`${groupKey}-${item.id}`}
                  value={`${groupLabel} ${itemLabel}`}
                  onSelect={() => handleSelect(item)}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    {item.icon && <item.icon />}
                    <span className="truncate">{itemLabel}</span>
                  </span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </React.Fragment>
      );
    });

  return (
    <>
      <Button
        onClick={() => handleOpenChange(true)}
        variant="link"
        className="px-0! font-normal text-muted-foreground hover:no-underline"
      >
        <Search data-icon="inline-start" />
        {t("dashShell.search.button")}
        <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-medium text-[10px]">
          <span className="text-xs">⌘</span>J
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={handleOpenChange}>
        <Command>
          <CommandInput placeholder={t("dashShell.search.placeholder")} value={query} onValueChange={setQuery} />
          <CommandList>
            <CommandEmpty>{t("dashShell.search.noResults")}</CommandEmpty>
            {query ? renderGroups(searchItems) : renderGroups(recommendations)}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
