import { Ellipsis } from "lucide-react-dash";

import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/dashboard-ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/dashboard-ui/table";

const pages = [
  { bounce: "2.1%", path: "QTY_CHANGED — Mengenänderung", time: "41%", views: "1,024" },
  { bounce: "1.4%", path: "PRICE_CHANGED — Preisänderung", time: "27%", views: "672" },
  { bounce: "3.8%", path: "REMOVED — Position fehlt", time: "18%", views: "448" },
  { bounce: "5.2%", path: "CLAUSE_CHANGED — Klauseländerung", time: "11%", views: "274" },
  { bounce: "0.6%", path: "ADDED — Position hinzugefügt", time: "3%", views: "76" },
];

export function TopPages() {
  return (
    <Card className="h-full gap-2">
      <CardHeader>
        <CardTitle className="font-normal">Most-Flagged Deviation Types</CardTitle>
        <CardAction>
          <Ellipsis className="size-4" />
        </CardAction>
      </CardHeader>

      <CardContent className="px-0">
        <Table className="[&_td:first-child]:pl-4 [&_td:last-child]:pr-4 [&_th:first-child]:pl-4 [&_th:last-child]:pr-4">
          <TableHeader className="[&_tr]:border-border/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-8" />
              <TableHead className="h-8 w-24 text-right font-normal">Count</TableHead>
              <TableHead className="h-8 w-24 text-right font-normal">Share</TableHead>
              <TableHead className="h-8 w-20 text-right font-normal">False Positives</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="[&_tr]:border-border/50">
            {pages.map((page) => (
              <TableRow className="hover:bg-transparent" key={page.path}>
                <TableCell className="max-w-0 truncate py-4 font-medium">{page.path}</TableCell>
                <TableCell className="text-right tabular-nums">{page.views}</TableCell>
                <TableCell className="text-right text-muted-foreground tabular-nums">{page.time}</TableCell>
                <TableCell className="text-right text-muted-foreground tabular-nums">{page.bounce}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
