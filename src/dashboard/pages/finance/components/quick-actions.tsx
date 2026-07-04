import {
  ChevronRight,
  ClipboardList,
  FileCheck2,
  FileClock,
  FileSearch,
  FileText,
  MoreHorizontal,
  RefreshCw,
  Send,
} from "lucide-react-dash";

import { Avatar, AvatarFallback } from "@/components/dashboard-ui/avatar";
import { Button } from "@/components/dashboard-ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/dashboard-ui/card";
import { Field } from "@/components/dashboard-ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/dashboard-ui/input-group";

const contacts = [
  { id: 1, initials: "AL" },
  { id: 2, initials: "PTL" },
  { id: 3, initials: "MJ" },
  { id: 4, initials: "ED" },
];

const shortcuts = [
  { id: 1, label: "Zusammenfassung", icon: FileText },
  { id: 2, label: "KickOff-Brief", icon: Send },
  { id: 3, label: "Abweichungsbericht", icon: FileSearch },
  { id: 4, label: "AB-Entwurf", icon: FileCheck2 },
  { id: 5, label: "Re-run diff", icon: RefreshCw },
  { id: 6, label: "Review queue", icon: ClipboardList },
  { id: 7, label: "Pending", icon: FileClock },
  { id: 8, label: "More", icon: MoreHorizontal },
];

export function QuickActions() {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="font-normal">Send to AL/PTL</CardTitle>
          <CardAction>
            <div className="flex items-center gap-1">
              <div className="flex -space-x-2">
                {contacts.map((contact) => (
                  <Avatar key={contact.id} className="size-7 border-2 border-background">
                    <AvatarFallback className="text-[10px]">{contact.initials}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <ChevronRight className="size-4" />
            </div>
          </CardAction>
        </CardHeader>
        <CardContent>
          <Field orientation="horizontal">
            <InputGroup>
              <InputGroupAddon>
                <InputGroupText>#</InputGroupText>
              </InputGroupAddon>
              <InputGroupInput placeholder="B-88431" />
              <InputGroupAddon align="inline-end">
                <InputGroupText>Order</InputGroupText>
              </InputGroupAddon>
            </InputGroup>
            <Button>Send</Button>
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-normal">Generated Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {shortcuts.map((shortcut) => {
              const Icon = shortcut.icon;
              return (
                <div key={shortcut.id} className="flex flex-col items-center gap-2.5">
                  <Button variant="outline" className="size-12 rounded-full">
                    <Icon className="size-5" />
                  </Button>
                  <span className="text-center text-muted-foreground text-xs">{shortcut.label}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
