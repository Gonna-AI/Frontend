import { BookOpenCheck, Megaphone, Plus } from "lucide-react-dash";

import { Button } from "@/components/dashboard-ui/button";

import { AssignmentStatus } from "./components/assignment-status";
import { ClassSchedule } from "./components/class-schedule";
import { KpiCards } from "./components/kpi-cards";
import { PerformanceHighlights } from "./components/performance-highlights";
import { UpcomingEvents } from "./components/upcoming-events";

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight">Project Memory</h1>
          <p className="text-muted-foreground text-sm">
            Good morning, Anna. Here's a quick overview of the RAG index across historical projects.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:w-fit">
          <Button size="sm">
            <Megaphone />
            New Query
          </Button>
          <Button size="sm" variant="outline">
            <BookOpenCheck />
            Project Log
          </Button>
          <Button size="sm" variant="outline">
            <Plus />
            Reindex Project
          </Button>
        </div>
      </div>

      <KpiCards />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-5">
          <ClassSchedule />
        </div>
        <div className="xl:col-span-7">
          <AssignmentStatus />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <PerformanceHighlights />
        </div>
        <div className="xl:col-span-4">
          <UpcomingEvents />
        </div>
      </div>
    </div>
  );
}
