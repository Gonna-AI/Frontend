import { Box, Container, Filter, PlusCircle, RefreshCw, Search, Server, Settings } from "lucide-react-dash";

import { Badge } from "@/components/dashboard-ui/badge";
import { Button } from "@/components/dashboard-ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/dashboard-ui/input-group";
import { Kbd } from "@/components/dashboard-ui/kbd";

export function InfrastructureHeader() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="font-medium text-2xl leading-tight tracking-tight sm:text-3xl sm:leading-none">
              Live Stack
            </h1>
            <p className="text-muted-foreground text-sm">
              Real-time health of the Kostencheck Copilot pipeline: worker, inference, and database.
            </p>
          </div>

          <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
            <span className="whitespace-nowrap text-muted-foreground text-sm">Last updated: 30s ago</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon-sm">
                <RefreshCw />
              </Button>
              <Button variant="outline" size="icon-sm">
                <Settings data-icon="inline-start" />
              </Button>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="h-auto gap-1 rounded-sm px-1.5 py-0.5">
            <Container />3 Services
          </Badge>
          <Badge variant="outline" className="h-auto gap-1 rounded-sm px-1.5 py-0.5">
            <Box />
            5 Components
          </Badge>
          <Badge variant="outline" className="h-auto gap-1 rounded-sm px-1.5 py-0.5">
            <Server />
            1 Worker Node
          </Badge>
          <Badge variant="outline" className="h-auto gap-1 rounded-sm px-1.5 py-0.5">
            <span className="size-2 rounded-full bg-green-600 dark:bg-green-500" />
            99.98% Uptime (30d)
          </Badge>
        </div>
      </div>

      <div className="flex flex-col gap-3 xl:flex-row">
        <InputGroup className="flex-1">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput placeholder="Search by service or endpoint..." />
          <InputGroupAddon align="inline-end">
            <Kbd>⌘ K</Kbd>
          </InputGroupAddon>
        </InputGroup>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline">
            <PlusCircle data-icon="inline-start" />
            Worker
          </Button>
          <Button variant="outline">
            <PlusCircle data-icon="inline-start" />
            Inference
          </Button>
          <Button variant="outline">
            <PlusCircle data-icon="inline-start" />
            Database
          </Button>
          <Button variant="outline">
            <PlusCircle data-icon="inline-start" />
            Queue Stage
          </Button>
          <Button variant="outline">
            <PlusCircle data-icon="inline-start" />
            Environment
          </Button>
          <Button variant="outline">
            <Filter data-icon="inline-start" />
            Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
