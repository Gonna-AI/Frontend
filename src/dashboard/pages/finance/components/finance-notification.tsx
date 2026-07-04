import { AlertTriangle } from "lucide-react-dash";

import { Button } from "@/components/dashboard-ui/button";
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/dashboard-ui/item";

export function FinanceNotification() {
  return (
    <Item className="rounded-xl" variant="outline">
      <ItemMedia variant="icon">
        <AlertTriangle />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Payment terms silently changed</ItemTitle>
        <ItemDescription>
          "30 Tage netto" → "60 Tage netto" in prose, not visually flagged in the document (confidence 0.62).
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button size="sm" variant="outline">
          View details
        </Button>
      </ItemActions>
    </Item>
  );
}
