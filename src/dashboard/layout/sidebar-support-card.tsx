import { Link } from "react-router-dom";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/dashboard-ui/card";

export function SidebarSupportCard() {
  return (
    <Card size="sm" className="overflow-hidden shadow-none group-data-[collapsible=icon]:hidden">
      <CardHeader className="min-w-0 px-4">
        <CardTitle className="truncate text-sm">Need a hand?</CardTitle>
        <CardDescription className="line-clamp-2">
          Reach our team any time at{" "}
          <Link to="/contact" className="inline-flex items-center text-foreground underline underline-offset-2">
            team@clerktree.com
          </Link>
          .
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
