import React from "react";
import { LucideIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../../../hooks/useTheme";
import { cn } from "../../../utils/cn";

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  to?: string;
  isExpanded: boolean;
  onClick?: () => void;
}

export default function SidebarItem({
  icon: Icon,
  label,
  to,
  isExpanded,
  onClick,
}: SidebarItemProps) {
  const { isDark } = useTheme();
  const location = useLocation();
  const isActive = to ? location.pathname === to : false;

  const commonClasses = cn(
    "w-full px-4 py-2 rounded-lg flex items-center gap-3",
    "transition-colors duration-300",
    isDark
      ? "hover:bg-white/5 text-white/80 hover:text-white"
      : "hover:bg-black/5 text-black/80 hover:text-black",
    isActive && (isDark ? "bg-white/10" : "bg-black/10"),
  );

  const content = (
    <div className="flex items-center">
      <Icon className="w-5 h-5" />
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isExpanded ? "w-[180px] ml-3" : "w-0 ml-0",
        )}
      >
        <span
          className={cn(
            "inline-block whitespace-nowrap transition-opacity duration-200",
            isExpanded ? "opacity-100" : "opacity-0",
          )}
        >
          {label}
        </span>
      </div>
    </div>
  );

  return to ? (
    <Link to={to} className={commonClasses}>
      {content}
    </Link>
  ) : (
    <button onClick={onClick} className={commonClasses}>
      {content}
    </button>
  );
}
