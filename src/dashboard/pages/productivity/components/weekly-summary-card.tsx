import { Button } from "@/components/dashboard-ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/dashboard-ui/card";
import { Progress } from "@/components/dashboard-ui/progress";

export function WeeklySummaryCard() {
  return (
    <Card className="shadow-xs">
      <CardHeader>
        <CardTitle>Stunden eingespart durch Automatisierung</CardTitle>
        <CardAction>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            View all
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-muted-foreground">Trending upward — the Kostencheck Copilot is catching more automatically each week.</p>
        <div className="flex flex-col gap-2">
          <div className="font-medium">18.5 Stunden diese Woche eingespart</div>
          <Progress value={78} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}
