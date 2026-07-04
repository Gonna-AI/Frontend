
import { Download } from "lucide-react-dash";

import { Button } from "@/components/dashboard-ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/dashboard-ui/card";

import customersData from "./data.json";
import type { RecentCustomerRow } from "./recent-customers-table/schema";
import { RecentCustomersTable } from "./recent-customers-table/table";

const customers = customersData as RecentCustomerRow[];

export function SubscriberOverview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="leading-none">Active & Recent Projects</CardTitle>
        <CardDescription>
          Bestellung-vs-Angebot comparisons across THD GmbH, Weber Präzisionstechnik, and MK Anlagenbau — with
          company, review status, and severity.
        </CardDescription>
        <CardAction>
          <Button variant="outline" size="sm">
            <Download />
            Export
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="pt-0">
        <RecentCustomersTable data={customers} />
      </CardContent>
    </Card>
  );
}
