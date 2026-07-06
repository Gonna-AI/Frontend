import type React from "react";

import type { useLanguage } from "@/contexts/LanguageContext";

import type { OrderFilter } from "./schema";

const filterDisplayKeys: Record<OrderFilter, string> = {
  All: "dashEcommerce.orders.filter.all",
  "Needs action": "dashEcommerce.orders.filter.needsAction",
  Unfulfilled: "dashEcommerce.orders.filter.unfulfilled",
  Unpaid: "dashEcommerce.orders.filter.unpaid",
  Returns: "dashEcommerce.orders.filter.returns",
};

export function formatOrderCount(filter: OrderFilter, count: number, t: ReturnType<typeof useLanguage>["t"]) {
  if (filter === "All") {
    return t("dashEcommerce.orders.count.all").replace("{count}", count.toLocaleString());
  }

  if (filter === "Needs action") {
    return t("dashEcommerce.orders.count.needsAction").replace("{count}", count.toLocaleString());
  }

  if (filter === "Returns") {
    return count === 1
      ? t("dashEcommerce.orders.count.return").replace("{count}", count.toLocaleString())
      : t("dashEcommerce.orders.count.returns").replace("{count}", count.toLocaleString());
  }

  return t("dashEcommerce.orders.count.generic")
    .replace("{count}", count.toLocaleString())
    .replace("{filter}", t(filterDisplayKeys[filter]).toLowerCase());
}

export function formatSelectedOrderCount(count: number, t: ReturnType<typeof useLanguage>["t"]) {
  return t("dashEcommerce.orders.count.selected").replace("{count}", count.toLocaleString());
}

export function preventPaginationNavigation(event: React.MouseEvent<HTMLAnchorElement>) {
  event.preventDefault();
}
