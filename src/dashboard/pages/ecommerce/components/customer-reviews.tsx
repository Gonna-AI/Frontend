import { ArrowLeft, ArrowRight, ArrowUpRight, Star } from "lucide-react-dash";

import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount } from "@/components/dashboard-ui/avatar";
import { Button } from "@/components/dashboard-ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/dashboard-ui/card";

const customerInitials = ["EM", "OW", "NO", "MM"] as const;

export function CustomerReviews() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-normal text-muted-foreground text-sm">Kundenfeedback</CardTitle>
        <CardDescription className="text-foreground text-xl tabular-nums leading-none tracking-tight">
          4.6 average rating
        </CardDescription>
        <CardAction>
          <ArrowUpRight className="size-4" />
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="rounded-lg bg-muted p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-2">
              <div className="flex gap-0.5 text-foreground">
                <Star className="size-3.5 fill-current" />
                <Star className="size-3.5 fill-current" />
                <Star className="size-3.5 fill-current" />
                <Star className="size-3.5 fill-current" />
                <Star className="size-3.5 fill-current" />
              </div>
              <div>
                <div className="font-medium text-sm">Bergmann Maschinenbau GmbH</div>
                <p className="mt-2 line-clamp-3 min-h-[4.5em] text-muted-foreground text-sm">
                  Der Kostencheck hat die Zahlungsbedingungen-Abweichung vor der AB erkannt — hätte uns sonst Wochen gekostet.
                </p>
              </div>
            </div>

            <div className="flex gap-1">
              <Button aria-label="Previous review" size="icon-xs" variant="outline">
                <ArrowLeft />
              </Button>
              <Button aria-label="Next review" size="icon-xs" variant="outline">
                <ArrowRight />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-lg border px-4 py-3">
          <div className="min-w-0">
            <div className="font-medium text-sm">128 Rückmeldungen</div>
            <div className="line-clamp-2 min-h-[3em] text-muted-foreground text-xs">Kunden bewertet diesen Monat</div>
          </div>

          <AvatarGroup>
            {customerInitials.map((initials) => (
              <Avatar key={initials}>
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            ))}

            <AvatarGroupCount>+42</AvatarGroupCount>
          </AvatarGroup>
        </div>
      </CardContent>
    </Card>
  );
}
